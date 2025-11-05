// backend/migrations/20251105031719-final-fix-status-enum-to-varchar.js
'use strict';

// Ambil nama ENUM yang error dari log Anda
const ENUM_NAME = 'enum_internship_positions_status'; // (Anda mungkin perlu ganti ini jika beda)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      console.log(`Langkah 1: Mengubah kolom "status" menjadi VARCHAR(255)...`);
      await queryInterface.changeColumn('job_positions', 'status', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Draft'
      }, { transaction: t });

      console.log(`Langkah 2: Menghapus 'DEFAULT' lama yang terikat ke ENUM...`);
      // Ini adalah langkah "anti-challenge" (anti-bantah) yang krusial
      await queryInterface.sequelize.query(
        `ALTER TABLE "job_positions" ALTER COLUMN "status" DROP DEFAULT;`,
        { transaction: t }
      );
      
      console.log(`Langkah 3: Menghapus tipe ENUM lama: ${ENUM_NAME}...`);
      // Sekarang aman untuk dihapus karena 'DEFAULT' sudah hilang
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "${ENUM_NAME}";`,
        { transaction: t }
      );
      
      // (Opsional) Set default value (nilai default) baru sebagai string (teks)
      await queryInterface.changeColumn('job_positions', 'status', {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: 'Draft'
      }, { transaction: t });


      await t.commit();
      console.log("Migrasi 'status' ke VARCHAR berhasil.");

    } catch (error) {
      await t.rollback();
      console.error("Migrasi 'status' ke VARCHAR gagal:", error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    // (Rollback) (Ini akan sulit, tapi kita coba kembalikan ke ENUM lama)
    console.log(`Rollback: Membuat ulang ENUM ${ENUM_NAME} (versi lama)...`);
    await queryInterface.sequelize.query(
      "CREATE TYPE enum_internship_positions_status AS ENUM('Draft', 'Open', 'Closed');"
    );
    await queryInterface.changeColumn('job_positions', 'status', {
      type: 'enum_internship_positions_status', 
      allowNull: false,
      defaultValue: 'Draft',
      using: 'status::enum_internship_positions_status' 
    });
  }
};