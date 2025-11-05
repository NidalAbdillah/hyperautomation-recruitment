'use strict';

// Ambil nama ENUM yang error dari log Anda
const ENUM_NAME = 'enum_internship_positions_status'; 

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log(`Mengubah kolom "status" menjadi VARCHAR(255)...`);
    // 1. Ubah tipe kolom menjadi STRING
    await queryInterface.changeColumn('job_positions', 'status', {
      type: Sequelize.STRING(255), // Ganti ke STRING
      allowNull: false,
      defaultValue: 'Draft'
    });
    
    console.log(`Menghapus tipe ENUM lama: ${ENUM_NAME}...`);
    // 2. Hapus tipe ENUM yang bermasalah
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${ENUM_NAME}";`);
  },

  async down (queryInterface, Sequelize) {
    // (Rollback) Ini SULIT karena ENUM sudah dihapus.
    // Kita akan coba buat ulang ENUM lama (Draft, Open, Closed)
    console.log(`Rollback: Membuat ulang ENUM ${ENUM_NAME} (versi lama)...`);
    await queryInterface.sequelize.query(
      "CREATE TYPE enum_internship_positions_status AS ENUM('Draft', 'Open', 'Closed');"
    );
    await queryInterface.changeColumn('job_positions', 'status', {
      type: 'enum_internship_positions_status', // Tipe ENUM lama
      allowNull: false,
      defaultValue: 'Draft',
      // 'USING' diperlukan oleh Postgres untuk konversi
      using: 'status::enum_internship_positions_status' 
    });
  }
};