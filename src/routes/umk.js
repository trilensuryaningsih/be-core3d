const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

// GET /api/umk/provinces - daftar provinsi unik
router.get('/provinces', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT province FROM city_minimum_wages ORDER BY province ASC');
    const provinces = rows.map(r => r.province);
    res.json(provinces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/umk?province=Jawa Tengah - daftar kota/kabupaten dan UMK di provinsi tsb
router.get('/', async (req, res) => {
  const { province } = req.query;
  if (!province) return res.status(400).json({ error: 'province is required' });
  try {
    const [rows] = await pool.query(
      'SELECT city, minimum_wage FROM city_minimum_wages WHERE province = ? ORDER BY city ASC',
      [province]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
