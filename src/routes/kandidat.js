const express = require('express');
const pool = require('../../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Semua route di sini butuh login & role kandidat
router.use(authenticate, authorize('kandidat'));

// ── GET /api/kandidat/profile ────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const [profileResult] = await pool.query(
      `SELECT cp.id, cp.user_id, u.name, u.email, cp.location, cp.functional_profile, cp.updated_at
       FROM candidate_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.user_id = ?`,
      [req.user.id]
    );

    if (profileResult.length === 0) {
      return res.json({ profile: null });
    }

    const profile = profileResult[0];

    // Ambil disability types
    const [disabilitiesResult] = await pool.query(
      `SELECT dt.id, dt.name, dt.accessibility_needs
       FROM candidate_disabilities cd
       JOIN disability_types dt ON dt.id = cd.disability_type_id
       WHERE cd.candidate_id = ?`,
      [profile.id]
    );

    // Ambil skills
    const [skillsResult] = await pool.query(
      'SELECT skill FROM candidate_skills WHERE candidate_id = ?',
      [profile.id]
    );

    res.json({
      profile: {
        ...profile,
        disability_types: disabilitiesResult,
        skills: skillsResult.map((r) => r.skill),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gagal mengambil profil kandidat' });
  }
});

// ── POST /api/kandidat/profile ───────────────────────────────────────────────
// Body: { name, location, functional_profile, disability_type_ids: [1,2], skills: ["skill1"] }
router.post('/profile', async (req, res) => {
  const { name, location, functional_profile, disability_type_ids, skills } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: 'Nama dan lokasi wajib diisi' });
  }

  const client = await pool.getConnection();
  try {
    await client.query('BEGIN');

    // Update nama user
    await client.query('UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?', [
      name,
      req.user.id,
    ]);

    // Upsert candidate_profile
    let candidateId;
    const [existingProfile] = await client.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
    if (existingProfile.length > 0) {
      candidateId = existingProfile[0].id;
      await client.query(
        `UPDATE candidate_profiles
         SET location = ?, functional_profile = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [location, functional_profile || null, req.user.id]
      );
    } else {
      candidateId = require('crypto').randomUUID();
      await client.query(
        `INSERT INTO candidate_profiles (id, user_id, location, functional_profile)
         VALUES (?, ?, ?, ?)`,
        [candidateId, req.user.id, location, functional_profile || null]
      );
    }

    // Replace disabilities
    await client.query('DELETE FROM candidate_disabilities WHERE candidate_id = ?', [candidateId]);
    if (Array.isArray(disability_type_ids) && disability_type_ids.length > 0) {
      for (const dtId of disability_type_ids) {
        await client.query(
          `INSERT IGNORE INTO candidate_disabilities (candidate_id, disability_type_id)
           VALUES (?, ?)`,
          [candidateId, dtId]
        );
      }
    }

    // Replace skills
    await client.query('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidateId]);
    if (Array.isArray(skills) && skills.length > 0) {
      for (const skill of skills) {
        await client.query(
          `INSERT IGNORE INTO candidate_skills (candidate_id, skill)
           VALUES (?, ?)`,
          [candidateId, skill.trim()]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Profil kandidat berhasil disimpan',
      candidateId,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Gagal menyimpan profil kandidat' });
  } finally {
    client.release();
  }
});

// ── GET /api/kandidat/jobs ───────────────────────────────────────────────────
// Lihat semua lowongan + aplikasi yang sudah dilakukan kandidat ini
router.get('/applications', async (req, res) => {
  try {
    const [profileResult] = await pool.query(
      'SELECT id FROM candidate_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (profileResult.length === 0) {
      return res.json({ applications: [] });
    }
    const candidateId = profileResult[0].id;

    const [result] = await pool.query(
      `SELECT a.id, a.match_score, a.wage_status, a.applied_at,
              j.id AS job_id, j.title AS job_title, j.location AS job_location,
              j.offered_salary, cp.company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN company_profiles cp ON cp.id = j.company_id
       WHERE a.candidate_id = ?
       ORDER BY a.applied_at DESC`,
      [candidateId]
    );

    res.json({ applications: result });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil riwayat lamaran' });
  }
});

module.exports = router;
