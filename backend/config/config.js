// backend/config/config.js
require("dotenv").config(); // Pastikan ini membaca .env Anda

const development = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432, // Parse port
  dialect: process.env.DB_DIALECT,
};

module.exports = {
  development,
  test: development,
  production: development,
};
