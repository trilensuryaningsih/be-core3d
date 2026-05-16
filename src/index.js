require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const kandidatRoutes = require('./routes/kandidat');
const perusahaanRoutes = require('./routes/perusahaan');
const jobsRoutes = require('./routes/jobs');
const matchRoutes = require('./routes/match');
const refRoutes = require('./routes/ref');
const umkRoutes = require('./routes/umk');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── ROUTES ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', message: 'InklusiKerja API berjalan' }));

app.use('/api/auth', authRoutes);
app.use('/api/kandidat', kandidatRoutes);
app.use('/api/perusahaan', perusahaanRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/ref', refRoutes);
app.use('/api/umk', umkRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 InklusiKerja API berjalan di http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
