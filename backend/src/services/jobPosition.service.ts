// src/services/jobPosition.service.ts
import { JobPosition, User } from "../models";
import { Op } from "sequelize";
import { IJobPositionService, JobPositionDTO } from "../interfaces/IJobPositionService";
import { UserResponseDTO } from "../interfaces/IUserService"; // Impor DTO User

/**
 * Service class untuk mengelola semua logika bisnis terkait Job Positions.
 * @class JobPositionService
 * @implements {IJobPositionService}
 */
class JobPositionService implements IJobPositionService {
  
  /**
   * Helper internal untuk membuat error standar.
   * @private
   */
  private _createError(message: string, status: number): Error {
    const error: any = new Error(message);
    error.status = status;
    return error;
  }

  /**
   * Mengambil semua lowongan yang "Open" dan dalam periode pendaftaran.
   * @returns {Promise<JobPosition[]>}
   */
  public async getOpenPositions(): Promise<JobPosition[]> {
    console.log("Service: Attempting to fetch open job positions.");
    try {
      const openPositions = await JobPosition.findAll({
        where: {
          status: "Open",
          registrationStartDate: { [Op.lte]: new Date() },
          registrationEndDate: { [Op.gte]: new Date() },
        },
        order: [["createdAt", "DESC"]],
        attributes: [
          "id", "name", "location", "registrationStartDate", "registrationEndDate",
          "availableSlots", "status", "createdAt", "updatedAt", "specificRequirements",
          "announcement", "requestedById", // Pastikan semua kolom ada
        ],
      });
      return openPositions;
    } catch (error: any) {
      console.error("Service: Error fetching open positions from database:", error);
      throw new Error(`Failed to fetch open job positions: ${error.message}`);
    }
  }

  /**
   * Mengambil SEMUA lowongan (termasuk Draft, Approved, dll)
   * @returns {Promise<JobPosition[]>}
   */
  public async listAllPositions(): Promise<JobPosition[]> {
    console.log("Service: Attempting to fetch all job positions for admin.");
    try {
      // PENTING: Di Bab V, ini harus difilter berdasarkan 'role'
      // Tapi untuk sekarang, kita ambil semua
      const allPositions = await JobPosition.findAll({
        order: [["createdAt", "DESC"]],
        attributes: [
          "id", "name", "location", "registrationStartDate", "registrationEndDate",
          "availableSlots", "status", "createdAt", "updatedAt", "specificRequirements",
          "announcement", "requestedById", // Pastikan semua kolom ada
        ],
        include: [
          {
            model: User, // <-- Kita akan ganti ini nanti, sekarang 'include' model User
            as: 'requestor', // Sesuai 'as' di 'index.ts'
            attributes: ['id', 'name', 'department'] // Ambil info requestor
          }
        ]
      });
      return allPositions;
    } catch (error: any) {
      console.error("Service: Error fetching all positions from database:", error);
      throw new Error(`Failed to fetch all job positions: ${error.message}`);
    }
  }

  /**
   * Mengambil detail satu lowongan berdasarkan ID.
   * @param {number} positionId
   * @returns {Promise<JobPosition | null>}
   */
  public async getPositionById(positionId: number): Promise<JobPosition | null> {
    console.log(`Service: Attempting to fetch position with ID: ${positionId}`);
    try {
      const position = await JobPosition.findByPk(positionId);
      if (!position) {
        console.warn(`Service: Position with ID ${positionId} not found.`);
        throw this._createError(`Position with ID ${positionId} not found.`, 404);
      }
      return position;
    } catch (error: any) {
      console.error(`Service: Error fetching position with ID ${positionId}:`, error);
      if (error.status) throw error;
      throw new Error(`Failed to fetch position: ${error.message}`);
    }
  }

