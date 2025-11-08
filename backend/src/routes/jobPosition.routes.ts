// src/routes/jobPosition.routes.ts
import express, { Router } from "express";
import {
  listAllPositions,
  createPosition,
  getPositionById,
  updatePosition,
  deletePosition,
  listOpenPositions,
  listArchivedPositions,
  archivePositions,
  unarchivePositions,
} from "../controllers/jobPosition.controller";

const adminRouter: Router = express.Router();
const publicRouter: Router = express.Router();

// --- Rute Publik ---
// (Endpoint ini akan dipasang di /api/public/job-positions oleh index.ts)
publicRouter.get("/", listOpenPositions);

// --- Rute Admin ---
// (Endpoint ini akan dipasang di /api/hr/job-positions oleh index.ts)

// --- 1. RUTE SPESIFIK HARUS DI ATAS ---
// Rute-rute ini harus didefinisikan SEBELUM '/:id'
adminRouter.get("/list/archived", listArchivedPositions); // (GET /api/hr/job-positions/list/archived)
adminRouter.put("/archive", archivePositions); // (PUT /api/hr/job-positions/archive)
adminRouter.put("/unarchive", unarchivePositions); // (PUT /api/hr/job-positions/unarchive)
// --- BATAS PERUBAHAN ---

adminRouter.get("/", listAllPositions); // (GET /api/hr/job-positions)
adminRouter.post("/", createPosition); // (POST /api/hr/job-positions)

// --- 2. RUTE DINAMIS (/:id) HARUS DI BAWAH ---
adminRouter.get("/:id", getPositionById); // (GET /api/hr/job-positions/:id)
adminRouter.put("/:id", updatePosition); // (PUT /api/hr/job-positions/:id)
adminRouter.delete("/:id", deletePosition); // (DELETE /api/hr/job-positions/:id)

// Ekspor kedua router
export {
  publicRouter as publicJobPositionRoutes,
  adminRouter as adminJobPositionRoutes,
};