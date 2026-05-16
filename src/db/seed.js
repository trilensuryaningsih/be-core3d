require('dotenv').config();
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const pool = require('../../config/db');

// ── SEEDER: DISABILITY TYPES (dari dokumen PDF) ──────────────────────────────
const disabilityTypes = [
  {
    name: 'Tunanetra',
    description: 'Orang dengan hambatan pada penglihatan, mulai dari penglihatan terbatas hingga buta total. Contoh kondisi: low vision (masih bisa melihat samar) dan buta total.',
    accessibility_needs: 'Screen reader (NVDA/JAWS), Voice navigation, Teks besar & kontras tinggi, Alt text pada gambar',
  },
  {
    name: 'Tunarungu',
    description: 'Orang yang memiliki hambatan mendengar sebagian atau seluruh suara. Contoh kondisi: hard of hearing dan tuli total.',
    accessibility_needs: 'Subtitle/caption, Chat/text communication, Visual notification, Bahasa isyarat',
  },
  {
    name: 'Tunawicara',
    description: 'Orang yang mengalami kesulitan atau tidak bisa berbicara dengan jelas.',
    accessibility_needs: 'Chat/text input, Tombol komunikasi cepat, Speech-to-text / text-to-speech',
  },
  {
    name: 'Disabilitas Daksa Tangan',
    description: 'Hambatan pada fungsi tangan atau lengan. Contoh kondisi: amputasi tangan, tangan lumpuh, kesulitan motorik halus.',
    accessibility_needs: 'Voice command, Tombol besar, Shortcut keyboard, Minimal drag-and-drop rumit',
  },
  {
    name: 'Disabilitas Daksa Kaki',
    description: 'Hambatan pada kaki atau kemampuan berjalan. Contoh kondisi: amputasi kaki, lumpuh, pengguna kursi roda.',
    accessibility_needs: 'Navigasi sederhana, Dukungan layanan jarak jauh/online, Integrasi lokasi aksesibel',
  },
  {
    name: 'Disabilitas Intelektual',
    description: 'Hambatan pada kemampuan belajar, memahami informasi, atau berpikir. Contoh kondisi: Down syndrome, intellectual disability.',
    accessibility_needs: 'Bahasa sederhana, Ikon visual jelas, Step-by-step interface, Tidak terlalu banyak informasi sekaligus',
  },
  {
    name: 'Disabilitas Mental / Psikososial',
    description: 'Gangguan yang memengaruhi kondisi emosional, perilaku, atau interaksi sosial. Contoh kondisi: depresi berat, bipolar, skizofrenia, anxiety disorder.',
    accessibility_needs: 'UI tidak terlalu ramai, Notifikasi tidak agresif, Kontrol privasi baik, Pengalaman penggunaan yang tenang dan jelas',
  },
  {
    name: 'Autisme (ASD)',
    description: 'Kondisi perkembangan saraf yang memengaruhi komunikasi, perilaku, dan interaksi sosial.',
    accessibility_needs: 'Tampilan konsisten, Navigasi stabil, Instruksi jelas, Hindari animasi berlebihan',
  },
  {
    name: 'Acquired Brain Injury (ABI)',
    description: 'Cedera otak yang terjadi setelah lahir akibat kecelakaan, stroke, benturan, dll. Dampak bisa berbeda-beda: gangguan memori, kesulitan fokus, gangguan bicara, gangguan motorik.',
    accessibility_needs: 'Navigasi sederhana, Pengingat, Tampilan tidak membingungkan, Bantuan visual/audio sesuai kebutuhan',
  },
];

// ── SEEDER: JOB TITLES (10 posisi) ──────────────────────────────────────────
const jobTitles = [
  { title: 'Horticultural Therapist Assistant' },
  { title: 'Customer Support Agent' },
  { title: 'Craft/Artisan Worker' },
  { title: 'Administrative Clerk' },
  { title: 'Art Therapist Assistant' },
  { title: 'Archivist' },
  { title: 'Programmer' },
  { title: 'Library Assistant' },
  { title: 'Data Entry Specialist' },
  { title: 'QA Tester' },
  { title: 'Accountant' },
  { title: 'Animator' },
  { title: 'Virtual Assistant' },
  { title: 'Online Moderator' },
  { title: 'Freelance Writer' },
  { title: 'Retail Stock Assistant' },
  { title: 'Garden Maintenance Worker' },
  { title: 'Cleaning Service' },
  { title: 'Food Packaging Worker' },
  { title: 'Laundry Worker' },
  { title: 'Digital Marketing Specialist' },
  { title: 'Financial Analyst' },
  { title: 'HR Specialist (Remote)' },
  { title: 'E-commerce Manager' },
  { title: 'Remote Project Manager' },
  { title: 'Telesales Agent' },
  { title: 'Translator' },
  { title: 'Customer Support Specialist' },
  { title: 'Online Tutor' },
  { title: 'Voice-over Artist' },
  { title: 'Researcher' },
  { title: 'Social Media Manager' },
  { title: 'Bookkeeper' },
  { title: 'UI/UX Designer' },
  { title: 'Data Analyst' },
  { title: 'Illustrator' },
  { title: 'Content Writer' },
  { title: 'Video Editor' },
  { title: 'Software Developer' },
  { title: 'Graphic Designer' },
  { title: 'Transcriptionist' },
  { title: 'Data Entry Operator' },
  { title: 'Podcast Producer' },
  { title: 'Telemarketer' },
  { title: 'Customer Service Representative' }
];

