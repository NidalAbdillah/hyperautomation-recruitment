'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Perintah untuk MENAMBAH kolom baru
    await queryInterface.addColumn('cv_applications', 'cv_data', {
      type: Sequelize.JSON, // Gunakan JSON jika DB support
      // type: Sequelize.TEXT, // Fallback jika tidak support JSON
      allowNull: true,
      defaultValue: null,
      after: 'qualitative_assessment' // Opsional: setelah qualitative_assessment
    });

    await queryInterface.addColumn('cv_applications', 'requirement_data', {
      type: Sequelize.JSON, // Gunakan JSON jika DB support
      // type: Sequelize.TEXT, // Fallback jika tidak support JSON
      allowNull: true,
      defaultValue: null,
      after: 'cv_data' // Opsional: setelah cv_data
    });
  },

  async down (queryInterface, Sequelize) {
    // Perintah untuk MENGHAPUS kolom jika perlu rollback
    await queryInterface.removeColumn('cv_applications', 'cv_data');
    await queryInterface.removeColumn('cv_applications', 'requirement_data');
  }
};