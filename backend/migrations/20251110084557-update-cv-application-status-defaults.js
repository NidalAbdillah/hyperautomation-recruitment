'use strict';

// Daftar status baru Anda
const NEW_STATUSES = [
  "SUBMITTED",
  "REVIEWED",
  "STAFF_APPROVED",
  "STAFF_REJECTED",
  "INTERVIEW_QUEUED",
  "INTERVIEW_SCHEDULED",
  "PENDING_FINAL_DECISION",
  "HIRED",
  "NOT_HIRED",
  "ONBOARDING"
];

// Nama Tipe ENUM yang akan dibuat di PostgreSQL
const ENUM_NAME = 'enum_cv_applications_status';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log('Migrating status column to ENUM with new default...');
    
    // 1. Update data yang ada ke format UPPERCASE
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'SUBMITTED' WHERE "status" = 'Submitted'`);
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'REVIEWED' WHERE "status" = 'Reviewed'`);
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'STAFF_APPROVED' WHERE "status" = 'Accepted'`);
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'STAFF_REJECTED' WHERE "status" = 'Rejected'`);
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'INTERVIEW_QUEUED' WHERE "status" = 'Interview_Queued'`);
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'INTERVIEW_SCHEDULED' WHERE "status" = 'Interview_Scheduled'`);
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'PENDING_FINAL_DECISION' WHERE "status" = 'Waiting_HR_Final'`);
    console.log('Data updated to UPPERCASE.');

    // 2. Buat Tipe ENUM baru di database
    const statuses = NEW_STATUSES.map(s => `'${s}'`).join(', ');
    await queryInterface.sequelize.query(`CREATE TYPE "${ENUM_NAME}" AS ENUM(${statuses})`);
    console.log(`New ENUM type "${ENUM_NAME}" created.`);

    // 3. Hapus default LAMA
    await queryInterface.sequelize.query(`ALTER TABLE "cv_applications" ALTER COLUMN "status" DROP DEFAULT`);
    console.log('Old default value dropped.');

    // 4. Ubah tipe kolom MENGGUNAKAN (USING) tipe ENUM baru
    await queryInterface.sequelize.query(`
      ALTER TABLE "cv_applications" 
      ALTER COLUMN "status" TYPE "${ENUM_NAME}" 
      USING ("status"::text::"${ENUM_NAME}")
    `);
    console.log('Column type changed to ENUM.');

    // 5. Set default BARU
    await queryInterface.sequelize.query(`ALTER TABLE "cv_applications" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED'`);
    console.log('New default value SET.');

    console.log('Status column migrated successfully.');
  },

  async down (queryInterface, Sequelize) {
    console.log('Reverting status column back to STRING...');
    
    // 1. Ubah tipe kembali ke STRING (ini akan menghapus default & ENUM binding)
    await queryInterface.changeColumn('cv_applications', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Submitted' // Set default lama
    });

    // 2. Hapus Tipe ENUM yang sudah tidak terpakai
    await queryInterface.sequelize.query(`DROP TYPE "${ENUM_NAME}"`);

    // 3. Kembalikan data ke format lama
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'Submitted' WHERE "status" = 'SUBMITTED'`);
    await queryInterface.sequelize.query(`UPDATE "cv_applications" SET "status" = 'REVIEWED' WHERE "status" = 'REVIEWED'`);
    // ... (dst)

    console.log('Status column reverted to STRING.');
  }
};