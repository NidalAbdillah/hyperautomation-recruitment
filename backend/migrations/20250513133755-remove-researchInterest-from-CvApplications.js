"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    console.log("Running migration: Removing 'researchInterest' column from 'cv_applications' table...");
    await queryInterface.removeColumn("cv_applications", "researchInterest");
    console.log("'researchInterest' column removed successfully.");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    console.log("Reverting migration: Adding 'researchInterest' column back to 'cv_applications' table...");
    await queryInterface.addColumn("cv_applications", "researchInterest", {
      // Menggunakan nama tabel yang benar
      type: Sequelize.STRING, // Sesuai dengan tipe data di model Anda
      allowNull: false, // Sesuai dengan constraint NOT NULL di model Anda
    });
    console.log("'researchInterest' column added back.");
  },
};
