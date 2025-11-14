'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Judul event atau jadwal'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Waktu mulai event'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Waktu selesai event'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true, // Deskripsi boleh kosong
        comment: 'Deskripsi atau detail event'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('schedules');
  }
};