// src/services/schedule.service.ts

import { Schedule } from "../models"; // Impor model Schedule
import {
  IScheduleService,
  ScheduleCreationDTO,
  ScheduleUpdateDTO,
} from "../interfaces/IScheduleService"; // Impor kontrak & DTO

/**
 * Kelas ini mengimplementasikan semua logika bisnis untuk fitur Schedule.
 */
class ScheduleService implements IScheduleService {
  /**
   * Membuat schedule baru di database.
   */
  public async createSchedule(data: ScheduleCreationDTO): Promise<Schedule> {
    try {
      // Langsung buat data baru di tabel Schedule
      const newSchedule = await Schedule.create(data);
      return newSchedule;
    } catch (error: any) {
      // Tangani error jika ada (misal: validasi gagal)
      console.error("Error in ScheduleService.createSchedule:", error);
      throw new Error(`Failed to create schedule: ${error.message}`);
    }
  }

  /**
   * Mengambil semua schedule dari database.
   */
  public async getAllSchedules(): Promise<Schedule[]> {
    try {
      // Cari semua data, urutkan dari yang terbaru (opsional)
      const schedules = await Schedule.findAll({
        order: [["startDate", "ASC"]], // Urutkan berdasarkan tanggal mulai
      });
      return schedules;
    } catch (error: any) {
      console.error("Error in ScheduleService.getAllSchedules:", error);
      throw new Error(`Failed to get schedules: ${error.message}`);
    }
  }

  /**
   * Mengambil satu schedule berdasarkan ID.
   */
  public async getScheduleById(scheduleId: number): Promise<Schedule | null> {
    try {
      const schedule = await Schedule.findByPk(scheduleId);
      return schedule; // Akan return null jika tidak ditemukan
    } catch (error: any) {
      console.error("Error in ScheduleService.getScheduleById:", error);
      throw new Error(`Failed to get schedule: ${error.message}`);
    }
  }

  /**
   * Meng-update schedule berdasarkan ID.
   */
  public async updateSchedule(
    scheduleId: number,
    data: ScheduleUpdateDTO
  ): Promise<Schedule | null> {
    try {
      // 1. Cari dulu schedule-nya
      const schedule = await Schedule.findByPk(scheduleId);

      // 2. Jika tidak ditemukan, lempar error
      if (!schedule) {
        // Kita bisa return null atau lempar error, kita lempar error
        // agar controller bisa menangkapnya sebagai 404
        throw new Error("Schedule not found");
      }

      // 3. Jika ditemukan, update datanya
      const updatedSchedule = await schedule.update(data);
      return updatedSchedule;
    } catch (error: any)
    {
      console.error("Error in ScheduleService.updateSchedule:", error);
      // Cek apakah error karena tidak ditemukan, atau error lain
      if (error.message === "Schedule not found") {
        throw error; // Lempar lagi error "not found"
      }
      throw new Error(`Failed to update schedule: ${error.message}`);
    }
  }

  /**
   * Menghapus schedule berdasarkan ID.
   */
  public async deleteSchedule(scheduleId: number): Promise<boolean> {
    try {
      // 1. Cari dulu schedule-nya
      const schedule = await Schedule.findByPk(scheduleId);

      // 2. Jika tidak ditemukan, lempar error
      if (!schedule) {
        throw new Error("Schedule not found");
      }

      // 3. Jika ditemukan, hapus
      await schedule.destroy();
      return true; // Berhasil
    } catch (error: any) {
      console.error("Error in ScheduleService.deleteSchedule:", error);
      if (error.message === "Schedule not found") {
        throw error; // Lempar lagi error "not found"
      }
      throw new Error(`Failed to delete schedule: ${error.message}`);
    }
  }
}

// Ekspor SATU INSTANCE dari service ini (Singleton pattern)
// Mirip seperti 'application.service.ts' kamu
const scheduleService = new ScheduleService();
export default scheduleService;