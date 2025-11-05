// file: migrations/XXXXXXXX-allow-null-dates-in-job-positions.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Mengizinkan 'registrationStartDate' menjadi NULL
    await queryInterface.changeColumn('job_positions', 'registrationStartDate', {
      type: Sequelize.DATE,
      allowNull: true // <-- PERBAIKAN
    });
    // Mengizinkan 'registrationEndDate' menjadi NULL
    await queryInterface.changeColumn('job_positions', 'registrationEndDate', {
      type: Sequelize.DATE,
      allowNull: true // <-- PERBAIKAN
    });
  },

  async down (queryInterface, Sequelize) {
    // (Rollback) Mengembalikan ke NOT NULL
    await queryInterface.changeColumn('job_positions', 'registrationStartDate', {
      type: Sequelize.DATE,
      allowNull: false
    });
    await queryInterface.changeColumn('job_positions', 'registrationEndDate', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};