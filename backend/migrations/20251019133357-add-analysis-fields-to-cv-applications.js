'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Perintah untuk MENAMBAH kolom analysis
    await queryInterface.addColumn('cv_applications', 'similarity_score', {
      type: Sequelize.FLOAT, 
      allowNull: true,
      defaultValue: null,
      after: 'status' // Sesuaikan 'after' jika perlu
    });

    await queryInterface.addColumn('cv_applications', 'passed_hard_gate', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      after: 'similarity_score' 
    });

    await queryInterface.addColumn('cv_applications', 'qualitative_assessment', {
      type: Sequelize.JSON, // Gunakan JSON jika DB support
      // type: Sequelize.TEXT, // Fallback jika tidak support JSON
      allowNull: true,
      defaultValue: null,
      after: 'passed_hard_gate' 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cv_applications', 'similarity_score');
    await queryInterface.removeColumn('cv_applications', 'passed_hard_gate');
    await queryInterface.removeColumn('cv_applications', 'qualitative_assessment');
  }
};