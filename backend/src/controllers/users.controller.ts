// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import { UserCreationDTO } from "../interfaces/IUserService";

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any) => {
  const status = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  res.status(status).json({ message });
};

/**
 * Mengambil semua user (head_hr, staff_hr, manager).
 */
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[Users Controller] Fetching all users...");
    const users = await userService.getAllStaffAndManagers();
    console.log(
      "[Users Controller] Fetched users data structure sample:",
      users.length > 0 ? users[0] : "No data"
    );
    res.status(200).json(users);
  } catch (error: any) {
    console.error("[Users Controller] Error getting all users:", error);
    handleErrorResponse(res, error);
  }
};

/**
 * Membuat user baru.
 */
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[Users Controller] Creating new user...");
    // PERBAIKAN: Baca req.body sebagai 'any' dulu, jangan langsung cast ke DTO
    const { name, email, password, role } = req.body as any;
    const photoFile = req.file;

    console.log("[Users Controller] Received data for new user:", {
      name, email, role,
      hasPassword: !!password,
      hasPhotoFile: !!photoFile,
    });

    if (!name || !email || !password || !role) {
      const error: any = new Error("Name, email, password, dan role harus diisi.");
      error.status = 400;
      throw error;
    }

    // Buat objek DTO yang bersih
    const userData: UserCreationDTO = {
      name,
      email,
      password,
      role, // Service akan memvalidasi 'head_hr', 'staff_hr', 'manager'
      photoFile,
    };

    console.log(
      "[Users Controller] Calling userService.createUser with data:",
      { ...userData, photoFile: userData.photoFile ? "Present" : "Absent" }
    );

    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error(`[Users Controller] Error creating user:`, error);
    handleErrorResponse(res, error);
  }
};

/**
 * Memperbarui user berdasarkan ID.
 */
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    console.log(`[Users Controller] Updating user with ID ${userId}...`);
    
    // PERBAIKAN: Baca req.body sebagai 'any' dulu
    const { name, email, password, role, removePhoto } = req.body as any;
    const photoFile = req.file;

    if (isNaN(userId)) {
      console.warn("[Users Controller] Invalid user ID received for update.");
      const error: any = new Error("Invalid user ID.");
      error.status = 400;
      throw error;
    }

    console.log(`[Users Controller] Received data for user ID ${userId}:`, {
      name, email, role,
      hasPassword: !!password,
      hasPhotoFile: !!photoFile,
      removePhoto, // Ini akan berupa string "true" atau "false"
    });

    // Buat objek DTO Parsial yang bersih
    const updateData: Partial<UserCreationDTO> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined && password !== "")
      updateData.password = password;
    if (role !== undefined) updateData.role = role;

    updateData.photoFile = photoFile;
    // PERBAIKAN: Konversi string "true" menjadi boolean true
    updateData.removePhoto = (removePhoto === "true" || removePhoto === true);

    console.log(
      `[Users Controller] Calling userService.updateUser(${userId}) with updateData:`,
      { ...updateData, photoFile: updateData.photoFile ? "Present" : "Absent" }
    );

    const updatedUser = await userService.updateUser(userId, updateData);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error(
      `[Users Controller] Error updating user ${req.params.id}:`,
      error
    );
    handleErrorResponse(res, error);
  }
};

/**
 * Menghapus user berdasarkan ID.
 */
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      const error: any = new Error("Invalid user ID.");
      error.status = 400;
      throw error;
    }
    
    console.log(`[Users Controller] Deleting user with ID ${userId}...`);
    console.log(
      `[Users Controller] Calling userService.deleteUser(${userId})...`
    );
    
    const result = await userService.deleteUser(userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(
      `[Users Controller] Controller Error deleting user ${req.params.id}:`,
      error
    );
    handleErrorResponse(res, error);
  }
};

export {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};