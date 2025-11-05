// src/app.ts
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRoutes = require("./routes"); 
import { initializeDatabase } from "./models";
import minioService from "./services/minio.service";

const app: Express = express();

// --- Middleware Global ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Integrasi Router API ---
// 'apiRoutes' sekarang 100% adalah router yang valid
app.use("/api", apiRoutes);

// --- Rute Dasar ---
app.get("/", (req: Request, res: Response) => {
  res.send("ISR Recruitment Backend API is running!");
});

app.get("/health", (req: Request, res: Response) => {
  res.send({ status: 200, timestamp: new Date().toISOString() });
});

// --- Middleware Penanganan Error & Not Found ---
app.use((req: Request, res: Response, next: NextFunction) => {
  res
    .status(404)
    .send({ message: `API Endpoint Not Found: ${req.method} ${req.originalUrl}` });
});

// --- Fungsi Inisialisasi Aplikasi ---
const initializeApp = async () => {
  try {
    await initializeDatabase();
    console.log("Database models synchronized and connection ready.");

    await minioService.ensureBucketExists();
    console.log("MinIO bucket checked and ready.");

  } catch (error: any) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

// --- Export Aplikasi & Fungsi Inisialisasi ---
export { app, initializeApp };