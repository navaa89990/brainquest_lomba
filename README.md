# BrainQuest

BrainQuest adalah aplikasi platform pembelajaran berbasis web yang dilengkapi dengan fitur kuis interaktif, sistem manajemen materi, dan autentikasi OAuth Google. Proyek ini dikembangkan sebagai bagian dari partisipasi dalam Software Engineering Festival 2026.

## 🚀 Fitur Utama
- **Autentikasi**: Login aman menggunakan Google OAuth.
- **Kuis Interaktif**: Fitur kuis untuk menguji pemahaman materi.
- **Manajemen Materi**: Akses mudah ke modul pembelajaran.
- **Data Terintegrasi**: Menggunakan SQLite untuk penyimpanan lokal yang efisien.

## 🛠️ Tech Stack
- **Frontend**: React, Vite.
- **Backend**: Node.js, Express, Passport.js.
- **Database**: SQLite.
- **Tools**: GitHub Copilot, Office.

## ⚙️ Cara Instalasi & Menjalankan Aplikasi

Pastikan kamu sudah menginstall [Node.js](https://nodejs.org/) di komputer kamu.

### 1. Clone Repository
```bash
git clone [https://github.com/navaa89990/brainquest_lomba.git](https://github.com/navaa89990/brainquest_lomba.git)
cd brainquest_lomba

lalu masing masing lakukan peng install an di folder backend dan juga frontend
cd frontend
npm install
npm run dev

### 2. Setup Backend
```bash
cd backend
npm install
# Inisialisasi database
npm run setup
# Jalankan server
npm run start / node server.js

