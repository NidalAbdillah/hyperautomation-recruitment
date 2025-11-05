'use strict';

// Nama Tipe ENUM Anda dari error log
const ENUM_NAME = 'enum_job_positions_status'; // Diambil dari error log (enum_internship_positions_status)
// PASTIKAN NAMA INI BENAR. Cek error log Anda: 'enum_internship_positions_status'
// GANTI 'enum_job_positions_status' DI BAWAH JIKA NAMA ANDA BEDA

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // Menambahkan 'Approved' dan 'Rejected' ke ENUM
      await queryInterface.sequelize.query(
        `ALTER TYPE "${ENUM_NAME}" ADD VALUE IF NOT EXISTS 'Approved';`
      );
      await queryInterface.sequelize.query(
        `ALTER TYPE "${ENUM_NAME}" ADD VALUE IF NOT EXISTS 'Rejected';`
      );
    } catch (error) {
      console.error('Error adding values to ENUM:', error);
      // Jika ENUM tidak ditemukan (misal, salah nama), kita coba buat dari awal
      // Ini hanya fallback, seharusnya tidak terjadi jika nama ENUM benar
      if (error.message.includes("type \"enum_job_positions_status\" does not exist")) {
         console.log("ENUM not found, creating new ENUM type (this might fail if column exists)...");
         await queryInterface.sequelize.query(
           "CREATE TYPE enum_job_positions_status AS ENUM('Draft', 'Open', 'Closed', 'Approved', 'Rejected');"
         );
         // Lalu coba ubah kolomnya agar menggunakan ENUM baru ini
         // (Ini akan GAGAL jika kolom 'status' sudah ada, tapi ini adalah fallback)
      } else {
         throw error; // Lempar error asli jika bukan 'does not exist'
      }
    }
  },

  async down (queryInterface, Sequelize) {
    // PENTING: PostgreSQL TIDAK MENDUKUNG PENGHAPUSAN NILAI ENUM (ENUM Value)
    // Kita tidak bisa me-rollback ini dengan aman.
    console.log("Rollback 'addEnumValues' tidak didukung penuh di PostgreSQL.");
    // Kita bisa membiarkannya kosong atau mencoba me-rename (yang berisiko)
  }
};