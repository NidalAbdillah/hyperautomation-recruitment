'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('job_positions', 'requestedById', {
      type: Sequelize.INTEGER,
      allowNull: true, // Boleh null jika dibuat oleh HR, bukan manajer
      references: {
        model: 'users', // Merujuk ke tabel 'users'
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID user (manager) yang me-request lowongan ini'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('job_positions', 'requestedById');
  }
};