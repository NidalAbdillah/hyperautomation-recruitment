'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('job_positions', 'isArchived', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Flag untuk soft delete (arsip)"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('job_positions', 'isArchived');
  }
};