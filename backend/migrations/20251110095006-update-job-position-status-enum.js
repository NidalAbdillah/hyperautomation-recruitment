'use strict';

// Nama ENUM di PostgreSQL (biasanya: enum_TABEL_KOLOM)
const ENUM_NAME = 'enum_job_positions_status';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log('Renaming ENUM values for job_positions...');

    // 1. Ubah nama nilai ENUM satu per satu
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'Draft' TO 'DRAFT'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'Open' TO 'OPEN'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'Closed' TO 'CLOSED'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'Approved' TO 'APPROVED'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'Rejected' TO 'REJECTED'`);
    console.log('ENUM values renamed to UPPERCASE.');

    // 2. Ubah default value di kolom
    await queryInterface.sequelize.query(`ALTER TABLE "job_positions" ALTER COLUMN "status" DROP DEFAULT`);
    await queryInterface.sequelize.query(`ALTER TABLE "job_positions" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
    console.log('Default value updated to DRAFT.');
  },

  async down (queryInterface, Sequelize) {
    console.log('Reverting ENUM values for job_positions...');
    
    // 1. Kembalikan nama nilai ENUM
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'DRAFT' TO 'Draft'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'OPEN' TO 'Open'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'CLOSED' TO 'Closed'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'APPROVED' TO 'Approved'`);
    await queryInterface.sequelize.query(`ALTER TYPE "${ENUM_NAME}" RENAME VALUE 'REJECTED' TO 'Rejected'`);
    console.log('ENUM values reverted to TitleCase.');

    // 2. Kembalikan default value
    await queryInterface.sequelize.query(`ALTER TABLE "job_positions" ALTER COLUMN "status" DROP DEFAULT`);
    await queryInterface.sequelize.query(`ALTER TABLE "job_positions" ALTER COLUMN "status" SET DEFAULT 'Draft'`);
    console.log('Default value reverted to Draft.');
  }
};