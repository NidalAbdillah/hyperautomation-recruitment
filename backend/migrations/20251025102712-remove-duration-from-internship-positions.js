'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Perintah untuk MENGHAPUS kolom 'duration'
    console.log("Menghapus kolom 'duration' dari tabel 'internship_positions'...");
    await queryInterface.removeColumn('internship_positions', 'duration');
    console.log("Kolom 'duration' berhasil dihapus.");
  },

  async down (queryInterface, Sequelize) {
    // Perintah untuk MENAMBAHKAN KEMBALI kolom 'duration' jika rollback
    console.log("Menambahkan kembali kolom 'duration' ke tabel 'internship_positions'...");
    await queryInterface.addColumn('internship_positions', 'duration', {
      type: Sequelize.STRING, 
      allowNull: true, // Set ke true agar rollback lebih aman, atau sesuaikan dgn sebelumnya
      // after: 'location' // Tentukan posisi kolom jika perlu
    });
    console.log("Kolom 'duration' berhasil ditambahkan kembali.");
  }
};