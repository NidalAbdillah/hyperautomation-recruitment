"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Perintah ini akan menghapus constraint UNIQUE dari kolom 'email'
    await queryInterface.removeConstraint("cv_applications", "cv_applications_email_key");
  },

  async down(queryInterface, Sequelize) {
    // Perintah ini akan mengembalikan constraint UNIQUE jika Anda perlu rollback
    await queryInterface.addConstraint("cv_applications", {
      fields: ["email"],
      type: "unique",
      name: "cv_applications_email_key",
    });
  },
};
