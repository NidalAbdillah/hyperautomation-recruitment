// backend/seeders/20251102064946-create-head-hr-user.js
'use strict';
// Kita tetap pakai bcryptjs di sini, hash-nya 100% kompatibel
// dengan 'bcrypt.compare' di service TS Anda.
const bcrypt = require('bcryptjs'); 

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('hrpassword2025', 10);

    await queryInterface.bulkInsert('users', [{
      // --- PERBAIKAN DI SINI ---
      name: 'Kepala HR (Admin Utama)', // <-- Ubah 'nama' menjadi 'name'
      // --- BATAS PERBAIKAN ---
      
      email: 'head-hr@gmail.com',
      passwordHash: hashedPassword,
      role: 'head_hr',
      avatarObjectKey: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    console.log('User head_hr (admin utama) berhasil dibuat via seeder.');
  },

  async down (queryInterface, Sequelize) {
    // Fungsi 'down' Anda sudah benar (menggunakan email)
    await queryInterface.bulkDelete('users', { email: 'head-hr@gmail.com' }, {});
    console.log('User head_hr berhasil dihapus (rollback).');
  }
};