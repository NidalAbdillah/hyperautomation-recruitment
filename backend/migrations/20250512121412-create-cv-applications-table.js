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
    // Di dalam async up (queryInterface, Sequelize) { ... }

    console.log("Menjalankan migrasi: create-cv-applications-table UP");
    // Membuat tabel cv_applications
    await queryInterface.createTable("cv_applications", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Tetapkan constraint UNIQUE
      },
      cvFileName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cvFileObjectKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Tetapkan constraint UNIQUE
      },
      researchInterest: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      qualification: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agreeTerms: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: Sequelize.STRING, // Sesuaikan tipe jika di model pakai ENUM/TEXT
        allowNull: false,
        defaultValue: "Submitted",
      },
      score: {
        type: Sequelize.FLOAT, // Atau INTEGER jika perlu
        allowNull: true,
        defaultValue: null,
      },
      justification: {
        type: Sequelize.TEXT, // Sesuaikan tipe
        allowNull: true,
        defaultValue: null,
      },
      isArchived: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // *** Foreign Key ke tabel internship_positions ***
      appliedPositionId: {
        // Nama kolom Foreign Key
        type: Sequelize.INTEGER,
        references: {
          model: "internship_positions", // Nama tabel yang dituju (sudah ada di migrasi sebelumnya)
          key: "id", // Kolom primary key di tabel yang dituju
        },
        onUpdate: "CASCADE", // Opsional
        onDelete: "SET NULL", // Opsional
        allowNull: true, // Sesuaikan
      },
    });
    console.log("Tabel cv_applications berhasil dibuat");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Di dalam async down (queryInterface, Sequelize) { ... }

    console.log("Menjalankan migrasi: create-cv-applications-table DOWN");
    await queryInterface.dropTable("cv_applications");
    console.log("Tabel cv_applications dihapus");
  },
};
