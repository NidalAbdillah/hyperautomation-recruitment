'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('cv_applications', 'interview_notes', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Menyimpan preferensi manajer (misal: online/offline) dan info jadwal'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cv_applications', 'interview_notes');
  }
};