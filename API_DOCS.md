# InklusiKerja — Backend API Documentation

Base URL: `http://localhost:3000`

---

## Setup & Instalasi

```bash
# 1. Clone / masuk ke folder project
cd inklusikerja-backend

# 2. Install dependencies
npm install

# 3. Buat file .env dari contoh
cp .env.example .env
# → Edit .env sesuai konfigurasi database kamu

# 4. Buat database PostgreSQL
createdb inklusikerja_db
# atau via psql: CREATE DATABASE inklusikerja_db;

# 5. Jalankan migrasi (buat semua tabel)
npm run migrate

# 6. Jalankan seeder (isi disability types & job titles)
npm run seed

# 7. Jalankan server
npm run dev    # mode development (auto-restart)
npm start      # mode production
```

---

## Ringkasan Semua Endpoint

| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/health` | ❌ | - | Cek server hidup |
| POST | `/api/auth/register` | ❌ | - | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | - | Login |
| GET | `/api/auth/me` | ✅ | semua | Info user login |
| GET | `/api/ref/disability-types` | ❌ | - | Daftar tipe disabilitas |
| GET | `/api/ref/job-titles` | ❌ | - | Daftar job title |
| GET | `/api/ref/umk` | ❌ | - | Daftar UMK per kota |
| GET | `/api/jobs` | ❌ | - | Semua lowongan |
| GET | `/api/jobs/:id` | ❌ | - | Detail lowongan |
| POST | `/api/jobs` | ✅ | perusahaan | Buat lowongan |
| DELETE | `/api/jobs/:id` | ✅ | perusahaan | Hapus lowongan |
| GET | `/api/kandidat/profile` | ✅ | kandidat | Lihat profil kandidat |
| POST | `/api/kandidat/profile` | ✅ | kandidat | Simpan profil kandidat |
| GET | `/api/kandidat/applications` | ✅ | kandidat | Riwayat lamaran |
| POST | `/api/match` | ✅ | kandidat | Lamar + matching |
| GET | `/api/match/last` | ✅ | kandidat | Hasil matching terakhir |
| GET | `/api/perusahaan/profile` | ✅ | perusahaan | Lihat profil perusahaan |
| POST | `/api/perusahaan/profile` | ✅ | perusahaan | Simpan profil perusahaan |
| GET | `/api/perusahaan/kandidat` | ✅ | perusahaan | Daftar kandidat yang melamar |
| GET | `/api/perusahaan/laporan/:candidateId` | ✅ | perusahaan | Laporan detail kandidat |

---

## Testing dengan cURL

### 1. Health Check
```bash
curl http://localhost:3000/health
```

---

### 2. Register Kandidat
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi@gmail.com",
    "password": "password123",
    "name": "Budi Santoso",
    "role": "kandidat"
  }'
```

### 3. Register Perusahaan
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@tokopedia.com",
    "password": "password123",
    "name": "Tokopedia HR",
    "role": "perusahaan"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "budi@gmail.com", "password": "password123"}'

# Simpan token dari response, contoh:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 5. Lihat Daftar Tipe Disabilitas (untuk isi form)
```bash
curl http://localhost:3000/api/ref/disability-types
```

### 6. Lihat Daftar Job Title
```bash
curl http://localhost:3000/api/ref/job-titles
```

---

### 7. Simpan Profil Kandidat
```bash
curl -X POST http://localhost:3000/api/kandidat/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Budi Santoso",
    "location": "Jakarta",
    "functional_profile": "Saya penyandang tunanetra yang berpengalaman di bidang web development",
    "disability_type_ids": [1],
    "skills": ["JavaScript", "React", "Node.js", "CSS"]
  }'
```

### 8. Lihat Profil Kandidat
```bash
curl http://localhost:3000/api/kandidat/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. Simpan Profil Perusahaan (gunakan token perusahaan)
```bash
COMPANY_TOKEN="token_dari_login_perusahaan..."

curl -X POST http://localhost:3000/api/perusahaan/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{
    "company_name": "Tokopedia",
    "location": "Jakarta",
    "office_conditions": ["Ramp akses tersedia", "Lift aksesibel", "Toilet khusus disabilitas"]
  }'
```

### 10. Buat Lowongan Kerja (sebagai perusahaan)
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{
    "title": "Frontend Developer",
    "description": "Kami mencari Frontend Developer yang berpengalaman dengan React",
    "location": "Jakarta",
    "offered_salary": "8000000",
    "job_title_id": 1,
    "required_skills": ["JavaScript", "React", "CSS", "HTML"],
    "disability_accommodations": [
      {"disability_type_id": 1, "accommodation": "Screen reader tersedia di semua workstation"},
      {"disability_type_id": 2, "accommodation": "Caption tools di semua meeting"}
    ]
  }'
```

### 11. Lihat Semua Lowongan
```bash
curl http://localhost:3000/api/jobs

# Dengan filter:
curl "http://localhost:3000/api/jobs?location=Jakarta&title=Developer"
```

---

### 12. Lamar Lowongan + Matching (sebagai kandidat)
```bash
JOB_ID="uuid-lowongan-dari-response-sebelumnya"

curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"job_id\": \"$JOB_ID\"}"
```

### 13. Lihat Hasil Matching Terakhir
```bash
curl http://localhost:3000/api/match/last \
  -H "Authorization: Bearer $TOKEN"
```

---

### 14. Lihat Kandidat yang Melamar (sebagai perusahaan)
```bash
curl http://localhost:3000/api/perusahaan/kandidat \
  -H "Authorization: Bearer $COMPANY_TOKEN"
```

### 15. Laporan Detail Kandidat
```bash
CANDIDATE_ID="uuid-kandidat..."

curl http://localhost:3000/api/perusahaan/laporan/$CANDIDATE_ID \
  -H "Authorization: Bearer $COMPANY_TOKEN"
```

---

## Testing dengan Postman / Insomnia

Import collection ini atau buat environment variable:
- `BASE_URL` = `http://localhost:3000`
- `TOKEN` = (isi setelah login)
- `COMPANY_TOKEN` = (isi setelah login sebagai perusahaan)

---

## Struktur Response

### Success
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error
```json
{
  "error": "Pesan error dalam Bahasa Indonesia"
}
```

### Match Result
```json
{
  "success": true,
  "match_result": {
    "match_score": 85,
    "matched_skills": ["JavaScript", "React"],
    "gap_skills": ["TypeScript"],
    "accommodations": ["Screen Reader tersedia", "..."],
    "wage_status": "LAYAK",
    "umk_value": 5067381,
    "offered_salary": 8000000,
    "wage_gap": 2932619,
    "umk_label": "UMK Jakarta 2026",
    "job": { "title": "Frontend Developer", ... },
    "candidate": { "name": "Budi Santoso", ... }
  }
}
```
