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

const cityMinimumWages = [
  // DKI Jakarta (Sesuai UMP DKI Jakarta karena tidak ada UMK terpisah)
  { province: 'DKI Jakarta', city: 'Kabupaten Administrasi Kepulauan Seribu', minimum_wage: 5729876 },
  { province: 'DKI Jakarta', city: 'Kota Administrasi Jakarta Pusat', minimum_wage: 5729876 },
  { province: 'DKI Jakarta', city: 'Kota Administrasi Jakarta Utara', minimum_wage: 5729876 },
  { province: 'DKI Jakarta', city: 'Kota Administrasi Jakarta Barat', minimum_wage: 5729876 },
  { province: 'DKI Jakarta', city: 'Kota Administrasi Jakarta Selatan', minimum_wage: 5729876 },
  { province: 'DKI Jakarta', city: 'Kota Administrasi Jakarta Timur', minimum_wage: 5729876 },

  // Jawa Barat
  { province: 'Jawa Barat', city: 'Kota Bekasi', minimum_wage: 5999443 },
  { province: 'Jawa Barat', city: 'Kabupaten Bekasi', minimum_wage: 5938885 },
  { province: 'Jawa Barat', city: 'Kabupaten Karawang', minimum_wage: 5886853 },
  { province: 'Jawa Barat', city: 'Kota Depok', minimum_wage: 5522662 },
  { province: 'Jawa Barat', city: 'Kota Bogor', minimum_wage: 5437203 },
  { province: 'Jawa Barat', city: 'Kabupaten Bogor', minimum_wage: 5161769 },
  { province: 'Jawa Barat', city: 'Kabupaten Purwakarta', minimum_wage: 5052856 },
  { province: 'Jawa Barat', city: 'Kota Bandung', minimum_wage: 4737678 },
  { province: 'Jawa Barat', city: 'Kota Cimahi', minimum_wage: 4090568 },
  { province: 'Jawa Barat', city: 'Kabupaten Bandung Barat', minimum_wage: 3984711 },
  { province: 'Jawa Barat', city: 'Kabupaten Bandung', minimum_wage: 3972202 },
  { province: 'Jawa Barat', city: 'Kabupaten Sumedang', minimum_wage: 3949856 },
  { province: 'Jawa Barat', city: 'Kabupaten Sukabumi', minimum_wage: 3831926 },
  { province: 'Jawa Barat', city: 'Kabupaten Subang', minimum_wage: 3737482 },
  { province: 'Jawa Barat', city: 'Kabupaten Cianjur', minimum_wage: 3316191 },
  { province: 'Jawa Barat', city: 'Kota Tasikmalaya', minimum_wage: 2980336 },
  { province: 'Jawa Barat', city: 'Kabupaten Indramayu', minimum_wage: 2910254 },
  { province: 'Jawa Barat', city: 'Kabupaten Cirebon', minimum_wage: 2880798 },
  { province: 'Jawa Barat', city: 'Kota Cirebon', minimum_wage: 2878646 },
  { province: 'Jawa Barat', city: 'Kabupaten Tasikmalaya', minimum_wage: 2871874 },
  { province: 'Jawa Barat', city: 'Kabupaten Majalengka', minimum_wage: 2595368 },
  { province: 'Jawa Barat', city: 'Kabupaten Garut', minimum_wage: 2503251 },
  { province: 'Jawa Barat', city: 'Kabupaten Ciamis', minimum_wage: 2364176 },
  { province: 'Jawa Barat', city: 'Kota Sukabumi', minimum_wage: 2351711 },
  { province: 'Jawa Barat', city: 'Kabupaten Pangandaran', minimum_wage: 2321455 },
  { province: 'Jawa Barat', city: 'Kota Banjar', minimum_wage: 2317601 },
  { province: 'Jawa Barat', city: 'Kabupaten Kuningan', minimum_wage: 2317601 },

  // Banten
  { province: 'Banten', city: 'Kota Cilegon', minimum_wage: 4945184 },
  { province: 'Banten', city: 'Kota Tangerang', minimum_wage: 4907106 },
  { province: 'Banten', city: 'Kota Tangerang Selatan', minimum_wage: 4710185 },
  { province: 'Banten', city: 'Kabupaten Tangerang', minimum_wage: 4700684 },
  { province: 'Banten', city: 'Kabupaten Serang', minimum_wage: 4624731 },
  { province: 'Banten', city: 'Kota Serang', minimum_wage: 4241604 },
  { province: 'Banten', city: 'Kabupaten Pandeglang', minimum_wage: 3108881 },
  { province: 'Banten', city: 'Kabupaten Lebak', minimum_wage: 3100881 },

  // Jawa Tengah
  { province: 'Jawa Tengah', city: 'Kota Semarang', minimum_wage: 3343940 },
  { province: 'Jawa Tengah', city: 'Kabupaten Demak', minimum_wage: 2862831 },
  { province: 'Jawa Tengah', city: 'Kabupaten Kendal', minimum_wage: 2717013 },
  { province: 'Jawa Tengah', city: 'Kabupaten Kudus', minimum_wage: 2616428 },
  { province: 'Jawa Tengah', city: 'Kabupaten Cilacap', minimum_wage: 2574032 },
  { province: 'Jawa Tengah', city: 'Kota Pekalongan', minimum_wage: 2426176 },
  { province: 'Jawa Tengah', city: 'Kabupaten Batang', minimum_wage: 2423984 },
  { province: 'Jawa Tengah', city: 'Kota Salatiga', minimum_wage: 2420950 },
  { province: 'Jawa Tengah', city: 'Kabupaten Jepara', minimum_wage: 2412854 },
  { province: 'Jawa Tengah', city: 'Kota Surakarta (Solo)', minimum_wage: 2365287 },
  { province: 'Jawa Tengah', city: 'Kabupaten Sukoharjo', minimum_wage: 2317730 },
  { province: 'Jawa Tengah', city: 'Kabupaten Karanganyar', minimum_wage: 2314545 },
  { province: 'Jawa Tengah', city: 'Kabupaten Boyolali', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Klaten', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Purbalingga', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Banyumas', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kota Tegal', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Tegal', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Pekalongan', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Pemalang', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Brebes', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Blora', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Grobogan', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Pati', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Rembang', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Magelang', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kota Magelang', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Purworejo', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Kebumen', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Wonosobo', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Banjarnegara', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Temanggung', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Wonogiri', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Sragen', minimum_wage: 2327386 },
  { province: 'Jawa Tengah', city: 'Kabupaten Semarang', minimum_wage: 2327386 },

  // DI Yogyakarta
  { province: 'DI Yogyakarta', city: 'Kota Yogyakarta', minimum_wage: 2594144 },
  { province: 'DI Yogyakarta', city: 'Kabupaten Sleman', minimum_wage: 2417495 },
  { province: 'DI Yogyakarta', city: 'Kabupaten Bantul', minimum_wage: 2417495 },
  { province: 'DI Yogyakarta', city: 'Kabupaten Kulon Progo', minimum_wage: 2417495 },
  { province: 'DI Yogyakarta', city: 'Kabupaten Gunungkidul', minimum_wage: 2417495 },

  // Jawa Timur
  { province: 'Jawa Timur', city: 'Kota Surabaya', minimum_wage: 4825579 },
  { province: 'Jawa Timur', city: 'Kabupaten Gresik', minimum_wage: 4742048 },
  { province: 'Jawa Timur', city: 'Kabupaten Sidoarjo', minimum_wage: 4738582 },
  { province: 'Jawa Timur', city: 'Kabupaten Pasuruan', minimum_wage: 4705112 },
  { province: 'Jawa Timur', city: 'Kabupaten Mojokerto', minimum_wage: 4694432 },
  { province: 'Jawa Timur', city: 'Kabupaten Malang', minimum_wage: 3462944 },
  { province: 'Jawa Timur', city: 'Kota Malang', minimum_wage: 3401133 },
  { province: 'Jawa Timur', city: 'Kota Pasuruan', minimum_wage: 3238122 },
  { province: 'Jawa Timur', city: 'Kota Batu', minimum_wage: 3222380 },
  { province: 'Jawa Timur', city: 'Kabupaten Jombang', minimum_wage: 3025680 },
  { province: 'Jawa Timur', city: 'Kota Mojokerto', minimum_wage: 2943440 },
  { province: 'Jawa Timur', city: 'Kabupaten Probolinggo', minimum_wage: 2875320 },
  { province: 'Jawa Timur', city: 'Kabupaten Tuban', minimum_wage: 2864225 },
  { province: 'Jawa Timur', city: 'Kota Probolinggo', minimum_wage: 2776240 },
  { province: 'Jawa Timur', city: 'Kabupaten Jember', minimum_wage: 2735460 },
  { province: 'Jawa Timur', city: 'Kabupaten Banyuwangi', minimum_wage: 2715100 },
  { province: 'Jawa Timur', city: 'Kabupaten Lumajang', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Bondowoso', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Situbondo', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Kediri', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kota Kediri', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Nganjuk', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Madiun', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kota Madiun', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Magetan', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Ngawi', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Ponorogo', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Pacitan', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Bojonegoro', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Lamongan', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Blitar', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kota Blitar', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Tulungagung', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Trenggalek', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Bangkalan', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Pamekasan', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Sampang', minimum_wage: 2446880 },
  { province: 'Jawa Timur', city: 'Kabupaten Sumenep', minimum_wage: 2446880 },

  // Bali
  { province: 'Bali', city: 'Kabupaten Badung', minimum_wage: 3418900 },
  { province: 'Bali', city: 'Kota Denpasar', minimum_wage: 3207459 },
  { province: 'Bali', city: 'Kabupaten Gianyar', minimum_wage: 3207459 },
  { province: 'Bali', city: 'Kabupaten Tabanan', minimum_wage: 3207459 },
  { province: 'Bali', city: 'Kabupaten Jembrana', minimum_wage: 3207459 },
  { province: 'Bali', city: 'Kabupaten Karangasem', minimum_wage: 3207459 },
  { province: 'Bali', city: 'Kabupaten Buleleng', minimum_wage: 3207459 },
  { province: 'Bali', city: 'Kabupaten Bangli', minimum_wage: 3207459 },
  { province: 'Bali', city: 'Kabupaten Klungkung', minimum_wage: 3207459 },
  { province: 'Aceh', city: 'Kota Banda Aceh', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Besar', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Pidie', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Pidie Jaya', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Bireuen', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Utara', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kota Lhokseumawe', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Timur', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kota Langsa', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Tamiang', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Bener Meriah', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Tengah', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Gayo Lues', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Tenggara', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Barat', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Barat Daya', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Nagan Raya', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Jaya', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Aceh Selatan', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Singkil', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kota Subulussalam', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kabupaten Simeulue', minimum_wage: 3932552 },
  { province: 'Aceh', city: 'Kota Sabang', minimum_wage: 3932552 },

  // Sumatera Utara
  { province: 'Sumatera Utara', city: 'Kota Medan', minimum_wage: 3820000 },
  { province: 'Sumatera Utara', city: 'Kabupaten Deli Serdang', minimum_wage: 3450000 },
  { province: 'Sumatera Utara', city: 'Kabupaten Karo', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Langkat', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kota Binjai', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kota Tebing Tinggi', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Serdang Bedagai', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Asahan', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Batu Bara', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kota Tanjungbalai', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Labuhanbatu', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Labuhanbatu Utara', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Labuhanbatu Selatan', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Toba', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Samosir', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Humbang Hasundutan', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Tapanuli Utara', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Tapanuli Tengah', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kota Sibolga', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kota Pematangsiantar', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Simalungun', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Dairi', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Pakpak Bharat', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Tapanuli Selatan', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kota Padangsidimpuan', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Padang Lawas', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Padang Lawas Utara', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Mandailing Natal', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Nias', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Nias Selatan', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Nias Utara', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kabupaten Nias Barat', minimum_wage: 3228949 },
  { province: 'Sumatera Utara', city: 'Kota Gunungsitoli', minimum_wage: 3228949 },

  // Sumatera Barat
  { province: 'Sumatera Barat', city: 'Kota Padang', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kota Bukittinggi', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kota Payakumbuh', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kota Padang Panjang', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kota Sawahlunto', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kota Solok', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kota Pariaman', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Pasaman', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Pasaman Barat', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Agam', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Lima Puluh Kota', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Tanah Datar', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Padang Pariaman', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Solok', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Solok Selatan', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Sijunjung', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Dharmasraya', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Pesisir Selatan', minimum_wage: 3182955 },
  { province: 'Sumatera Barat', city: 'Kabupaten Kepulauan Mentawai', minimum_wage: 3182955 },

  // Riau
  { province: 'Riau', city: 'Kota Dumai', minimum_wage: 3860000 },
  { province: 'Riau', city: 'Kota Pekanbaru', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Bengkalis', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Siak', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Pelalawan', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Kuantan Singingi', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Indragiri Hulu', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Indragiri Hilir', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Kampar', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Rokan Hulu', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Rokan Hilir', minimum_wage: 3780495 },
  { province: 'Riau', city: 'Kabupaten Kepulauan Meranti', minimum_wage: 3780495 },

  // Kepulauan Riau
  { province: 'Kepulauan Riau', city: 'Kota Batam', minimum_wage: 4900000 },
  { province: 'Kepulauan Riau', city: 'Kota Tanjungpinang', minimum_wage: 3879520 },
  { province: 'Kepulauan Riau', city: 'Kabupaten Bintan', minimum_wage: 3879520 },
  { province: 'Kepulauan Riau', city: 'Kabupaten Karimun', minimum_wage: 3879520 },
  { province: 'Kepulauan Riau', city: 'Kabupaten Natuna', minimum_wage: 3879520 },
  { province: 'Kepulauan Riau', city: 'Kabupaten Kepulauan Anambas', minimum_wage: 3879520 },
  { province: 'Kepulauan Riau', city: 'Kabupaten Lingga', minimum_wage: 3879520 },

  // Jambi
  { province: 'Jambi', city: 'Kota Jambi', minimum_wage: 3500000 },
  { province: 'Jambi', city: 'Kabupaten Muaro Jambi', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Batanghari', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Tanjung Jabung Barat', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Tanjung Jabung Timur', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Bungo', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Tebo', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Merangin', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Sarolangun', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kabupaten Kerinci', minimum_wage: 3471497 },
  { province: 'Jambi', city: 'Kota Sungai Penuh', minimum_wage: 3471497 },

  // Bengkulu
  { province: 'Bengkulu', city: 'Kota Bengkulu', minimum_wage: 2900000 },
  { province: 'Bengkulu', city: 'Kabupaten Bengkulu Utara', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Bengkulu Selatan', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Rejang Lebong', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Mukomuko', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Seluma', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Kaur', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Kepahiang', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Lebong', minimum_wage: 2827250 },
  { province: 'Bengkulu', city: 'Kabupaten Bengkulu Tengah', minimum_wage: 2827250 },

  // Sumatera Selatan
  { province: 'Sumatera Selatan', city: 'Kota Palembang', minimum_wage: 4100000 },
  { province: 'Sumatera Selatan', city: 'Kota Prabumulih', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kota Lubuklinggau', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kota Pagar Alam', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Ogan Komering Ilir', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Ogan Komering Ulu', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Muara Enim', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Lahat', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Musi Rawas', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Musi Banyuasin', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Banyuasin', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Ogan Ilir', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Ogan Komering Ulu Timur', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Ogan Komering Ulu Selatan', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Empat Lawang', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Penukal Abab Lematang Ilir', minimum_wage: 3942963 },
  { province: 'Sumatera Selatan', city: 'Kabupaten Musi Rawas Utara', minimum_wage: 3942963 },

  // Kepulauan Bangka Belitung
  { province: 'Kepulauan Bangka Belitung', city: 'Kota Pangkalpinang', minimum_wage: 4035000 },
  { province: 'Kepulauan Bangka Belitung', city: 'Kabupaten Bangka', minimum_wage: 4035000 },
  { province: 'Kepulauan Bangka Belitung', city: 'Kabupaten Bangka Barat', minimum_wage: 4035000 },
  { province: 'Kepulauan Bangka Belitung', city: 'Kabupaten Bangka Tengah', minimum_wage: 4035000 },
  { province: 'Kepulauan Bangka Belitung', city: 'Kabupaten Bangka Selatan', minimum_wage: 4035000 },
  { province: 'Kepulauan Bangka Belitung', city: 'Kabupaten Belitung', minimum_wage: 4035000 },
  { province: 'Kepulauan Bangka Belitung', city: 'Kabupaten Belitung Timur', minimum_wage: 4035000 },

  // Lampung
  { province: 'Lampung', city: 'Kota Bandar Lampung', minimum_wage: 3150000 },
  { province: 'Lampung', city: 'Kota Metro', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Lampung Selatan', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Lampung Tengah', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Lampung Utara', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Lampung Barat', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Tulang Bawang', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Tanggamus', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Lampung Timur', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Way Kanan', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Pesawaran', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Pringsewu', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Mesuji', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Tulang Bawang Barat', minimum_wage: 3047734 },
  { province: 'Lampung', city: 'Kabupaten Pesisir Barat', minimum_wage: 3047734 },

  // Nusa Tenggara Barat (NTB)
  { province: 'Nusa Tenggara Barat', city: 'Kota Mataram', minimum_wage: 2800000 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Lombok Barat', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Lombok Tengah', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Lombok Timur', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Sumbawa', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Dompu', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Bima', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kota Bima', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Sumbawa Barat', minimum_wage: 2673861 },
  { province: 'Nusa Tenggara Barat', city: 'Kabupaten Lombok Utara', minimum_wage: 2673861 },

  // Nusa Tenggara Timur (NTT)
  { province: 'Nusa Tenggara Timur', city: 'Kota Kupang', minimum_wage: 2600000 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Kupang', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Timor Tengah Selatan', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Timor Tengah Utara', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Belu', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Alor', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Flores Timur', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Sikka', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Ende', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Ngada', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Manggarai', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Sumba Timur', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Sumba Barat', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Lembata', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Rote Ndao', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Manggarai Barat', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Nagekeo', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Sumba Tengah', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Sumba Barat Daya', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Manggarai Timur', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Sabu Raijua', minimum_wage: 2455898 },
  { province: 'Nusa Tenggara Timur', city: 'Kabupaten Malaka', minimum_wage: 2455898 },

  // Kalimantan Barat
  { province: 'Kalimantan Barat', city: 'Kota Pontianak', minimum_wage: 3150000 },
  { province: 'Kalimantan Barat', city: 'Kota Singkawang', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Sambas', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Mempawah', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Sanggau', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Ketapang', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Sintang', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Kapuas Hulu', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Bengkayang', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Landak', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Sekadau', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Melawi', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Kayong Utara', minimum_wage: 3054552 },
  { province: 'Kalimantan Barat', city: 'Kabupaten Kubu Raya', minimum_wage: 3054552 },

  // Kalimantan Tengah
  { province: 'Kalimantan Tengah', city: 'Kota Palangka Raya', minimum_wage: 3750000 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Kotawaringin Barat', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Kotawaringin Timur', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Kapuas', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Barito Selatan', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Barito Utara', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Sukamara', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Lamandau', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Seruyan', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Katingan', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Pulang Pisau', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Gunung Mas', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Barito Timur', minimum_wage: 3686138 },
  { province: 'Kalimantan Tengah', city: 'Kabupaten Murung Raya', minimum_wage: 3686138 },

  // Kalimantan Selatan
  { province: 'Kalimantan Selatan', city: 'Kota Banjarmasin', minimum_wage: 3850000 },
  { province: 'Kalimantan Selatan', city: 'Kota Banjarbaru', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Tanah Laut', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Kotabaru', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Banjar', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Barito Kuala', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Tapin', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Hulu Sungai Selatan', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Hulu Sungai Tengah', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Hulu Sungai Utara', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Tabalong', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Tanah Bumbu', minimum_wage: 3725000 },
  { province: 'Kalimantan Selatan', city: 'Kabupaten Balangan', minimum_wage: 3725000 },

  // Kalimantan Timur
  { province: 'Kalimantan Timur', city: 'Kota Samarinda', minimum_wage: 3900000 },
  { province: 'Kalimantan Timur', city: 'Kota Balikpapan', minimum_wage: 3850000 },
  { province: 'Kalimantan Timur', city: 'Kota Bontang', minimum_wage: 3762431 },
  { province: 'Kalimantan Timur', city: 'Kabupaten Paser', minimum_wage: 3762431 },
  { province: 'Kalimantan Timur', city: 'Kabupaten Kutai Kartanegara', minimum_wage: 3762431 },
  { province: 'Kalimantan Timur', city: 'Kabupaten Berau', minimum_wage: 3762431 },
  { province: 'Kalimantan Timur', city: 'Kabupaten Kutai Barat', minimum_wage: 3762431 },
  { province: 'Kalimantan Timur', city: 'Kabupaten Kutai Timur', minimum_wage: 3762431 },
  { province: 'Kalimantan Timur', city: 'Kabupaten Penajam Paser Utara', minimum_wage: 3762431 },
  { province: 'Kalimantan Timur', city: 'Kabupaten Mahakam Ulu', minimum_wage: 3762431 },

  // Kalimantan Utara
  { province: 'Kalimantan Utara', city: 'Kota Tarakan', minimum_wage: 3900000 },
  { province: 'Kalimantan Utara', city: 'Kabupaten Bulungan', minimum_wage: 3775243 },
  { province: 'Kalimantan Utara', city: 'Kabupaten Malinau', minimum_wage: 3775243 },
  { province: 'Kalimantan Utara', city: 'Kabupaten Nunukan', minimum_wage: 3775243 },
  { province: 'Kalimantan Utara', city: 'Kabupaten Tana Tidung', minimum_wage: 3775243 },
  { province: 'Sulawesi Utara', city: 'Kota Manado', minimum_wage: 4150000 },
  { province: 'Sulawesi Utara', city: 'Kota Bitung', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kota Tomohon', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kota Kotamobagu', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Minahasa', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Minahasa Selatan', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Minahasa Utara', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Bolaang Mongondow', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Bolaang Mongondow Utara', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Sangihe', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Talaud', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Sitaro', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Minahasa Tenggara', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Bolaang Mongondow Selatan', minimum_wage: 4002630 },
  { province: 'Sulawesi Utara', city: 'Kabupaten Bolaang Mongondow Timur', minimum_wage: 4002630 },

  // Gorontalo
  { province: 'Gorontalo', city: 'Kota Gorontalo', minimum_wage: 3450000 },
  { province: 'Gorontalo', city: 'Kabupaten Gorontalo', minimum_wage: 3405144 },
  { province: 'Gorontalo', city: 'Kabupaten Boalemo', minimum_wage: 3405144 },
  { province: 'Gorontalo', city: 'Kabupaten Pohuwato', minimum_wage: 3405144 },
  { province: 'Gorontalo', city: 'Kabupaten Bone Bolango', minimum_wage: 3405144 },
  { province: 'Gorontalo', city: 'Kabupaten Gorontalo Utara', minimum_wage: 3405144 },

  // Sulawesi Tengah
  { province: 'Sulawesi Tengah', city: 'Kota Palu', minimum_wage: 3300000 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Banggai', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Poso', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Donggala', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Toli-Toli', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Buol', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Morowali', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Banggai Kepulauan', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Parigi Moutong', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Tojo Una-Una', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Sigi', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Banggai Laut', minimum_wage: 3179565 },
  { province: 'Sulawesi Tengah', city: 'Kabupaten Morowali Utara', minimum_wage: 3179565 },

  // Sulawesi Barat
  { province: 'Sulawesi Barat', city: 'Kabupaten Mamuju', minimum_wage: 3315934 },
  { province: 'Sulawesi Barat', city: 'Kabupaten Polewali Mandar', minimum_wage: 3315934 },
  { province: 'Sulawesi Barat', city: 'Kabupaten Majene', minimum_wage: 3315934 },
  { province: 'Sulawesi Barat', city: 'Kabupaten Mamasa', minimum_wage: 3315934 },
  { province: 'Sulawesi Barat', city: 'Kabupaten Pasangkayu', minimum_wage: 3315934 },
  { province: 'Sulawesi Barat', city: 'Kabupaten Mamuju Tengah', minimum_wage: 3315934 },

  // Sulawesi Selatan
  { province: 'Sulawesi Selatan', city: 'Kota Makassar', minimum_wage: 4050000 },
  { province: 'Sulawesi Selatan', city: 'Kota Parepare', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kota Palopo', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Bantaeng', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Barru', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Bone', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Bulukumba', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Enrekang', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Gowa', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Jeneponto', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Luwu', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Luwu Timur', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Luwu Utara', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Maros', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Pangkajene dan Kepulauan (Pangkep)', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Pinrang', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Sidenreng Rappang (Sidrap)', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Sinjai', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Soppeng', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Takalar', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Tana Toraja', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Toraja Utara', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Wajo', minimum_wage: 3921088 },
  { province: 'Sulawesi Selatan', city: 'Kabupaten Kepulauan Selayar', minimum_wage: 3921088 },

  // Sulawesi Tenggara
  { province: 'Sulawesi Tenggara', city: 'Kota Kendari', minimum_wage: 3450000 },
  { province: 'Sulawesi Tenggara', city: 'Kota Bau-Bau', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Kolaka', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Konawe', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Muna', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Buton', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Konawe Selatan', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Bombana', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Wakatobi', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Kolaka Utara', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Konawe Utara', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Buton Utara', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Kolaka Timur', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Konawe Kepulauan', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Muna Barat', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Buton Tengah', minimum_wage: 3306496 },
  { province: 'Sulawesi Tenggara', city: 'Kabupaten Buton Selatan', minimum_wage: 3306496 },

  // Maluku & Maluku Utara
  { province: 'Maluku', city: 'Kota Ambon', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kota Tual', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Maluku Tengah', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Maluku Tenggara', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Buru', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Kepulauan Aru', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Seram Bagian Barat', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Seram Bagian Timur', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Kepulauan Tanimbar', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Buru Selatan', minimum_wage: 3334490 },
  { province: 'Maluku', city: 'Kabupaten Maluku Barat Daya', minimum_wage: 3334490 },
  { province: 'Maluku Utara', city: 'Kota Ternate', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kota Tidore Kepulauan', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Halmahera Barat', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Halmahera Tengah', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Halmahera Utara', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Halmahera Selatan', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Kepulauan Sula', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Halmahera Timur', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Pulau Morotai', minimum_wage: 3510240 },
  { province: 'Maluku Utara', city: 'Kabupaten Pulau Taliabu', minimum_wage: 3510240 },

  // Papua (All 6 Papua Provinces)
  { province: 'Papua', city: 'Kota Jayapura', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Jayapura', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Biak Numfor', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Kepulauan Yapen', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Merauke', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Mimika', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Sarmi', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Keerom', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Waropen', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Supiori', minimum_wage: 4436283 },
  { province: 'Papua', city: 'Kabupaten Mamberamo Raya', minimum_wage: 4436283 },
  { province: 'Papua Barat', city: 'Kabupaten Manokwari', minimum_wage: 3841000 },
  { province: 'Papua Barat', city: 'Kabupaten Fakfak', minimum_wage: 3841000 },
  { province: 'Papua Barat', city: 'Kabupaten Teluk Wondama', minimum_wage: 3841000 },
  { province: 'Papua Barat', city: 'Kabupaten Teluk Bintuni', minimum_wage: 3841000 },
  { province: 'Papua Barat', city: 'Kabupaten Kaimana', minimum_wage: 3841000 },
  { province: 'Papua Barat', city: 'Kabupaten Manokwari Selatan', minimum_wage: 3841000 },
  { province: 'Papua Barat', city: 'Kabupaten Pegunungan Arfak', minimum_wage: 3841000 },
  { province: 'Papua Selatan', city: 'Kabupaten Asmat', minimum_wage: 4508100 },
  { province: 'Papua Selatan', city: 'Kabupaten Boven Digoel', minimum_wage: 4508100 },
  { province: 'Papua Selatan', city: 'Kabupaten Mappi', minimum_wage: 4508100 },
  { province: 'Papua Tengah', city: 'Kabupaten Nabire', minimum_wage: 4285848 },
  { province: 'Papua Tengah', city: 'Kabupaten Paniai', minimum_wage: 4285848 },
  { province: 'Papua Tengah', city: 'Kabupaten Puncak Jaya', minimum_wage: 4285848 },
  { province: 'Papua Tengah', city: 'Kabupaten Intan Jaya', minimum_wage: 4285848 },
  { province: 'Papua Tengah', city: 'Kabupaten Deiyai', minimum_wage: 4285848 },
  { province: 'Papua Tengah', city: 'Kabupaten Dogiyai', minimum_wage: 4285848 },
  { province: 'Papua Tengah', city: 'Kabupaten Puncak', minimum_wage: 4285848 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Jayawijaya', minimum_wage: 4508714 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Pegunungan Bintang', minimum_wage: 4508714 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Yakuhimo', minimum_wage: 4508714 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Tolikara', minimum_wage: 4508714 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Lanny Jaya', minimum_wage: 4508714 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Mamberamo Tengah', minimum_wage: 4508714 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Nduga', minimum_wage: 4508714 },
  { province: 'Papua Pegunungan', city: 'Kabupaten Yalimo', minimum_wage: 4508714 },
  { province: 'Papua Barat Daya', city: 'Kota Sorong', minimum_wage: 3766000 },
  { province: 'Papua Barat Daya', city: 'Kabupaten Sorong', minimum_wage: 3766000 },
  { province: 'Papua Barat Daya', city: 'Kabupaten Sorong Selatan', minimum_wage: 3766000 },
  { province: 'Papua Barat Daya', city: 'Kabupaten Raja Ampat', minimum_wage: 3766000 },
  { province: 'Papua Barat Daya', city: 'Kabupaten Tambrauw', minimum_wage: 3766000 },
  { province: 'Papua Barat Daya', city: 'Kabupaten Maybrat', minimum_wage: 3766000 }
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

// Seed city minimum wages
console.log('  → Seeding city minimum wages...');
for (const city of cityMinimumWages) {
  await connection.query(
    `INSERT INTO city_minimum_wages (province, city, minimum_wage)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       minimum_wage = VALUES(minimum_wage)`,
    [city.province, city.city, city.minimum_wage]
  );
}
console.log(`  ✅ ${cityMinimumWages.length} city minimum wages berhasil di-seed`);

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
