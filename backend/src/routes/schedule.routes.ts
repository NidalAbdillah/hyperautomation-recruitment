// src/routes/schedule.routes.ts
import { Router } from "express";
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedule.controller";

const router = Router();

// Rute ini akan menjadi /hr/schedules/

// POST /hr/schedules/
router.post("/", createSchedule);

// GET /hr/schedules/
router.get("/", getAllSchedules);

// GET /hr/schedules/:id
router.get("/:id", getScheduleById);

// PUT /hr/schedules/:id
router.put("/:id", updateSchedule);

// DELETE /hr/schedules/:id
router.delete("/:id", deleteSchedule);

export = router; // Pakai 'export =' agar konsisten dengan index.ts