  /**
   * Membuat lowongan baru.
   * @param {JobPositionDTO} positionData - Data dari form (Nama, Lokasi, Syarat)
   * @param {UserResponseDTO} requestor - Objek user (Manager) yang membuat request
   * @returns {Promise<JobPosition>}
   */
  // --- PERBAIKAN DI SINI ---
  // Sekarang menerima 2 argumen, sesuai "Kontrak" (Interface) dan "Pemanggil" (Controller)
  public async createPosition(
    positionData: JobPositionDTO,
    requestor: UserResponseDTO
  ): Promise<JobPosition> {
  // --- BATAS PERBAIKAN ---

    console.log("Service: Attempting to create new job position.");
    try {
      
      // Ini adalah "Defense" (Pertahanan) TA Anda:
      // Kita gabungkan data dari Form (positionData) dengan
      // data otomatis dari 'requestor' (user yang login)
      const dataToCreate = {
        ...positionData,
        status: "Draft", // Status default saat Manager request
        requestedById: requestor.id, // Menyimpan SIAPA yang me-request
        // 'announcement' (pemanis) dan tanggal sengaja dibiarkan null
      };

      const newPosition = await JobPosition.create(dataToCreate as any);
      console.log(`Service: New position created with ID: ${newPosition.id} by User ID: ${requestor.id}`);
      return newPosition;
      
    } catch (error: any) {
      console.error("Service: Error creating new position:", error);
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err: any) => err.message);
        const validationError: any = new Error(`Validation failed: ${validationErrors.join(", ")}`);
        validationError.status = 400;
        validationError.errors = validationErrors;
        throw validationError;
      }
      if (error.name === "SequelizeUniqueConstraintError") {
        const uniqueError: any = new Error(`Position with this name already exists.`);
        uniqueError.status = 409;
        throw uniqueError;
      }
      throw new Error(`Failed to create job position: ${error.message}`);
    }
  }

  /**
   * Memperbarui lowongan yang ada berdasarkan ID.
   * @param {number} positionId - ID lowongan
   * @param {Partial<JobPositionDTO>} updateData - Data yang akan diperbarui
   * @returns {Promise<JobPosition>}
   */
  public async updatePosition(
    positionId: number,
    updateData: Partial<JobPositionDTO>
  ): Promise<JobPosition> {
    console.log(`Service: Attempting to update position with ID: ${positionId}`);
    try {
      const position = await JobPosition.findByPk(positionId);

      if (!position) {
        console.warn(`Service: Position with ID ${positionId} not found for update.`);
        throw this._createError(`Position with ID ${positionId} not found.`, 404);
      }

      // Ini adalah "Defense" (Pertahanan) TA Anda untuk "Pemanis" (Sweetener):
      // Saat Staff HR menekan "Publish", dia akan memanggil 'updatePosition'
      // dengan 'updateData' berisi:
      // { announcement: "...", registrationStartDate: "...", status: "Open" }
      
      await position.update(updateData);
      console.log(`Service: Position with ID ${positionId} updated successfully.`);

      await position.reload();
      return position;
    } catch (error: any) {
      console.error(`Service: Error updating position with ID ${positionId}:`, error);
      if (error.name === "SequelizeValidationError") {
         const validationErrors = error.errors.map((err: any) => err.message);
         const validationError: any = new Error(`Validation failed: ${validationErrors.join(", ")}`);
         validationError.status = 400;
         validationError.errors = validationErrors;
         throw validationError;
      }
      if (error.name === "SequelizeUniqueConstraintError") {
         const uniqueError: any = new Error(`Position with this name already exists.`);
         uniqueError.status = 409;
         throw uniqueError;
      }
      if (error.status) {
        throw error;
      }
      throw new Error(`Failed to update position: ${error.message}`);
    }
  }

  /**
   * Menghapus lowongan berdasarkan ID.
   * @param {number} positionId - ID lowongan.
   * @returns {Promise<{ success: true; message: string }>}
   */
  public async deletePosition(positionId: number): Promise<{ success: true; message: string }> {
    console.log(`Service: Attempting to delete position with ID: ${positionId}`);
    try {
      const deletedRowCount = await JobPosition.destroy({
        where: { id: positionId },
      });

      if (deletedRowCount === 0) {
        console.warn(`Service: Position with ID ${positionId} not found for deletion.`);
        throw this._createError(`Position with ID ${positionId} not found.`, 404);
      }

      console.log(`Service: Position with ID ${positionId} deleted successfully.`);
      return { success: true, message: "Position deleted successfully." };
    } catch (error: any) {
      console.error(`Service: Error deleting position with ID ${positionId}:`, error);
      if (error.status) {
        throw error;
      }
      throw new Error(`Failed to delete position: ${error.message}`);
    }
  }

  /**
   * Menghitung jumlah lowongan yang "Open".
   * @returns {Promise<number>}
   */
  public async countOpenPositions(): Promise<number> {
    console.log("Service: Attempting to count open job positions.");
    try {
      const count = await JobPosition.count({
        where: {
          status: "Open",
          registrationStartDate: { [Op.lte]: new Date() },
          registrationEndDate: { [Op.gte]: new Date() },
        },
      });
      console.log(`Service: Counted ${count} open positions.`);
      return count;
    } catch (error: any) {
      console.error("Service: Error counting open positions:", error);
      throw new Error(`Failed to count open job positions: ${error.message}`);
    }
  }
} // <-- Penutup Class

// Ekspor satu instance (singleton) dari class
export default new JobPositionService();