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
  { title: 'Horticultural Therapist Assistant', averageSalary: 3500000 },
  { title: 'Customer Support Agent', averageSalary: 4200000 },
  { title: 'Craft/Artisan Worker', averageSalary: 3300000 },
  { title: 'Administrative Clerk', averageSalary: 4000000 },
  { title: 'Art Therapist Assistant', averageSalary: 3600000 },
  { title: 'Archivist', averageSalary: 4200000 },
  { title: 'Programmer', averageSalary: 7500000 },
  { title: 'Library Assistant', averageSalary: 3400000 },
  { title: 'Data Entry Specialist', averageSalary: 3800000 },
  { title: 'QA Tester', averageSalary: 6000000 },
  { title: 'Accountant', averageSalary: 5500000 },
  { title: 'Animator', averageSalary: 5000000 },
  { title: 'Virtual Assistant', averageSalary: 4500000 },
  { title: 'Online Moderator', averageSalary: 3800000 },
  { title: 'Freelance Writer', averageSalary: 4000000 },
  { title: 'Retail Stock Assistant', averageSalary: 3500000 },
  { title: 'Garden Maintenance Worker', averageSalary: 3200000 },
  { title: 'Cleaning Service', averageSalary: 3000000 },
  { title: 'Food Packaging Worker', averageSalary: 3100000 },
  { title: 'Laundry Worker', averageSalary: 2900000 },
  { title: 'Digital Marketing Specialist', averageSalary: 5500000 },
  { title: 'Financial Analyst', averageSalary: 7000000 },
  { title: 'HR Specialist (Remote)', averageSalary: 5800000 },
  { title: 'E-commerce Manager', averageSalary: 8000000 },
  { title: 'Remote Project Manager', averageSalary: 10000000 },
  { title: 'Telesales Agent', averageSalary: 3800000 },
  { title: 'Translator', averageSalary: 5000000 },
  { title: 'Customer Support Specialist', averageSalary: 4500000 },
  { title: 'Online Tutor', averageSalary: 3800000 },
  { title: 'Voice-over Artist', averageSalary: 5500000 },
  { title: 'Researcher', averageSalary: 6500000 },
  { title: 'Social Media Manager', averageSalary: 5500000 },
  { title: 'Bookkeeper', averageSalary: 4300000 },
  { title: 'UI/UX Designer', averageSalary: 7000000 },
  { title: 'Data Analyst', averageSalary: 7500000 },
  { title: 'Illustrator', averageSalary: 4800000 },
  { title: 'Content Writer', averageSalary: 4200000 },
  { title: 'Video Editor', averageSalary: 4800000 },
  { title: 'Software Developer', averageSalary: 8500000 },
  { title: 'Graphic Designer', averageSalary: 4500000 },
  { title: 'Transcriptionist', averageSalary: 3600000 },
  { title: 'Data Entry Operator', averageSalary: 3700000 },
  { title: 'Podcast Producer', averageSalary: 5200000 },
  { title: 'Telemarketer', averageSalary: 3700000 },
  { title: 'Customer Service Representative', averageSalary: 4200000 }
];
// ── SEEDER: SKILLS ─────────────────────────────────────────────────────────
const skills = [
  'HTML', 'CSS', 'JavaScript', 'React.js', 'Vue.js',
  'Angular', 'Svelte', 'Tailwind CSS', 'Bootstrap', 'Node.js',
  'Express.js', 'NestJS', 'PHP', 'Laravel', 'CodeIgniter',
  'Python', 'Django', 'Flask', 'FastAPI', 'Java',
  'Spring Boot', 'Kotlin', 'Swift', 'Flutter', 'React Native',
  'Go (Golang)', 'Ruby', 'Ruby on Rails', 'C#', '.NET Core',
  'TypeScript', 'GraphQL', 'RESTful API', 'SQL', 'MySQL',
  'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'SQLite',
  'Oracle Database', 'Microsoft SQL Server', 'Git', 'GitHub', 'GitLab',
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud Platform (GCP)', 'Microsoft Azure',
  'CI/CD', 'Jenkins', 'Linux', 'Bash Scripting', 'Nginx',
  'Apache', 'UI Design', 'UX Design', 'Figma', 'Adobe XD',
  'Sketch', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems',
  'Graphic Design', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere Pro', 'After Effects',
  'Video Editing', 'Motion Graphics', '3D Modeling', 'Blender', 'CorelDraw',
  'Data Analysis', 'Data Science', 'Machine Learning', 'Deep Learning', 'Python Pandas',
  'NumPy', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'YOLOv8',
  'FaceNet', 'Computer Vision', 'NLP (Natural Language Processing)', 'R Programming', 'Tableau',
  'Power BI', 'Google Looker Studio', 'Data Warehousing', 'Hadoop', 'Apache Spark',
  'ETL Processes', 'SEO (Search Engine Optimization)', 'SEM (Search Engine Marketing)', 'Google Analytics', 'Social Media Management',
  'Content Writing', 'Copywriting', 'Technical Writing', 'Email Marketing', 'Digital Marketing Strategy',
  'Project Management', 'Agile Methodology', 'Scrum', 'Jira', 'Trello',
  'Product Management', 'Business Analysis', 'Product Roadmap', 'QA Testing', 'Manual Testing',
  'Automation Testing', 'Selenium', 'Cypress', 'Postman API Testing', 'Cybersecurity',
  'Penetration Testing', 'Network Security', 'Cryptography', 'Ethical Hacking', 'Cisco Networking',
  'System Administration', 'IT Support', 'Hardware Troubleshooting', 'Cloud Architecture', 'DevOps',
  'Data Entry', 'Microsoft Office', 'Microsoft Excel (Advanced)', 'Google Sheets', 'Accounting',
  'Financial Auditing', 'Taxation (Perpajakan)', 'Bookkeeping', 'SAP', 'MYOB',
  'Customer Service', 'Public Relations', 'Copyediting', 'Translation (English-Indonesian)', 'Interpersonal Communication'
];

