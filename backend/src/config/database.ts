// src/config/database.ts
import { Sequelize, Dialect } from "sequelize";
import config from "./index"; // Mengambil dari config TS yang baru

// Validasi bahwa konfigurasi DB ada
if (
  !config.db.name ||
  !config.db.user ||
  !config.db.password ||
  !config.db.host ||
  !config.db.dialect
) {
  throw new Error("Database configuration variables (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_DIALECT) are missing in .env");
}

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect as Dialect, // Casting tipe string ke Dialect
    logging: false, // Matikan logging SQL di console (bisa diubah ke 'true' untuk debug)

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

/**
 * Mengautentikasi koneksi ke database.
 * Fungsi ini dipanggil oleh app.ts saat inisialisasi.
 */
const initializeDatabase = async () => { // <-- NAMA DIUBAH (dari connectDB)
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    // Keluar saat tidak terhubung
    process.exit(1);
  }
};

export { sequelize, initializeDatabase }; // <-- EXPORT NAMA BARU