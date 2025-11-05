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

    console.log("Menjalankan migrasi: create-users-table UP");
    // Membuat tabel users
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Tetapkan constraint UNIQUE
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING, // Sesuaikan tipe jika di model pakai ENUM/TEXT
        allowNull: false,
        defaultValue: "Admin",
      },
      avatarObjectKey: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // TIDAK ADA Foreign Key keluar dari tabel users dalam definisi ini
    });
    console.log("Tabel users berhasil dibuat");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Di dalam async down (queryInterface, Sequelize) { ... }

    console.log("Menjalankan migrasi: create-users-table DOWN");
    await queryInterface.dropTable("users");
    console.log("Tabel users dihapus");
  },
};
