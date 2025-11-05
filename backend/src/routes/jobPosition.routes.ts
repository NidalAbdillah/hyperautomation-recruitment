// src/routes/jobPosition.routes.ts
import express, { Router } from "express";
import {
  listAllPositions,
  createPosition,
  getPositionById,
  updatePosition,
  deletePosition,
  listOpenPositions // Pastikan ini diekspor dari controller
} from "../controllers/jobPosition.controller";

// Middleware authenticate TIDAK diperlukan di sini
// karena akan dipasang oleh index.ts di /admin

const adminRouter: Router = express.Router();
const publicRouter: Router = express.Router();

// --- Rute Publik ---
// (Endpoint ini akan dipasang di /api/public/job-positions oleh index.ts)
publicRouter.get("/", listOpenPositions);

// --- Rute Admin ---
// (Endpoint ini akan dipasang di /api/admin/job-positions oleh index.ts)
adminRouter.get("/", listAllPositions);
adminRouter.post("/", createPosition);
adminRouter.get("/:id", getPositionById);
adminRouter.put("/:id", updatePosition);
adminRouter.delete("/:id", deletePosition);

// Ekspor kedua router
export {
  publicRouter as publicJobPositionRoutes,
  adminRouter as adminJobPositionRoutes,
};