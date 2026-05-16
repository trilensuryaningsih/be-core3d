const express = require('express');
const pool = require('../../config/db');

const router = express.Router();

// ── GET /api/ref/disability-types ────────────────────────────────────────────
// Publik - daftar semua tipe disabilitas (untuk dropdown di form)
router.get('/disability-types', async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT id, name, description, accessibility_needs FROM disability_types ORDER BY id'
    );
    res.json({ disability_types: result });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data tipe disabilitas' });
  }
});

// ── GET /api/ref/job-titles ──────────────────────────────────────────────────
// Publik - daftar semua job title (untuk dropdown di form posting lowongan)
router.get('/job-titles', async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT id, title FROM job_titles ORDER BY title'
    );
    res.json({ job_titles: result });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data job title' });
  }
});

// ── GET /api/ref/skills ──────────────────────────────────────────────────────
router.get('/skills', async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT id, name FROM skills ORDER BY name'
    );
    res.json({ skills: result });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data skills' });
  }
});

// ── GET /api/ref/umk ─────────────────────────────────────────────────────────
// Publik - daftar UMK per kota 2026
router.get('/umk', (req, res) => {
  const umk = {
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
  res.json({
    umk_2026: Object.entries(umk).map(([city, value]) => ({ city, value })),
  });
});

module.exports = router;
