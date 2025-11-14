// src/routes/index.ts
import express, { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

// Impor semua router Anda
import { publicRouter as applicationsPublicRouter, adminRouter as applicationsAdminRouter } from "./applications.routes";
import usersRouter from "./users.routes";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import { publicJobPositionRoutes, adminJobPositionRoutes } from "./jobPosition.routes";
import scheduleRoutes from "./schedule.routes";

const router: Router = express.Router();

// --- Rute Publik (Tanpa Autentikasi) ---
router.use("/auth", authRoutes);
router.use("/public/job-positions", publicJobPositionRoutes);
router.use("/applications", applicationsPublicRouter);

// --- Rute Admin (Wajib Autentikasi) ---
const adminRouter: Router = express.Router();
adminRouter.use(authenticate);

// Pasang semua router admin
adminRouter.use("/users", usersRouter);
adminRouter.use("/dashboard", dashboardRoutes);
adminRouter.use("/applications", applicationsAdminRouter);
adminRouter.use("/job-positions", adminJobPositionRoutes);
adminRouter.use("/schedules", scheduleRoutes);

// Pasang adminRouter utama
router.use("/hr", adminRouter);

// --- PERBAIKAN DI SINI ---
// Ubah dari 'export default' ke 'export ='
// Ini adalah cara ekspor CommonJS yang paling "aman" untuk TypeScript
export = router;