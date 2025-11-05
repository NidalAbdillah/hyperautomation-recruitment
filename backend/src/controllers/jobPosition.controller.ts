// src/controllers/jobPosition.controller.ts
import { Request, Response, NextFunction } from "express"; // <-- 1. Impor Tipe Express
import jobPositionService from "../services/jobPosition.service"; // <-- 2. Ubah ke import OOP
import { JobPositionDTO } from "../interfaces/IJobPositionService"; // <-- 3. Impor DTO (Kontrak)
import { UserResponseDTO } from "../interfaces/IUserService"; // <-- 4. Impor DTO User

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any) => {
  const statusCode = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  console.error(`Controller Error: Status ${statusCode}, Message: ${message}`, error.stack); 
  res.status(statusCode).json({ message });
};

/**
 * Mengambil lowongan yang 'Open' untuk publik.
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
 * Mengambil SEMUA lowongan untuk admin (tergantung role).
 */
const listAllPositions = async (req: Request, res: Response) => {
  console.log("Controller: Received request to list all job positions for admin.");
  try {
    // TODO (untuk nanti): Di Bab V, service ini harus difilter
    // berdasarkan req.user.role (misal 'manager' hanya lihat miliknya).
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
    const positionId = parseInt(req.params.id, 10); // <-- 5. Parse ID
    
    if (isNaN(positionId)) {
      const error: any = new Error("Invalid position ID.");
      error.status = 400;
      throw error;
    }

    console.log(`Controller: Received request to get position with ID: ${positionId}`);
    const position = await jobPositionService.getPositionById(positionId);
    res.status(200).json(position);
  } catch (error: any) {
    console.error(`Controller: Error getting position with ID ${req.params.id}:`, error);
    handleErrorResponse(res, error);
  }
};

/**
 * Membuat lowongan baru.
 */
const createPosition = async (req: Request, res: Response) => {
  // 6. Beri tipe data pada req.body sesuai DTO
  const positionData = req.body as JobPositionDTO; 
  // 7. Ambil 'user' dari 'req' (hasil dari middleware 'authenticate')
  const user = req.user as UserResponseDTO; 
  
  console.log("CONTROLLER: Menerima data untuk CREATE:", JSON.stringify(positionData, null, 2));

  try {
    // 8. PERBAIKAN: Kirim 'positionData' DAN 'user' (objek utuh)
    // Sesuai 'Defense' (Pertahanan) TA kita, service-lah yang
    // akan mengambil 'user.id' dan 'user.department' dari sini.
    const newPosition = await jobPositionService.createPosition(
      positionData,
      user // <-- DIUBAH (Bukan user.id)
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
    // 9. Beri tipe data Partial (karena update mungkin tidak semua field)
    const updateData = req.body as Partial<JobPositionDTO>;
    
    if (isNaN(positionId)) {
      const error: any = new Error("Invalid position ID.");
      error.status = 400;
      throw error;
    }
    
    console.log(`CONTROLLER: Menerima data untuk UPDATE ID ${positionId}:`, JSON.stringify(updateData, null, 2));

    const updatedPosition = await jobPositionService.updatePosition(
      positionId,
      updateData
    );
    res.status(200).json(updatedPosition);
  } catch (error: any) {
    console.error(`Controller: Error updating position with ID ${req.params.id}:`, error);
    handleErrorResponse(res, error);
  }
};

/**
 * Menghapus lowongan berdasarkan ID.
 */
const deletePosition = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id, 10);
    console.log(`Controller: Received request to delete position with ID: ${positionId}`);

    if (isNaN(positionId)) {
      const error: any = new Error("Position ID is required for deletion.");
      error.status = 400;
      throw error;
    }

    const result = await jobPositionService.deletePosition(positionId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(`Controller: Error deleting position with ID ${req.params.id}:`, error);
    handleErrorResponse(res, error);
  }
};

// 10. Ubah ke ES Module export
export {
  listOpenPositions,
  listAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
};