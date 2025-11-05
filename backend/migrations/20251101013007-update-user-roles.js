'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'staff_hr'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Admin'
    });
  }
};