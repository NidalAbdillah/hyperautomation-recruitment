// src/interfaces/IUserService.ts
import { User } from "../models";

/**
 * Tipe Data Transfer Object (DTO) untuk membuat/update user.
 * Ini adalah "kontrak" input.
 */
export interface UserCreationDTO {
  name: string; // Sudah 'name'
  email: string;
  password?: string;
  role: 'head_hr' | 'staff_hr' | 'manager';
  department?: string | null; // <-- Kolom 'department' yang baru
  photoFile?: Express.Multer.File;
  removePhoto?: boolean;
}

/**
 * Tipe DTO baru untuk RESPONS API (Aman dikirim ke frontend).
 * Ini adalah "kontrak" output (yang dicari controller Anda).
 */
export interface UserResponseDTO {
  id: number;
  name: string; // <-- Sudah 'name'
  email: string;
  role: 'head_hr' | 'staff_hr' | 'manager';
  department: string | null; // <-- Kolom 'department' yang baru
  photoUrl: string | null;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

/**
 * Interface (Kontrak) untuk UserService.
 * Mendefinisikan semua method publik yang harus diimplementasikan oleh class UserService.
 */
export interface IUserService {
  hashPassword(password: string): Promise<string>;

  comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;

  // Method ini mengembalikan DTO yang baru
  createUser(userData: UserCreationDTO): Promise<UserResponseDTO>;
  
  findUserByEmail(email: string): Promise<User | null>;

  getAllStaffAndManagers(): Promise<UserResponseDTO[]>;

  getUserById(userId: number): Promise<UserResponseDTO>;

  updateUser(userId: number, updateData: Partial<UserCreationDTO>): Promise<UserResponseDTO>;

  deleteUser(userId: number): Promise<{ message: string }>;
}