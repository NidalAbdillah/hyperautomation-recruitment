// src/interfaces/IJobPositionService.ts
import { JobPosition } from "../models"; // Impor tipe Model
// Impor "kontrak" DTO yang kita butuhkan dari file lain
import { UserResponseDTO } from "./IUserService";

/**
 * Tipe Data Transfer Object (DTO) untuk membuat atau memperbarui Job Position.
 * Mendefinisikan data yang diharapkan dari controller.
 */
export interface JobPositionDTO {
  name: string;
  location: string;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  specificRequirements?: string | null;
  availableSlots: number;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'APPROVED' | 'REJECTED';
  announcement?: string | null;
}

/**
 * Interface (Kontrak) untuk JobPositionService.
 * Mendefinisikan semua method publik yang harus diimplementasikan oleh class.
 * Ini adalah blueprint yang akan Anda gunakan untuk membuat Diagram Kelas di Bab IV.
 */
export interface IJobPositionService {
  /**
   * Mengambil semua lowongan yang "Open" dan dalam periode pendaftaran.
   */
  getOpenPositions(): Promise<JobPosition[]>;

  /**
   * Mengambil SEMUA lowongan (Draft, Open, Closed) untuk admin.
   */
  listAllPositions(): Promise<JobPosition[]>;

  /**
   * Mengambil detail satu lowongan berdasarkan ID.
   */
  getPositionById(positionId: number): Promise<JobPosition | null>;

  /**
   * Membuat lowongan baru.
   * (Sekarang sudah benar karena UserResponseDTO sudah di-impor)
   */
  createPosition(positionData: JobPositionDTO, requestor: UserResponseDTO): Promise<JobPosition>;

  /**
   * Memperbarui lowongan yang ada berdasarkan ID.
   */
  updatePosition(positionId: number, updateData: Partial<JobPositionDTO>): Promise<JobPosition>;

  /**
   * Menghapus lowongan berdasarkan ID.
   */
  deletePosition(positionId: number): Promise<{ success: true; message: string }>;

  /**
   * Menghitung jumlah lowongan yang "Open" (untuk Dashboard).
   */
  countOpenPositions(): Promise<number>;
}