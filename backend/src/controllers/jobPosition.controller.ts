// src/controllers/jobPosition.controller.ts
import { Request, Response, NextFunction } from "express";
import jobPositionService from "../services/jobPosition.service";
import { JobPositionDTO } from "../interfaces/IJobPositionService";
import { UserResponseDTO } from "../interfaces/IUserService";

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any) => {
  const statusCode = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  console.error(
    `Controller Error: Status ${statusCode}, Message: ${message}`,
    error.stack
  );
  res.status(statusCode).json({ message });
};

/**
 * Mengambil lowongan yang 'Open' untuk publik (Tidak diarsip).
 */
const listOpenPositions = async (req: Request, res: Response) => {
  console.log("Controller: Received request to list open job positions.");
  try {
    const openPositions = await jobPositionService.getOpenPositions();
    res.status(200).json(openPositions);
  } catch (error: any) {
    console.error("Controller: Error listing open positions:", error);
    handleErrorResponse(res, error);
  }
};

/**
 * Mengambil SEMUA lowongan yang AKTIF (Tidak diarsip) untuk admin.
 */
const listAllPositions = async (req: Request, res: Response) => {
  console.log("Controller: Received request to list all ACTIVE job positions.");
  try {
    // Service sudah di-update untuk filter isArchived: false
    const allPositions = await jobPositionService.listAllPositions();
    res.status(200).json(allPositions);
  } catch (error: any) {
    console.error("Controller: Error listing all positions:", error);
    handleErrorResponse(res, error);
  }
};

/**
 * Mengambil satu lowongan berdasarkan ID.
 */
const getPositionById = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id, 10);
    if (isNaN(positionId)) {
      const error: any = new Error("Invalid position ID.");
      error.status = 400;
      throw error;
    }
    const position = await jobPositionService.getPositionById(positionId);
    res.status(200).json(position);
  } catch (error: any) {
    console.error(
      `Controller: Error getting position with ID ${req.params.id}:`,
      error
    );
    handleErrorResponse(res, error);
  }
};

/**
 * Membuat lowongan baru.
 */
const createPosition = async (req: Request, res: Response) => {
  const positionData = req.body as JobPositionDTO;
  const user = req.user as UserResponseDTO;

  console.log(
    "CONTROLLER: Menerima data untuk CREATE:",
    JSON.stringify(positionData, null, 2)
  );

  try {
    // Service sudah di-update untuk set isArchived: false
    const newPosition = await jobPositionService.createPosition(
      positionData,
      user
    );
    res.status(201).json(newPosition);
  } catch (error: any) {
    console.error("Controller: Error creating position:", error);
    handleErrorResponse(res, error);
  }
};

/**
 * Memperbarui lowongan berdasarkan ID.
 */
const updatePosition = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id, 10);
    const updateData = req.body as Partial<JobPositionDTO>;

    if (isNaN(positionId)) {
      const error: any = new Error("Invalid position ID.");
      error.status = 400;
      throw error;
    }
    
    // Service sudah di-update untuk mencegah update 'isArchived' via endpoint ini
    const updatedPosition = await jobPositionService.updatePosition(
      positionId,
      updateData
    );
    res.status(200).json(updatedPosition);
  } catch (error: any) {
    console.error(
      `Controller: Error updating position with ID ${req.params.id}:`,
      error
    );
    handleErrorResponse(res, error);
  }
};

/**
 * Menghapus lowongan (Hard Delete) berdasarkan ID.
 */
const deletePosition = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id, 10);
    if (isNaN(positionId)) {
      const error: any = new Error("Position ID is required for deletion.");
      error.status = 400;
      throw error;
    }
    const result = await jobPositionService.deletePosition(positionId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(
      `Controller: Error deleting position with ID ${req.params.id}:`,
      error
    );
    handleErrorResponse(res, error);
  }
};

// --- HANDLER BARU UNTUK ARSIP ---

/**
 * Mengambil SEMUA lowongan yang DIARSIP.
 */
const listArchivedPositions = async (req: Request, res: Response) => {
  console.log(
    "Controller: Received request to list all ARCHIVED job positions."
  );
  try {
    const archivedPositions = await jobPositionService.listArchivedPositions();
    res.status(200).json(archivedPositions);
  } catch (error: any) {
    console.error("Controller: Error listing archived positions:", error);
    handleErrorResponse(res, error);
  }
};

/**
 * Mengarsipkan lowongan (Bulk).
 */
const archivePositions = async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: number[] };
  console.log(`Controller: Received request to ARCHIVE positions: ${ids}`);
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error: any = new Error("Array of 'ids' is required in the body.");
      error.status = 400;
      throw error;
    }
    const result = await jobPositionService.archivePositions(ids);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Controller: Error archiving positions:", error);
    handleErrorResponse(res, error);
  }
};

/**
 * Mengembalikan lowongan dari arsip (Bulk).
 */
const unarchivePositions = async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: number[] };
  console.log(`Controller: Received request to UN-ARCHIVE positions: ${ids}`);
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error: any = new Error("Array of 'ids' is required in the body.");
      error.status = 400;
      throw error;
    }
    const result = await jobPositionService.unarchivePositions(ids);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Controller: Error un-archiving positions:", error);
    handleErrorResponse(res, error);
  }
};

export {
  listOpenPositions,
  listAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  // --- EKSPOR FUNGSI BARU ---
  listArchivedPositions,
  archivePositions,
  unarchivePositions,
};