const express = require('express');
const pool = require('../../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('perusahaan'));

// ── GET /api/perusahaan/profile ──────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT cp.id, cp.user_id, u.name AS contact_name, u.email,
              cp.company_name, cp.location, cp.updated_at
       FROM company_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.user_id = ?`,
      [req.user.id]
    );

    if (result.length === 0) {
      return res.json({ profile: null });
    }

    const profile = result[0];
    const [conditions] = await pool.query(
      'SELECT `condition` FROM company_office_conditions WHERE company_id = ?',
      [profile.id]
    );

    res.json({
      profile: {
        ...profile,
        office_conditions: conditions.map((r) => r.condition),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil profil perusahaan' });
  }
});

// ── POST /api/perusahaan/profile ─────────────────────────────────────────────
// Body: { company_name, location, office_conditions: ["Ramp akses", ...] }
router.post('/profile', async (req, res) => {
  const { company_name, location, office_conditions } = req.body;

  if (!company_name || !location) {
    return res.status(400).json({ error: 'Nama perusahaan dan lokasi wajib diisi' });
  }

  const client = await pool.getConnection();
  try {
    await client.query('BEGIN');

    // Update user name juga
    await client.query('UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?', [
      company_name,
      req.user.id,
    ]);

    let companyId;
    const [existing] = await client.query('SELECT id FROM company_profiles WHERE user_id = ?', [req.user.id]);
    if (existing.length > 0) {
      companyId = existing[0].id;
      await client.query(
        `UPDATE company_profiles SET company_name = ?, location = ?, updated_at = NOW() WHERE user_id = ?`,
        [company_name, location, req.user.id]
      );
    } else {
      companyId = require('crypto').randomUUID();
      await client.query(
        `INSERT INTO company_profiles (id, user_id, company_name, location) VALUES (?, ?, ?, ?)`,
        [companyId, req.user.id, company_name, location]
      );
    }

    // Replace office conditions
    await client.query('DELETE FROM company_office_conditions WHERE company_id = ?', [companyId]);
    if (Array.isArray(office_conditions) && office_conditions.length > 0) {
      for (const cond of office_conditions) {
        await client.query(
          `INSERT IGNORE INTO company_office_conditions (company_id, \`condition\`) VALUES (?, ?)`,
          [companyId, cond.trim()]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Profil perusahaan berhasil disimpan', companyId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Gagal menyimpan profil perusahaan' });
  } finally {
    client.release();
  }
});

// ── GET /api/perusahaan/kandidat ─────────────────────────────────────────────
// Semua kandidat yang melamar ke lowongan perusahaan ini
router.get('/kandidat', async (req, res) => {
  try {
    const [companyResult] = await pool.query(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) {
      return res.json({ candidates: [] });
    }
    const companyId = companyResult[0].id;

    const [result] = await pool.query(
      `SELECT candidate_id, candidate_name, location, match_score, wage_status,
              job_id, job_title, applied_at, disability_types
       FROM (
         SELECT cp.id AS candidate_id, u.name AS candidate_name,
                cp.location, a.match_score, a.wage_status,
                j.id AS job_id, j.title AS job_title,
                a.applied_at,
                (SELECT GROUP_CONCAT(dt.name SEPARATOR ', ')
                 FROM candidate_disabilities cd
                 JOIN disability_types dt ON dt.id = cd.disability_type_id
                 WHERE cd.candidate_id = cp.id) AS disability_types,
                ROW_NUMBER() OVER(PARTITION BY cp.id ORDER BY a.match_score DESC) as rn
         FROM applications a
         JOIN candidate_profiles cp ON cp.id = a.candidate_id
         JOIN users u ON u.id = cp.user_id
         JOIN jobs j ON j.id = a.job_id
         WHERE j.company_id = ?
       ) t
       WHERE rn = 1
       ORDER BY match_score DESC`,
      [companyId]
    );

    res.json({ candidates: result });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mengambil daftar kandidat' });
  }
});

// ── GET /api/perusahaan/laporan/:candidateId ─────────────────────────────────
router.get('/laporan/:candidateId', async (req, res) => {
  const { candidateId } = req.params;
  try {
    const [companyResult] = await pool.query(
      'SELECT id FROM company_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (companyResult.length === 0) {
      return res.status(403).json({ error: 'Profil perusahaan belum dibuat' });
    }
    const companyId = companyResult[0].id;

    // Pastikan kandidat ini melamar ke lowongan perusahaan ini
    const [appResult] = await pool.query(
      `SELECT a.*, j.title AS job_title, j.offered_salary, j.location AS job_location
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.candidate_id = ? AND j.company_id = ?
       ORDER BY a.match_score DESC
       LIMIT 1`,
      [candidateId, companyId]
    );

    if (appResult.length === 0) {
      return res.status(404).json({ error: 'Data kandidat tidak ditemukan' });
    }

    const application = appResult[0];

    // Detail profil kandidat
    const [profileResult] = await pool.query(
      `SELECT cp.*, u.name, u.email
       FROM candidate_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.id = ?`,
      [candidateId]
    );

    const [disabilitiesResult] = await pool.query(
      `SELECT dt.name, dt.accessibility_needs
       FROM candidate_disabilities cd
       JOIN disability_types dt ON dt.id = cd.disability_type_id
       WHERE cd.candidate_id = ?`,
      [candidateId]
    );

    const [skillsResult] = await pool.query(
      'SELECT skill FROM candidate_skills WHERE candidate_id = ?',
      [candidateId]
    );

    res.json({
      application,
      candidate_profile: {
        ...profileResult[0],
        disability_types: disabilitiesResult,
        skills: skillsResult.map((r) => r.skill),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mengambil laporan kandidat' });
  }
});

module.exports = router;
