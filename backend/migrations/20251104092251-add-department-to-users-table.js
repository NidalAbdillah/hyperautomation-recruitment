'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'department', {
      type: Sequelize.STRING,
      allowNull: true, // Boleh null (misal untuk 'head_hr'/'staff_hr')
      comment: 'Departemen tempat user bernaung (khususnya manager)'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'department');
  }
};