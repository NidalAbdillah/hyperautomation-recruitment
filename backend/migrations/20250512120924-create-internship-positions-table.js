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

    console.log("Menjalankan migrasi: create-internship-positions-table UP");
    // Membuat tabel internship_positions
    await queryInterface.createTable("internship_positions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Tetapkan constraint UNIQUE di sini saat mendefinisikan tabel
        comment: "Nama atau judul posisi magang",
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Lokasi magang",
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Durasi magang",
      },
      registrationStartDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Tanggal mulai pendaftaran",
      },
      registrationEndDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Tanggal akhir pendaftaran",
      },
      specificRequirements: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Persyaratan spesifik",
      },
      availableSlots: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Jumlah slot tersedia",
      },
      status: {
        type: Sequelize.ENUM("Draft", "Open", "Closed"), // Sesuaikan jika di model pakai ENUM
        allowNull: false,
        defaultValue: "Draft",
        comment: "Status posisi",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // TIDAK ADA Foreign Key keluar dari tabel internship_positions dalam definisi ini
    });
    console.log("Tabel internship_positions berhasil dibuat");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Di dalam async down (queryInterface, Sequelize) { ... }

    console.log("Menjalankan migrasi: create-internship-positions-table DOWN");
    await queryInterface.dropTable("internship_positions");
    console.log("Tabel internship_positions dihapus");
  },
};
