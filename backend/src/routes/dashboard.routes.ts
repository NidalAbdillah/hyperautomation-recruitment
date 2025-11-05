// src/routes/dashboard.routes.ts
import express, { Router } from "express";
// Impor controller TS
import {
  getDashboardSummaryStats,
  getDashboardChartData,
  getRecentApplications,
} from "../controllers/dashboard.controller";

const router: Router = express.Router();

router.get("/summary", getDashboardSummaryStats);
router.get("/charts", getDashboardChartData);
router.get("/recent-applications", getRecentApplications);

export default router;