// ── SEEDER: USERS (kandidat & perusahaan) ─────────────────────────────────-
const seedUsers = [
  {
    email: 'kandidat@example.com',
    password: 'password123',
    name: 'Kandidat Demo',
    role: 'kandidat',
  },
  {
    email: 'perusahaan@example.com',
    password: 'password123',
    name: 'Perusahaan Demo',
    role: 'perusahaan',
  },
];

const seedCandidateProfile = {
  location: 'Jakarta',
  functional_profile: 'Kandidat demo untuk testing aplikasi',
  skills: ['JavaScript', 'Node.js'],
};

const seedCompanyProfile = {
  company_name: 'PT Demo Inklusi',
  location: 'Jakarta',
  office_conditions: ['Ramp akses tersedia', 'Lift aksesibel'],
};

const runSeed = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    console.log('🌱 Mulai seeding database (MySQL)...');

    // Seed disability_types
    console.log('  → Seeding disability_types...');
    for (const dt of disabilityTypes) {
      await connection.query(
        `INSERT INTO disability_types (name, description, accessibility_needs)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           description = VALUES(description),
           accessibility_needs = VALUES(accessibility_needs)`,
        [dt.name, dt.description, dt.accessibility_needs]
      );
    }
    console.log(`  ✅ ${disabilityTypes.length} tipe disabilitas berhasil di-seed`);

    // Seed job_titles
    console.log('  → Seeding job_titles...');
    for (const jt of jobTitles) {
      await connection.query(
        `INSERT INTO job_titles (title)
         VALUES (?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title)`,
        [jt.title]
      );
    }
    console.log(`  ✅ ${jobTitles.length} job title berhasil di-seed`);

    // Seed users
    console.log('  → Seeding users (kandidat & perusahaan)...');
    for (const u of seedUsers) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      await connection.query(
        `INSERT INTO users (id, email, password_hash, name, role)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           password_hash = VALUES(password_hash),
           name = VALUES(name),
           role = VALUES(role)`,
        [randomUUID(), u.email, passwordHash, u.name, u.role]
      );
    }
    console.log('  ✅ Users berhasil di-seed');

    // Seed candidate profile
    const [candidateRows] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      ['kandidat@example.com']
    );
    if (candidateRows.length > 0) {
      const candidateUserId = candidateRows[0].id;
      const [existingCandidate] = await connection.query(
        'SELECT id FROM candidate_profiles WHERE user_id = ? LIMIT 1',
        [candidateUserId]
      );

      let candidateProfileId = existingCandidate.length > 0 ? existingCandidate[0].id : randomUUID();

      if (existingCandidate.length > 0) {
        await connection.query(
          `UPDATE candidate_profiles
           SET location = ?, functional_profile = ?, updated_at = NOW()
           WHERE user_id = ?`,
          [seedCandidateProfile.location, seedCandidateProfile.functional_profile, candidateUserId]
        );
      } else {
        await connection.query(
          `INSERT INTO candidate_profiles (id, user_id, location, functional_profile)
           VALUES (?, ?, ?, ?)`,
          [candidateProfileId, candidateUserId, seedCandidateProfile.location, seedCandidateProfile.functional_profile]
        );
      }

      // Replace candidate skills
      await connection.query('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidateProfileId]);
      for (const skill of seedCandidateProfile.skills) {
        await connection.query(
          `INSERT IGNORE INTO candidate_skills (candidate_id, skill)
           VALUES (?, ?)`,
          [candidateProfileId, skill]
        );
      }
    }

    // Seed company profile
    const [companyRows] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      ['perusahaan@example.com']
    );
    if (companyRows.length > 0) {
      const companyUserId = companyRows[0].id;
      const [existingCompany] = await connection.query(
        'SELECT id FROM company_profiles WHERE user_id = ? LIMIT 1',
        [companyUserId]
      );

      let companyProfileId = existingCompany.length > 0 ? existingCompany[0].id : randomUUID();

      if (existingCompany.length > 0) {
        await connection.query(
          `UPDATE company_profiles
           SET company_name = ?, location = ?, updated_at = NOW()
           WHERE user_id = ?`,
          [seedCompanyProfile.company_name, seedCompanyProfile.location, companyUserId]
        );
      } else {
        await connection.query(
          `INSERT INTO company_profiles (id, user_id, company_name, location)
           VALUES (?, ?, ?, ?)`,
          [companyProfileId, companyUserId, seedCompanyProfile.company_name, seedCompanyProfile.location]
        );
      }

      // Replace office conditions
      await connection.query('DELETE FROM company_office_conditions WHERE company_id = ?', [companyProfileId]);
      for (const condition of seedCompanyProfile.office_conditions) {
        await connection.query(
          `INSERT IGNORE INTO company_office_conditions (company_id, \`condition\`)
           VALUES (?, ?)`,
          [companyProfileId, condition]
        );
      }
    }

    await connection.commit();
    console.log('\n🎉 Seeding selesai!');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Gagal seeding:', err.message);
    throw err;
  } finally {
    connection.release();
    process.exit();
  }
};

runSeed().catch(console.error);
