// src/services/jobPosition.service.ts
import { JobPosition, User } from "../models";
import { Op } from "sequelize";
import {
  IJobPositionService,
  JobPositionDTO,
} from "../interfaces/IJobPositionService";
import { UserResponseDTO } from "../interfaces/IUserService";

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
   * Mengambil semua lowongan yang "Open", tidak diarsip, dan dalam periode pendaftaran.
   * @returns {Promise<JobPosition[]>}
   */
  public async getOpenPositions(): Promise<JobPosition[]> {
    console.log("Service: Attempting to fetch open job positions.");
    try {
      const openPositions = await JobPosition.findAll({
        where: {
          status: "OPEN",
          registrationStartDate: { [Op.lte]: new Date() },
          registrationEndDate: { [Op.gte]: new Date() },
          isArchived: false,
        },
        order: [["createdAt", "DESC"]],
        attributes: [
          "id", "name", "location", "registrationStartDate", "registrationEndDate",
          "availableSlots", "status", "createdAt", "updatedAt", "specificRequirements",
          "announcement", "requestedById", "isArchived",
        ],
      });
      return openPositions;
    } catch (error: any) {
      console.error("Service: Error fetching open positions from database:", error);
      throw new Error(`Failed to fetch open job positions: ${error.message}`);
    }
  }

  /**
   * Mengambil SEMUA lowongan yang AKTIF (tidak diarsip) untuk admin.
   * @returns {Promise<JobPosition[]>}
   */
  public async listAllPositions(): Promise<JobPosition[]> {
    console.log("Service: Attempting to fetch all ACTIVE job positions for admin.");
    try {
      const allPositions = await JobPosition.findAll({
        where: {
          isArchived: false,
        },
        order: [["createdAt", "DESC"]],
        attributes: [
          "id", "name", "location", "registrationStartDate", "registrationEndDate",
          "availableSlots", "status", "createdAt", "updatedAt", "specificRequirements",
          "announcement", "requestedById", "isArchived",
        ],
        include: [
          {
            model: User,
            as: "requestor", 
            attributes: ["id", "name", "department"],
          },
        ],
      });
      return allPositions;
    } catch (error: any) {
      console.error("Service: Error fetching all positions from database:", error);
      throw new Error(`Failed to fetch all job positions: ${error.message}`);
    }
  }

  /**
   * Mengambil SEMUA lowongan yang DIARSIP (dengan SEMUA data).
   * @returns {Promise<JobPosition[]>}
   */
  public async listArchivedPositions(): Promise<JobPosition[]> {
    console.log("Service: Attempting to fetch all ARCHIVED job positions.");
    try {
      const archivedPositions = await JobPosition.findAll({
        where: {
          isArchived: true,
        },
        order: [["updatedAt", "DESC"]],
        
        // --- INI PERBAIKANNYA (DATA LENGKAP) ---
        attributes: [
          "id", "name", "location", "status", "createdAt", "updatedAt", "requestedById", "isArchived",
          "registrationStartDate", // <-- DIPERLUKAN
          "registrationEndDate", // <-- DIPERLUKAN
          "availableSlots",      // <-- DIPERLUKAN
          "announcement",        // <-- DIPERLUKAN
          "specificRequirements" // <-- DIPERLUKAN
        ],
        // --- BATAS PERBAIKAN ---

        include: [
          {
            model: User,
            as: "requestor",
            attributes: ["id", "name", "department"],
          },
        ],
      });
      return archivedPositions;
    } catch (error: any) {
      console.error("Service: Error fetching archived positions:", error);
      throw new Error(`Failed to fetch archived positions: ${error.message}`);
    }
  }

  /**
   * Mengambil detail satu lowongan berdasarkan ID (aktif atau arsip).
   * @param {number} positionId
   * @returns {Promise<JobPosition | null>}
   */
  public async getPositionById(positionId: number): Promise<JobPosition | null> {
    console.log(`Service: Attempting to fetch position with ID: ${positionId}`);
    try {
      const position = await JobPosition.findByPk(positionId, {
         // --- PERBAIKAN DI SINI JUGA ---
         // Pastikan getById juga mengambil semua data
         attributes: [
          "id", "name", "location", "registrationStartDate", "registrationEndDate",
          "availableSlots", "status", "createdAt", "updatedAt", "specificRequirements",
          "announcement", "requestedById", "isArchived",
        ],
      });
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
   * @param {JobPositionDTO} positionData
   * @param {UserResponseDTO} requestor
   * @returns {Promise<JobPosition>}
   */
  public async createPosition(
    positionData: JobPositionDTO,
    requestor: UserResponseDTO
  ): Promise<JobPosition> {
    console.log("Service: Attempting to create new job position.");
    try {
      const dataToCreate = {
        ...positionData,
        status: "DRAFT",
        requestedById: requestor.id,
        isArchived: false,
      };

      const newPosition = await JobPosition.create(dataToCreate as any);
      console.log(`Service: New position created with ID: ${newPosition.id} by User ID: ${requestor.id}`);
      return newPosition;
    } catch (error: any) {
      // (Error handling tetap sama)
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
   * @param {number} positionId
   * @param {Partial<JobPositionDTO>} updateData
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
      
      if ((updateData as any).isArchived) {
        delete (updateData as any).isArchived;
      }

      await position.update(updateData);
      console.log(`Service: Position with ID ${positionId} updated successfully.`);

      await position.reload();
      return position;
    } catch (error: any) {
      // (Error handling tetap sama)
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
   * Menghapus lowongan (hard delete) berdasarkan ID.
   * @param {number} positionId
   * @returns {Promise<{ success: true; message: string }>}
   */
  public async deletePosition(positionId: number): Promise<{ success: true; message: string }> {
    console.log(`Service: Attempting to HARD DELETE position with ID: ${positionId}`);
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
   * Menghitung jumlah lowongan yang "Open" dan tidak diarsip.
   * @returns {Promise<number>}
   */
  public async countOpenPositions(): Promise<number> {
    console.log("Service: Attempting to count open job positions.");
    try {
      const count = await JobPosition.count({
        where: {
          status: "OPEN",
          registrationStartDate: { [Op.lte]: new Date() },
          registrationEndDate: { [Op.gte]: new Date() },
          isArchived: false,
        },
      });
      console.log(`Service: Counted ${count} open positions.`);
      return count;
    } catch (error: any) {
      console.error("Service: Error counting open positions:", error);
      throw new Error(`Failed to count open job positions: ${error.message}`);
    }
  }

  /**
   * Mengarsipkan lowongan (soft delete). Hanya yang status 'Closed'.
   * @param {number[]} positionIds
   * @returns {Promise<{ count: number; message: string }>}
   */
  public async archivePositions(
    positionIds: number[]
  ): Promise<{ count: number; message: string }> {
    console.log(
      `Service: Attempting to archive positions: ${positionIds.join(", ")}`
    );
    if (!Array.isArray(positionIds) || positionIds.length === 0) {
      return { count: 0, message: "No position IDs provided." };
    }

    try {
      const [updateCount] = await JobPosition.update(
        { isArchived: true },
        {
          where: {
            id: { [Op.in]: positionIds },
            status: "CLOSED", 
            isArchived: false,
          },
        }
      );

      console.log(`Service: Successfully archived ${updateCount} positions.`);
      return {
        count: updateCount,
        message: `${updateCount} positions were successfully archived.`,
      };
    } catch (error: any) {
      console.error("Service: Error archiving positions:", error);
      throw this._createError(
        `Failed to archive positions: ${error.message}`,
        500
      );
    }
  }

  /**
   * Mengembalikan lowongan dari arsip.
   * @param {number[]} positionIds
   * @returns {Promise<{ count: number; message: string }>}
   */
  public async unarchivePositions(
    positionIds: number[]
  ): Promise<{ count: number; message: string }> {
    console.log(
      `Service: Attempting to UN-archive positions: ${positionIds.join(", ")}`
    );
    if (!Array.isArray(positionIds) || positionIds.length === 0) {
      return { count: 0, message: "No position IDs provided." };
    }

    try {
      const [updateCount] = await JobPosition.update(
        { isArchived: false },
        {
          where: {
            id: { [Op.in]: positionIds },
            isArchived: true, 
          },
        }
      );

      console.log(`Service: Successfully un-archived ${updateCount} positions.`);
      return {
        count: updateCount,
        message: `${updateCount} positions were successfully un-archived.`,
      };
    } catch (error: any) {
      console.error("Service: Error un-archiving positions:", error);
      throw this._createError(
        `Failed to un-archive positions: ${error.message}`,
        500
      );
    }
  }
}

export default new JobPositionService();