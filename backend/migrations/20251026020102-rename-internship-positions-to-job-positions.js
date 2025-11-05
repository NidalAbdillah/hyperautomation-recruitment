'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log("Mengganti nama tabel 'internship_positions' menjadi 'job_positions'...");
    // Perintah untuk MENGGANTI NAMA TABEL
    await queryInterface.renameTable('internship_positions', 'job_positions');
    console.log("Nama tabel berhasil diubah menjadi 'job_positions'.");
  },

  async down (queryInterface, Sequelize) {
    console.log("Mengembalikan nama tabel 'job_positions' menjadi 'internship_positions' (rollback)...");
    // Perintah untuk MENGEMBALIKAN NAMA TABEL jika rollback
    await queryInterface.renameTable('job_positions', 'internship_positions');
    console.log("Nama tabel berhasil dikembalikan menjadi 'internship_positions'.");
  }
};