'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('schedules', 'applicationId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Boleh null (untuk event manual HR seperti "Libur Nasional")
      references: {
        model: 'cv_applications', // Nama tabel target
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Jika aplikasi (kandidat) dihapus, jadwalnya tidak ikut terhapus
      comment: 'ID dari cv_applications jika ini adalah event wawancara'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('schedules', 'applicationId');
  }
};