// src/controllers/schedule.controller.ts

import { Request, Response } from "express";
import scheduleService from "../services/schedule.service";
import {
  ScheduleCreationDTO,
  ScheduleUpdateDTO,
} from "../interfaces/IScheduleService";

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleError = (res: Response, error: any) => {
  // Cek jika error dilempar oleh service kita (misal: "Schedule not found")
  if (error.message.includes("not found")) {
    return res.status(404).json({ message: error.message });
  }
  
  // Error validasi atau error server lainnya
  console.error("Controller Error:", error.message);
  return res.status(500).json({ message: "Internal server error" });
};

/**
 * Membuat schedule baru (POST /schedules)
 */
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const data = req.body as ScheduleCreationDTO;

    // Validasi dasar
    if (!data.title || !data.startDate || !data.endDate) {
      return res.status(400).json({ message: "title, startDate, dan endDate wajib diisi." });
    }

    const newSchedule = await scheduleService.createSchedule(data);
    res.status(201).json(newSchedule); // 201 Created
  } catch (error: any) {
    handleError(res, error);
  }
};

/**
 * Mendapatkan semua schedule (GET /schedules)
 */
export const getAllSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await scheduleService.getAllSchedules();
    res.status(200).json(schedules);
  } catch (error: any) {
    handleError(res, error);
  }
};

/**
 * Mendapatkan satu schedule by ID (GET /schedules/:id)
 */
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid schedule ID." });
    }

    const schedule = await scheduleService.getScheduleById(id);
    
    // Service akan return null jika tidak ditemukan
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }
    
    res.status(200).json(schedule);
  } catch (error: any) {
    handleError(res, error);
  }
};

/**
 * Meng-update schedule (PUT /schedules/:id)
 */
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid schedule ID." });
    }

    const data = req.body as ScheduleUpdateDTO;

    // Service akan melempar error "Schedule not found" jika ID tidak ada
    const updatedSchedule = await scheduleService.updateSchedule(id, data);
    
    res.status(200).json(updatedSchedule);
  } catch (error: any) {
    // handleError akan menangani error "not found" dari service
    handleError(res, error);
  }
};

/**
 * Menghapus schedule (DELETE /schedules/:id)
 */
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid schedule ID." });
    }

    // Service akan melempar error "Schedule not found" jika ID tidak ada
    await scheduleService.deleteSchedule(id);
    
    // Kirim 200 OK dengan pesan, atau 204 No Content
    res.status(200).json({ message: "Schedule deleted successfully." });
  } catch (error: any) {
    // handleError akan menangani error "not found" dari service
    handleError(res, error);
  }
};