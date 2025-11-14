// src/interfaces/IScheduleService.ts

import { Schedule } from "../models"; // Impor model Schedule

/**
 * DTO (Data Transfer Object) untuk MEMBUAT schedule baru.
 */
export interface ScheduleCreationDTO {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string | null;
}

/**
 * DTO untuk MENG-UPDATE schedule yang sudah ada.
 * Semua field dibuat opsional.
 */
export interface ScheduleUpdateDTO {
  title?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string | null;
}

/**
 * Interface (Kontrak) untuk ScheduleService.
 * Mendefinisikan semua fungsi yang HARUS ada di service-nya.
 */
export interface IScheduleService {
  /**
   * Membuat schedule baru di database.
   * @param data DTO untuk membuat schedule
   * @returns Schedule yang baru dibuat
   */
  createSchedule(data: ScheduleCreationDTO): Promise<Schedule>;

  /**
   * Mengambil semua schedule dari database.
   * @returns Array berisi semua data Schedule
   */
  getAllSchedules(): Promise<Schedule[]>;

  /**
   * Mengambil satu schedule berdasarkan ID.
   * @param scheduleId ID dari schedule
   * @returns Satu objek Schedule, atau null jika tidak ditemukan
   */
  getScheduleById(scheduleId: number): Promise<Schedule | null>;

  /**
   * Meng-update schedule berdasarkan ID.
   * @param scheduleId ID dari schedule yang akan di-update
   * @param data DTO berisi data baru
   * @returns Schedule yang sudah ter-update
   */
  updateSchedule(
    scheduleId: number,
    data: ScheduleUpdateDTO
  ): Promise<Schedule | null>;

  /**
   * Menghapus schedule berdasarkan ID.
   * @param scheduleId ID dari schedule
   * @returns Boolean true jika berhasil
   */
  deleteSchedule(scheduleId: number): Promise<boolean>;
}