// src/config/index.ts
import dotenv from "dotenv";
import { Secret } from "jsonwebtoken"; // <-- 1. IMPORT TIPE SECRET

// Muat environment variables dari .env
dotenv.config();

// Mendefinisikan tipe untuk konfigurasi agar lebih aman
interface Config {
  port: number;
  db: {
    host?: string;
    port: number;
    name?: string;
    user?: string;
    password?: string;
    dialect?: string;
  };
  minio: {
    endpoint?: string;
    port: number;
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
    useSSL: boolean;
  };
  jwt: {
    secret: Secret; // <-- 2. UBAH TIPE DARI 'string' MENJADI 'Secret'
    expiresIn: string;
    rememberMeExpiresIn: string;
  };
  // Tambahkan config lain jika perlu
}

const config: Config = {
  port: parseInt(process.env.PORT || "5000", 10),
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT,
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT || "9000", 10),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_BUCKET_NAME,
    useSSL: process.env.MINIO_USE_SSL === "true",
  },
  jwt: {
    // 3. Pastikan secret di-cast sebagai Secret
    secret: process.env.JWT_SECRET || "default_jwt_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    // 4. FIX: Nilai 'rememberMe' Anda di file JS lama adalah 90d
    rememberMeExpiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN || "90d",
  },
};

export default config;