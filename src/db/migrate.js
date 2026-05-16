require('dotenv').config();
const pool = require('../../config/db');

const createTables = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    console.log('🔄 Membuat tabel-tabel database (MySQL)...');

    // 1. disability_types
    await connection.query(`
      CREATE TABLE IF NOT EXISTS disability_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        accessibility_needs TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. job_titles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_titles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL UNIQUE,
        average_salary BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2b. skills
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2c. provinces
    await connection.query(`
      CREATE TABLE IF NOT EXISTS provinces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        minimum_wage BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('kandidat', 'perusahaan')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. candidate_profiles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS candidate_profiles (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL UNIQUE,
        location VARCHAR(255),
        functional_profile TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 5. candidate_disabilities
    await connection.query(`
      CREATE TABLE IF NOT EXISTS candidate_disabilities (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        candidate_id VARCHAR(36) NOT NULL,
        disability_type_id INT NOT NULL,
        UNIQUE(candidate_id, disability_type_id),
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (disability_type_id) REFERENCES disability_types(id)
      )
    `);

    // 6. candidate_skills
    await connection.query(`
      CREATE TABLE IF NOT EXISTS candidate_skills (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        candidate_id VARCHAR(36) NOT NULL,
        skill VARCHAR(100) NOT NULL,
        UNIQUE(candidate_id, skill),
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
      )
    `);

    // 7. company_profiles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_profiles (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 8. company_office_conditions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_office_conditions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        company_id VARCHAR(36) NOT NULL,
        \`condition\` VARCHAR(255) NOT NULL,
        UNIQUE(company_id, \`condition\`),
        FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE
      )
    `);

    // 9. jobs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        company_id VARCHAR(36) NOT NULL,
        job_title_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        offered_salary VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (job_title_id) REFERENCES job_titles(id)
      )
    `);

    // 10. job_required_skills
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_required_skills (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        job_id VARCHAR(36) NOT NULL,
        skill VARCHAR(100) NOT NULL,
        UNIQUE(job_id, skill),
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // 11. job_disability_accommodations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_disability_accommodations (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        job_id VARCHAR(36) NOT NULL,
        disability_type_id INT NOT NULL,
        accommodation TEXT NOT NULL,
        UNIQUE(job_id, disability_type_id),
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (disability_type_id) REFERENCES disability_types(id)
      )
    `);

    // 12. applications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        candidate_id VARCHAR(36) NOT NULL,
        job_id VARCHAR(36) NOT NULL,
        match_score INT DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
        matched_skills JSON,
        gap_skills JSON,
        accommodations JSON,
        wage_status VARCHAR(20) DEFAULT 'TIDAK LAYAK',
        umk_value BIGINT DEFAULT 0,
        offered_salary BIGINT DEFAULT 0,
        wage_gap BIGINT DEFAULT 0,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(candidate_id, job_id),
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // 13. city_minimum_wages
    await connection.query(`
      CREATE TABLE IF NOT EXISTS city_minimum_wages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        province VARCHAR(100) NOT NULL,
        city VARCHAR(150) NOT NULL,
        minimum_wage BIGINT DEFAULT 0,
        UNIQUE KEY unique_city (province, city)
      )
    `);

    await connection.commit();
    console.log('✅ Semua tabel berhasil dibuat!');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Gagal membuat tabel:', err.message);
    throw err;
  } finally {
    connection.release();
    process.exit();
  }
};

createTables().catch(console.error);
