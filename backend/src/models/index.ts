// src/models/index.ts
import { Sequelize } from "sequelize";
import { sequelize, initializeDatabase as connectToDB } from "../config/database";

// Impor setiap model SECARA EKSPLISIT
import User from "./user.model";
import JobPosition from "./jobPosition.model";
import CvApplication from "./cvApplication.model";
import Schedule from "./schedule.model"; // <-- 1. TAMBAHKAN INI

// Buat objek db untuk menampung model
const db = {
  sequelize,
  Sequelize,
  User,
  JobPosition,
  CvApplication,
  Schedule, // <-- 2. TAMBAHKAN INI
};

// --- Inisialisasi Asosiasi (Relasi) ---
JobPosition.hasMany(CvApplication, {
  foreignKey: "appliedPositionId",
  as: "applications",
});

CvApplication.belongsTo(JobPosition, {
  foreignKey: "appliedPositionId",
  as: "appliedPosition",
});

User.hasMany(JobPosition, {
  foreignKey: 'requestedById',
  as: 'requestedPositions'
});

JobPosition.belongsTo(User, {
  foreignKey: 'requestedById',
  as: 'requestor'
});

console.log("Database models associations established.");

const initializeDatabase = async () => {
  try {

    await connectToDB(); 
    
    
    console.log("Database connection authenticated successfully.");
  } catch (error) {
    console.error("Failed to authenticate database connection:", error);
    process.exit(1);
  }
};

// Ekspor
export {
  sequelize,
  initializeDatabase, // Ini yang akan dipanggil oleh app.ts
  User,
  JobPosition,
  CvApplication,
  Schedule, // <-- 3. TAMBAHKAN INI
};

export default db;