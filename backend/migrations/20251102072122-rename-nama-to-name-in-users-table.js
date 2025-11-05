'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Mengubah nama kolom 'nama' menjadi 'name' di tabel 'users'.
     */
    await queryInterface.renameColumn('users', 'nama', 'name');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Mengembalikan nama kolom 'name' menjadi 'nama' jika di-rollback.
     */
    await queryInterface.renameColumn('users', 'name', 'nama');
  }
};