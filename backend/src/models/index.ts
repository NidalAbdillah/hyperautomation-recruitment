// src/models/index.ts
import { Sequelize } from "sequelize";
import { sequelize, initializeDatabase as connectToDB } from "../config/database";

// Import semua model secara eksplisit agar TypeScript mengenali tipe datanya.
import User from "./user.model";
import JobPosition from "./jobPosition.model";
import CvApplication from "./cvApplication.model";
import Schedule from "./schedule.model"; 

// Mengumpulkan semua model dalam satu objek 'db' untuk kemudahan akses (opsional, tapi rapi).
const db = {
  sequelize,
  Sequelize,
  User,
  JobPosition,
  CvApplication,
  Schedule,
};

// =================================================================
// DEFINISI ASOSIASI (RELASI ANTAR TABEL)
// Bagian ini mendefinisikan aturan "Join" agar bisa melakukan Eager Loading (include).
// =================================================================

// 1. Relasi: Lowongan <-> Pelamar (One-to-Many)
// Logika: Satu Posisi Kerja (misal: "Backend Dev") bisa memiliki BANYAK Pelamar.
// Alur: Saat buka detail lowongan, kita bisa langsung tarik daftar semua pelamarnya.
JobPosition.hasMany(CvApplication, {
  foreignKey: "appliedPositionId",
  as: "applications", // Alias untuk dipakai di query: include: ['applications']
});

// Kebalikannya: Satu Pelamar hanya melamar untuk SATU Posisi spesifik (pada satu waktu).
CvApplication.belongsTo(JobPosition, {
  foreignKey: "appliedPositionId",
  as: "appliedPosition", // Alias: pelamar.appliedPosition.name
});


// 2. Relasi: User (Manager) <-> Lowongan (One-to-Many)
// Logika: Satu Manager bisa me-request BANYAK Lowongan kerja.
// Alur: Fitur Audit. Head HR bisa melihat "Manager A ini minta pegawai apa saja sih bulan ini?".
User.hasMany(JobPosition, {
  foreignKey: 'requestedById',
  as: 'requestedPositions'
});

// Kebalikannya: Satu Lowongan pasti diminta oleh SATU User (Requestor).
JobPosition.belongsTo(User, {
  foreignKey: 'requestedById',
  as: 'requestor' // Alias: job.requestor.name (Untuk menampilkan "Requested By: Nidal")
});


// 3. Relasi: Pelamar <-> Jadwal Interview (One-to-One)
// Logika: Satu Pelamar memiliki SATU Jadwal Interview aktif.
// Alur: Menghubungkan data kandidat dengan slot waktu di Google Calendar.
CvApplication.hasOne(Schedule, {
  foreignKey: "applicationId",
  as: "schedule", 
});

// Kebalikannya: Satu Jadwal Interview pasti milik SATU Pelamar.
Schedule.belongsTo(CvApplication, {
  foreignKey: "applicationId",
  as: "application", // Alias: schedule.application.fullName (Untuk judul event di kalender)
});

console.log("Database models associations established.");

// Fungsi inisialisasi database yang akan dipanggil di 'app.ts' saat server nyala.
const initializeDatabase = async () => {
  try {
    await connectToDB(); // Tes koneksi ke PostgreSQL
    console.log("Database connection authenticated successfully.");
  } catch (error) {
    console.error("Failed to authenticate database connection:", error);
    process.exit(1); // Matikan server jika DB gagal konek (Fatal Error).
  }
};

// Ekspor modul agar bisa dipakai di Controller/Service.
export {
  sequelize,
  initializeDatabase, 
  User,
  JobPosition,
  CvApplication,
  Schedule, 
};

export default db;