// ── SEEDER: PROVINCES ──────────────────────────────────────────────────────
const provinces = [
  // Sumatra
  { name: 'Aceh', minimumWage: 3932552 },
  { name: 'Sumatera Utara', minimumWage: 3228949 },
  { name: 'Sumatera Barat', minimumWage: 3182955 },
  { name: 'Riau', minimumWage: 3780495 },
  { name: 'Kepulauan Riau', minimumWage: 3879520 },
  { name: 'Jambi', minimumWage: 3471497 },
  { name: 'Bengkulu', minimumWage: 2827250 },
  { name: 'Sumatera Selatan', minimumWage: 3942963 },
  { name: 'Kepulauan Bangka Belitung', minimumWage: 4035000 },
  { name: 'Lampung', minimumWage: 3047734 },

  // Jawa & Bali
  { name: 'DKI Jakarta', minimumWage: 5729876 },
  { name: 'Banten', minimumWage: 3100881 },
  { name: 'Jawa Barat', minimumWage: 2317601 },
  { name: 'Jawa Tengah', minimumWage: 2327386 },
  { name: 'DI Yogyakarta', minimumWage: 2417495 },
  { name: 'Jawa Timur', minimumWage: 2446880 },
  { name: 'Bali', minimumWage: 3207459 },

  // Nusa Tenggara & Kalimantan
  { name: 'Nusa Tenggara Barat', minimumWage: 2673861 },
  { name: 'Nusa Tenggara Timur', minimumWage: 2455898 },
  { name: 'Kalimantan Barat', minimumWage: 3054552 },
  { name: 'Kalimantan Tengah', minimumWage: 3686138 },
  { name: 'Kalimantan Selatan', minimumWage: 3725000 },
  { name: 'Kalimantan Timur', minimumWage: 3762431 },
  { name: 'Kalimantan Utara', minimumWage: 3775243 },

  // Sulawesi
  { name: 'Sulawesi Utara', minimumWage: 4002630 },
  { name: 'Gorontalo', minimumWage: 3405144 },
  { name: 'Sulawesi Tengah', minimumWage: 3179565 },
  { name: 'Sulawesi Barat', minimumWage: 3315934 },
  { name: 'Sulawesi Selatan', minimumWage: 3921088 },
  { name: 'Sulawesi Tenggara', minimumWage: 3306496 },

  // Maluku & Papua
  { name: 'Maluku', minimumWage: 3334490 },
  { name: 'Maluku Utara', minimumWage: 3510240 },
  { name: 'Papua', minimumWage: 4436283 },
  { name: 'Papua Barat', minimumWage: 3841000 },
  { name: 'Papua Selatan', minimumWage: 4508100 },
  { name: 'Papua Tengah', minimumWage: 4285848 },
  { name: 'Papua Pegunungan', minimumWage: 4508714 },
  { name: 'Papua Barat Daya', minimumWage: 3766000 }
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

    // Seed skills
    console.log('  → Seeding skills...');
    for (const skill of skills) {
      await connection.query(
        `INSERT INTO skills (name)
         VALUES (?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name)`,
        [skill]
      );
    }
    console.log(`  ✅ ${skills.length} skills berhasil di-seed`);

    // Seed provinces
    console.log('  → Seeding provinces...');
    for (const province of provinces) {
      await connection.query(
        `INSERT INTO provinces (name, minimum_wage)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE
           minimum_wage = VALUES(minimum_wage)`,
        [province.name, province.minimumWage]
      );
    }
    console.log(`  ✅ ${provinces.length} provinces berhasil di-seed`);

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
