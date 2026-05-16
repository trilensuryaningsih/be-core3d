const express = require('express');
const pool = require('../../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// UMK 2026 per kota (dalam rupiah)
const UMK_2026 = {
  Jakarta: 5067381,
  Bandung: 4482914,
  Surabaya: 4908050,
  Yogyakarta: 3200000,
  Medan: 3800000,
  Semarang: 3454827,
  Makassar: 3750000,
  Padang: 2994031,
  Denpasar: 3000000,
  Palembang: 3456874,
};

// Akomodasi default berdasarkan disability type
const ACCOMMODATION_MAP = {
  Tunanetra: [
    'Screen Reader (NVDA/JAWS) tersedia di workstation',
    'Panduan kerja tersedia dalam format audio',
    'Navigasi kantor dengan panduan voice system',
  ],
  Tunarungu: [
    'Sistem visual alert untuk notifikasi',
    'Caption tools aktif di setiap meeting',
    'Komunikasi via teks diprioritaskan',
  ],
  Tunawicara: [
    'Komunikasi via teks/chat diutamakan',
    'AAC (Augmentative and Alternative Communication) tersedia',
    'Tidak ada kewajiban presentasi verbal',
  ],
  'Disabilitas Daksa Tangan': [
    'Voice command software tersedia',
    'Tombol dan UI dioptimalkan untuk keyboard shortcut',
    'Tidak ada aktivitas yang memerlukan fine motor skills intensif',
  ],
  'Disabilitas Daksa Kaki': [
    'Ramp akses dan lift tersedia',
    'Parkir khusus penyandang disabilitas dekat pintu masuk',
    'Opsi kerja remote/hybrid tersedia',
  ],
  'Disabilitas Intelektual': [
    'SOP kerja disajikan dengan format visual bergambar',
    'Mentor/buddy system tersedia',
    'Task management tools disediakan perusahaan',
  ],
  'Disabilitas Mental / Psikososial': [
    'Lingkungan kerja tenang dan tidak bising',
    'Jadwal kerja fleksibel bila diperlukan',
    'Akses ke layanan konseling perusahaan',
  ],
  'Autisme (ASD)': [
    'Lingkungan kerja terstruktur dan konsisten',
    'Tidak ada perubahan mendadak pada alur kerja',
    'Ruang fokus/quiet room tersedia',
  ],
  'Acquired Brain Injury (ABI)': [
    'Jadwal kerja adaptif sesuai kebutuhan',
    'Pengingat dan task management tools disediakan',
    'Dukungan HR untuk akomodasi spesifik tersedia',
  ],
};

// Fungsi hitung match score
function calculateMatch(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return { score: 60, matched: [], gap: [] };

  const candidateLower = candidateSkills.map((s) => s.toLowerCase());
  const requiredLower = requiredSkills.map((s) => s.toLowerCase());

  const matched = requiredSkills.filter((_, i) =>
    candidateLower.some(
      (cs) => cs.includes(requiredLower[i]) || requiredLower[i].includes(cs)
    )
  );
  const gap = requiredSkills.filter((s) => !matched.includes(s));

  // Skor 70% dari match skills + variasi kecil agar tidak terlalu deterministik
  const baseScore = Math.round((matched.length / requiredSkills.length) * 70);
  const bonus = Math.floor(Math.random() * 28) + 2; // 2-30 bonus
  const score = Math.min(baseScore + bonus, 97);

  return { score, matched, gap };
}

// ── POST /api/match ──────────────────────────────────────────────────────────
// Body: { job_id }
// Kandidat melamar & langsung dapat hasil matching
router.post('/', authenticate, authorize('kandidat'), async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) {
    return res.status(400).json({ error: 'job_id wajib diisi' });
  }

  const client = await pool.getConnection();
  try {
    await client.query('BEGIN');

    // Ambil profil kandidat beserta skills & disability
    const [profileResult] = await client.query(
      `SELECT cp.id, u.name, cp.location, cp.functional_profile
       FROM candidate_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.user_id = ?`,
      [req.user.id]
    );
    if (profileResult.length === 0) {
      return res.status(400).json({
        error: 'Lengkapi profil kandidat terlebih dahulu sebelum melamar',
      });
    }
    const candidateProfile = profileResult[0];
    const candidateId = candidateProfile.id;

    const [skillsResult] = await client.query(
      'SELECT skill FROM candidate_skills WHERE candidate_id = ?',
      [candidateId]
    );
    const candidateSkills = skillsResult.map((r) => r.skill);

    const [disabilityResult] = await client.query(
      `SELECT dt.name FROM candidate_disabilities cd
       JOIN disability_types dt ON dt.id = cd.disability_type_id
       WHERE cd.candidate_id = ?`,
      [candidateId]
    );
    const disabilityNames = disabilityResult.map((r) => r.name);

    // Ambil detail lowongan
    const [jobResult] = await client.query(
      `SELECT j.*, cp.company_name
       FROM jobs j
       JOIN company_profiles cp ON cp.id = j.company_id
       WHERE j.id = ?`,
      [job_id]
    );
    if (jobResult.length === 0) {
      return res.status(404).json({ error: 'Lowongan tidak ditemukan' });
    }
    const job = jobResult[0];

    const [jobSkillsResult] = await client.query(
      'SELECT skill FROM job_required_skills WHERE job_id = ?',
      [job_id]
    );
    const requiredSkills = jobSkillsResult.map((r) => r.skill);

    // Hitung match score
    const { score, matched, gap } = calculateMatch(candidateSkills, requiredSkills);

    // Akomodasi berdasarkan disability type kandidat
    let accommodations = [];
    for (const disabilityName of disabilityNames) {
      const acc = ACCOMMODATION_MAP[disabilityName];
      if (acc) accommodations.push(...acc);
    }
    if (accommodations.length === 0) {
      accommodations = ['Konsultasi dengan HR untuk akomodasi spesifik'];
    }

    // Wage Guard - bandingkan dengan UMK kota lowongan
    const umkValue = UMK_2026[job.location] || 4000000;
    const offeredSalaryNum = parseInt(String(job.offered_salary || '0').replace(/\D/g, '')) || 0;
    const wageStatus = offeredSalaryNum >= umkValue ? 'LAYAK' : 'TIDAK LAYAK';
    const wageGap = Math.abs(offeredSalaryNum - umkValue);

    // Simpan / update application
    const appId = require('crypto').randomUUID();
    await client.query(
      `INSERT INTO applications
         (id, candidate_id, job_id, match_score, matched_skills, gap_skills,
          accommodations, wage_status, umk_value, offered_salary, wage_gap)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         match_score = VALUES(match_score),
         matched_skills = VALUES(matched_skills),
         gap_skills = VALUES(gap_skills),
         accommodations = VALUES(accommodations),
         wage_status = VALUES(wage_status),
         umk_value = VALUES(umk_value),
         offered_salary = VALUES(offered_salary),
         wage_gap = VALUES(wage_gap),
         applied_at = NOW()`,
      [
        appId,
        candidateId,
        job_id,
        score,
        JSON.stringify(matched),
        JSON.stringify(gap),
        JSON.stringify(accommodations),
        wageStatus,
        umkValue,
        offeredSalaryNum,
        wageGap,
      ]
    );

    // Fetch the inserted application
    const [appResult] = await client.query('SELECT * FROM applications WHERE candidate_id = ? AND job_id = ?', [candidateId, job_id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      match_result: {
        ...appResult[0],
        job: {
          id: job.id,
          title: job.title,
          company_name: job.company_name,
          location: job.location,
          offered_salary: job.offered_salary,
        },
        candidate: {
          id: candidateId,
          name: candidateProfile.name,
          skills: candidateSkills,
          disability_types: disabilityNames,
        },
        umk_label: `UMK ${job.location} 2026`,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Gagal melakukan matching' });
  } finally {
    client.release();
  }
});

// ── GET /api/match/last ──────────────────────────────────────────────────────
// Hasil matching terakhir kandidat yang login
router.get('/last', authenticate, authorize('kandidat'), async (req, res) => {
  try {
    const [profileResult] = await pool.query(
      'SELECT id FROM candidate_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (profileResult.length === 0) {
      return res.json({ result: null });
    }
    const candidateId = profileResult[0].id;

    const [result] = await pool.query(
      `SELECT a.*, j.title AS job_title, j.location AS job_location,
              j.offered_salary, cp.company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN company_profiles cp ON cp.id = j.company_id
       WHERE a.candidate_id = ?
       ORDER BY a.applied_at DESC
       LIMIT 1`,
      [candidateId]
    );

    res.json({ result: result[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil hasil matching terakhir' });
  }
});

module.exports = router;
