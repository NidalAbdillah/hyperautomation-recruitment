'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Menambahkan kolom 'announcement' baru
    await queryInterface.addColumn('job_positions', 'announcement', {
      type: Sequelize.TEXT,
      allowNull: true, // Boleh null, karena Manager tidak mengisinya
      comment: 'Teks "pemanis" atau pengumuman yang diisi oleh Staff HR.'
    });
  },

  async down (queryInterface, Sequelize) {
    // Menghapus kolom jika di-rollback
    await queryInterface.removeColumn('job_positions', 'announcement');
  }
};