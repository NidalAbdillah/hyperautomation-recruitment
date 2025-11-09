// src/services/application.service.ts
import { CvApplication, JobPosition } from "../models";
import minioService from "./minio.service";
import { sequelize } from "../config/database";
import { Op, Transaction } from "sequelize";
import moment from "moment";
import jobPositionService from "./jobPosition.service";
import axios from "axios";
import JSZip from "jszip";
import emailService from "./email.service";
import {
  IApplicationService,
  ApplicationCreationDTO,
  N8nResultDTO,
  RankFiltersDTO,
  DownloadFileStream,
  // --- 1. SEKARANG IMPORT INI AKAN BERHASIL ---
  ApplicationStatusUpdateDTO, 
} from "../interfaces/IApplicationService";
import { Stream } from "stream";

// Helper: Error Handling
const createError = (message: string, status: number): Error => {
  const error: any = new Error(message);
  error.status = status;
  return error;
};

/**
 * Service class untuk mengelola semua logika bisnis terkait CV Applications.
 * @class ApplicationService
 * @implements {IApplicationService}
 */
class ApplicationService implements IApplicationService {
  public standardAttributes: string[];
  public validStatuses: string[];

  constructor() {
    // --- 2. PERBARUI STANDARD ATTRIBUTES ---
    this.standardAttributes = [
      "id", "fullName", "email", "qualification", "cvFileName", "cvFileObjectKey",
      "status", "createdAt", "updatedAt", "isArchived", "appliedPositionId",
      "similarity_score", "passed_hard_gate", "qualitative_assessment", 
      "cv_data", "requirement_data", 
      "interview_notes", // <-- TAMBAHKAN INI
    ];
    
    // --- 3. PERBARUI VALID STATUSES ---
    this.validStatuses = [
      "Submitted", "Reviewed", "Accepted", "Rejected",
      "Interview_Queued", // <-- TAMBAHKAN INI
      "Interview_Scheduled", // <-- TAMBAHKAN INI
      "Waiting_HR_Final", // <-- TAMBAHKAN INI
    ];
    console.log("ApplicationService instantiated.");
  }

  public async createApplication(
    applicationData: ApplicationCreationDTO,
    cvFile: Express.Multer.File
  ): Promise<CvApplication> {
    if (!cvFile) throw createError("CV file is required.", 400);

    const t: Transaction = await sequelize.transaction();
    let uploadedMinioObjectName: string | null = null;

    try {
      const positionId = parseInt(applicationData.appliedPositionId, 10);
      if (isNaN(positionId)) {
        throw createError("Valid Applied position ID is required.", 400);
      }
      const position = await JobPosition.findOne({
        where: { id: positionId, status: "Open" },
        transaction: t,
      });
      if (!position) {
        throw createError(`Position not found or not open.`, 404);
      }
      const existingApplication = await CvApplication.findOne({
        where: {
          email: applicationData.email,
          appliedPositionId: position.id,
          isArchived: false,
        },
        transaction: t,
      });
      if (existingApplication) {
        throw createError(
          `Email ${applicationData.email} has already applied for this position.`,
          409
        );
      }
      const uploadedFileInfo = await minioService.uploadCvFile(cvFile);
      uploadedMinioObjectName = uploadedFileInfo.fileName; // (Sepertinya Anda salah, harusnya objectName)
      // uploadedMinioObjectName = uploadedFileInfo.objectName; // <-- Pastikan ini benar

      const dataToSave = {
        fullName: applicationData.fullName,
        email: applicationData.email,
        qualification: position.name,
        agreeTerms: applicationData.agreeTerms,
        cvFileName: uploadedFileInfo.fileName,
        cvFileObjectKey: uploadedFileInfo.objectName, // <-- Pastikan ini objectName
        status: "Submitted",
        appliedPositionId: position.id,
        interview_notes: null, // <-- 4. TAMBAHKAN DEFAULT NULL
      };
      
      const newApplication = await CvApplication.create(dataToSave as any, {
        transaction: t,
      });
      await t.commit();
      console.log(
        `[createApplication] SUCCESS! DB Commit OK. Application ID=${newApplication.id}`
      );
      emailService
        .sendApplicationConfirmation(
          newApplication.email,
          newApplication.fullName,
          newApplication.qualification
        )
        .catch((emailError: any) => {
          console.error(
            `[Email Confirmation] FAILED to send:`,
            emailError.message
          );
        });
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nWebhookUrl) {
        axios
          .post(n8nWebhookUrl, {
            applicationId: newApplication.id,
            cvFileObjectKey: uploadedFileInfo.objectName, // <-- Kirim objectName
          })
          .then(() => {
            console.log(
              `[N8N] Webhook triggered for application ID: ${newApplication.id}`
            );
          })
          .catch((n8nError: any) => {
            console.error(
              `[N8N] CRITICAL: Failed to trigger webhook for ID ${newApplication.id}:`,
              n8nError.message
            );
          });
      } else {
        console.warn("[N8N] Webhook URL not configured, skipping trigger.");
      }
      return newApplication;
    } catch (error: any) {
      if (t && !(t as any).finished) {
        try {
          await t.rollback();
          console.log(`[createApplication] Transaction rolled back due to error.`);
        } catch (rollbackError: any) {
          console.error("[createApplication] Error during rollback:", rollbackError);
        }
      }
      console.error("[createApplication] ERROR during creation process:", error.message);
      if (uploadedMinioObjectName) {
        try {
          // (Pastikan ini objectName, bukan fileName)
          await minioService.deleteCvFile(uploadedMinioObjectName); 
        } catch (cleanupError: any) {
          console.error(
            "[createApplication] Failed to cleanup MinIO file:",
            cleanupError.message
          );
        }
      }
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  // (getAllApplications... tetap sama)
  public async getAllApplications(): Promise<CvApplication[]> {
    try {
      const applications = await CvApplication.findAll({
        where: { isArchived: false },
        order: [["createdAt", "DESC"]],
        attributes: this.standardAttributes,
      });
      console.log(`Service: Fetched ${applications.length} active applications.`);
      return applications;
    } catch (error: any) {
      console.error("Service Error: Fetching active applications:", error);
      throw createError(`Failed to fetch applications: ${error.message}`, 500);
    }
  }

  // (getApplicationById... tetap sama)
  public async getApplicationById(
    applicationId: number
  ): Promise<CvApplication | null> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    const application = await CvApplication.findByPk(applicationId, {
      attributes: this.standardAttributes,
    });
    if (!application)
      throw createError(`Application ID ${applicationId} not found.`, 404);
    return application;
  }

  // (deleteApplication... tetap sama)
  public async deleteApplication(
    applicationId: number
  ): Promise<{ success: true; message: string }> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    console.log(`Service: Deleting application ID: ${applicationId}`);
    const application = await CvApplication.findByPk(applicationId);
    if (!application)
      throw createError(`Application ID ${applicationId} not found.`, 404);
    if (application.cvFileObjectKey) {
      try {
        await minioService.deleteCvFile(application.cvFileObjectKey);
      } catch (minioError: any) {
        console.error(
          `Service Error: Failed deleting Minio file ${application.cvFileObjectKey}:`,
          minioError
        );
      }
    }
    try {
      await application.destroy();
      console.log(`Service: Deleted application ID ${applicationId} from DB.`);
      return { success: true, message: "Application deleted successfully." };
    } catch (dbError: any) {
      console.error(
        `Service Error: Deleting application ID ${applicationId} from DB:`,
        dbError
      );
      throw createError(
        `Failed to delete application from database: ${dbError.message}`,
        500
      );
    }
  }

  // (downloadCvFile... tetap sama)
  public async downloadCvFile(
    applicationId: number
  ): Promise<DownloadFileStream> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    const application = await CvApplication.findByPk(applicationId, {
      attributes: ["id", "cvFileObjectKey", "cvFileName"],
    });
    if (!application || !application.cvFileObjectKey)
      throw createError(`CV file not available for ID ${applicationId}.`, 404);
    try {
      const fileStream = await minioService.downloadCvFile(
        application.cvFileObjectKey
      );
      let contentType = "application/octet-stream";
      const extension = application.cvFileName?.split(".").pop()?.toLowerCase();
      if (extension === "pdf") contentType = "application/pdf";
      else if (extension === "doc") contentType = "application/msword";
      else if (extension === "docx")
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      return {
        fileStream: fileStream as Stream,
        fileName:
          application.cvFileName ||
          `${applicationId}_cv.${extension || "file"}`,
        contentType: contentType,
      };
    } catch (error: any) {
      console.error(
        `Service Error: Downloading file stream ID ${applicationId}:`,
        error
      );
      throw error;
    }
  }

  // --- 5. PERBARUI FUNGSI INI ---
  public async updateApplicationStatus(
    applicationId: number,
    updateData: ApplicationStatusUpdateDTO // <-- Terima Objek, bukan string
  ): Promise<CvApplication> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);

    const application = await CvApplication.findByPk(applicationId);
    if (!application)
      throw createError(`Application ID ${applicationId} not found.`, 404);

    const fieldsToUpdate: ("status" | "interview_notes")[] = [];
    
    // Logika 1: Update Status (jika ada)
    if (updateData.status) {
      if (!this.validStatuses.includes(updateData.status)) {
        throw createError(`Invalid status: ${updateData.status}.`, 400);
      }
      application.status = updateData.status;
      fieldsToUpdate.push("status");
      console.log(`Service: Updating status to ${updateData.status} for ID ${applicationId}.`);
    }

    // Logika 2: Update Interview Notes (jika ada)
    if (updateData.interview_notes) {
      // Menggabungkan notes lama dengan notes baru (jika ada)
      application.interview_notes = {
        ...(application.interview_notes || {}),
        ...updateData.interview_notes,
      };
      fieldsToUpdate.push("interview_notes");
      console.log(`Service: Updating interview_notes for ID ${applicationId}.`);
    }

    // Cek apakah ada yang di-update
    if (fieldsToUpdate.length === 0) {
       console.warn(`Service: No valid fields to update for ID ${applicationId}.`);
       return application; // Kembalikan data apa adanya
    }

    try {
      await application.save({ fields: fieldsToUpdate }); // Hanya simpan field yang berubah
      
      console.log(`Service: Fields [${fieldsToUpdate.join(", ")}] updated for ID ${applicationId}.`);
      
      await application.reload({ attributes: this.standardAttributes });
      return application;
    } catch (error: any) {
      console.error(`Service Error: Updating status/notes for ID ${applicationId}:`, error);
      throw createError(`Failed to update application: ${error.message}`, 500);
    }
  }
  // --- BATAS PERUBAHAN ---

  // (saveAutomatedAnalysisResult... tetap sama)
  public async saveAutomatedAnalysisResult(
    applicationId: number,
    n8nResult: N8nResultDTO
  ): Promise<CvApplication | null> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    console.log(`Service: Saving N8N analysis for ID: ${applicationId}`);
    if (
      !n8nResult ||
      typeof n8nResult.similarity_score !== "number" ||
      typeof n8nResult.passed_hard_gate !== "boolean"
    ) {
      console.error(
        "ERROR: Validasi data N8N gagal! Data:",
        JSON.stringify(n8nResult)
      );
      throw createError("Invalid or incomplete analysis result data.", 400);
    }
    try {
      const application = await CvApplication.findByPk(applicationId);
      if (!application) {
        console.log(
          `Service: Application ID ${applicationId} not found during N8N save.`
        );
        return null;
      }
      application.similarity_score = n8nResult.similarity_score;
      application.passed_hard_gate = n8nResult.passed_hard_gate;
      application.qualitative_assessment = n8nResult.qualitative_assessment;
      application.cv_data = n8nResult.cv_data;
      application.requirement_data = n8nResult.requirement_data;
      if (application.status === "Submitted") {
        application.status = "Reviewed";
      }
      await application.save({
        fields: [
          "similarity_score",
          "passed_hard_gate",
          "qualitative_assessment",
          "cv_data",
          "requirement_data",
          "status",
        ] as const,
      });
      console.log(
        `Service: N8N analysis saved for ID: ${applicationId}. Status: ${application.status}.`
      );
      await application.reload({ attributes: this.standardAttributes });
      return application;
    } catch (error: any) {
      console.error(
        `Service Error: Saving N8N analysis for ID ${applicationId}:`,
        error.message
      );
      console.error(error.stack);
      throw createError(`Database error saving analysis: ${error.message}`, 500);
    }
  }

  // (getAllArchivedApplications... tetap sama)
  public async getAllArchivedApplications(): Promise<CvApplication[]> {
    try {
      const applications = await CvApplication.findAll({
        where: { isArchived: true },
        order: [["createdAt", "DESC"]],
        attributes: this.standardAttributes, // <-- Ini akan mengambil interview_notes juga
      });
      console.log(
        `Service: Fetched ${applications.length} archived applications.`
      );
      return applications;
    } catch (error: any) {
      console.error("Service Error: Fetching archived applications:", error);
      throw createError(`Failed to fetch archived apps: ${error.message}`, 500);
    }
  }
  
  // (archiveApplications... tetap sama)
  public async archiveApplications(
    applicationIds: number[]
  ): Promise<{ success: boolean; count: number; message: string }> {
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      return { success: true, message: "No IDs provided.", count: 0 };
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs provided for archiving.", 400);
    try {
      const [updateCount] = await CvApplication.update(
        { isArchived: true },
        {
          where: {
            id: { [Op.in]: validIds },
            isArchived: false,
            status: { [Op.in]: ["Accepted", "Rejected"] },
          },
        }
      );
      console.log(`Service: Archived ${updateCount} applications.`);
      return {
        success: true,
        message: `${updateCount} applications archived.`,
        count: updateCount,
      };
    } catch (error: any) {
      console.error(`Service Error: Archiving applications:`, error);
      throw createError(`Failed to archive: ${error.message}`, 500);
    }
  }

  // (unarchiveApplications... tetap sama)
  public async unarchiveApplications(
    applicationIds: number[]
  ): Promise<{ success: boolean; count: number; message: string }> {
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      return { success: true, message: "No IDs provided.", count: 0 };
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs provided for unarchiving.", 400);
    try {
      const [updateCount] = await CvApplication.update(
        { isArchived: false },
        { where: { id: { [Op.in]: validIds }, isArchived: true } }
      );
      console.log(`Service: Unarchived ${updateCount} applications.`);
      return {
        success: true,
        message: `${updateCount} applications unarchived.`,
        count: updateCount,
      };
    } catch (error: any) {
      console.error(`Service Error: Unarchiving applications:`, error);
      throw createError(`Failed to unarchive: ${error.message}`, 500);
    }
  }

  // (bulkDeleteActiveApplications... tetap sama)
  public async bulkDeleteActiveApplications(
    applicationIds: number[]
  ): Promise<{ success: boolean; count: number; message: string }> {
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      return { success: true, message: "No IDs.", count: 0 };
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs for bulk delete.", 400);
    const t: Transaction = await sequelize.transaction();
    try {
      const applicationsToDelete = await CvApplication.findAll({
        where: { id: { [Op.in]: validIds }, isArchived: false },
        attributes: ["id", "cvFileObjectKey"],
        transaction: t,
      });
      if (applicationsToDelete.length === 0) {
        await t.rollback();
        return {
          success: true,
          message: "No eligible active applications found.",
          count: 0,
        };
      }
      const idsToDelete = applicationsToDelete.map((app: CvApplication) => app.id);
      const objectKeysToDelete = applicationsToDelete
        .map((app: CvApplication) => app.cvFileObjectKey)
        .filter(Boolean) as string[];
      if (objectKeysToDelete.length > 0) {
        console.log(
          `Service: Deleting ${objectKeysToDelete.length} files for bulk delete.`
        );
        await Promise.allSettled(
          objectKeysToDelete.map((key) =>
            minioService
              .deleteCvFile(key)
              .catch((e: any) =>
                console.error(`Failed deleting file ${key}:`, e)
              )
          )
        );
      }
      const deletedRowCount = await CvApplication.destroy({
        where: { id: { [Op.in]: idsToDelete } },
        transaction: t,
      });
      await t.commit();
      console.log(
        `Service: Bulk deleted ${deletedRowCount} active applications.`
      );
      return {
        success: true,
        message: `${deletedRowCount} applications deleted permanently.`,
        count: deletedRowCount,
      };
    } catch (error: any) {
      if (t && !(t as any).finished) await t.rollback();
      console.error(
        `Service Error: Bulk deleting active applications:`,
        error
      );
      throw createError(`Bulk deletion failed: ${error.message}`, 500);
    }
  }

  // (bulkDownloadCvFiles... tetap sama)
  public async bulkDownloadCvFiles(
    applicationIds: number[]
  ): Promise<{ zipBuffer: Buffer; fileName: string }> {
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      throw createError("No IDs provided.", 400);
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs for bulk download.", 400);
    const applications = await CvApplication.findAll({
      where: { id: { [Op.in]: validIds } },
      attributes: [
        "id",
        "fullName",
        "qualification",
        "cvFileName",
        "cvFileObjectKey",
      ],
    });
    if (applications.length === 0)
      throw createError("No applications found for download.", 404);
    const zip = new JSZip();
    let filesAdded = 0;
    const downloadPromises = applications.map(async (app: CvApplication) => {
      if (app.cvFileObjectKey) {
        try {
          const fileBuffer = await minioService.downloadCvFileAsBuffer(
            app.cvFileObjectKey
          );
          if (fileBuffer) {
            const safeFullName = (app.fullName || `app_${app.id}`).replace(
              /[^a-z0-9]/gi,
              "_"
            );
            const safeQual = (app.qualification || "pos").replace(
              /[^a-z0-9]/gi,
              "_"
            );
            const extension =
              app.cvFileName?.split(".").pop()?.toLowerCase() || "file";
            const filenameInZip = `${app.id}_${safeFullName}_${safeQual}.${extension}`;
            zip.file(filenameInZip, fileBuffer);
            filesAdded++;
          }
        } catch (downloadError: any) {
          console.error(
            `Service Error: Failed getting buffer for ${app.id} (${app.cvFileObjectKey}):`,
            downloadError.message
          );
        }
      }
    });
    await Promise.allSettled(downloadPromises);
    if (filesAdded === 0)
      throw createError("Could not retrieve any CV files.", 404);
    console.log(`Service: Generating ZIP with ${filesAdded} files.`);
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    const zipFileName = `selected_cvs_${moment().format("YYYYMMDD_HHmmss")}.zip`;
    return { zipBuffer, fileName: zipFileName };
  }

  // (Dashboard Functions... tetap sama, tapi kita update status 'needReview')
  public async getDashboardSummaryStats(): Promise<object> {
    try {
      const totalCvCount = await CvApplication.count();
      const twentyFourHoursAgo = moment().subtract(24, "hours").toDate();
      const newCvLast24Hours = await CvApplication.count({
        where: { createdAt: { [Op.gte]: twentyFourHoursAgo } },
      });
      const needReviewCount = await CvApplication.count({
        where: {
          // Status 'need review' sekarang mencakup semua tahap sebelum wawancara
          status: { [Op.in]: ["Submitted", "Reviewed"] }, 
          isArchived: false,
        },
      });
      const acceptedCvCount = await CvApplication.count({
        where: { status: "Accepted", isArchived: false },
      });
      const rejectedCvCount = await CvApplication.count({
        where: { status: "Rejected", isArchived: false },
      });
      const activePositionsCount =
        await jobPositionService.countOpenPositions();
      return {
        totalCvCount,
        newCvLast24Hours,
        needReviewCount,
        acceptedCvCount,
        rejectedCvCount,
        activePositionsCount,
      };
    } catch (error: any) {
      console.error("Service Error: Fetching dashboard stats:", error);
      throw createError(`Failed to fetch dashboard stats: ${error.message}`, 500);
    }
  }

  public async getStatusDistribution(): Promise<object> {
    try {
      const statusCounts = await CvApplication.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: { isArchived: false },
        group: ["status"],
      });
      const distribution: { [key: string]: number } = {};
      this.validStatuses.forEach((status) => { // Gunakan this.validStatuses
        distribution[status] = 0;
      });
      statusCounts.forEach((item: any) => {
        if (this.validStatuses.includes(item.dataValues.status)) { // Cek jika status valid
            distribution[item.dataValues.status] = parseInt(
            item.dataValues.count,
            10
          );
        }
      });
      return distribution;
    } catch (error: any) {
      console.error("Service Error: Fetching status distribution:", error);
      throw createError(
        `Failed to fetch status distribution: ${error.message}`,
        500
      );
    }
  }

  public async getWeeklySubmissionTrend(): Promise<object[]> {
    try {
      const sevenDaysAgo = moment().subtract(7, "days").startOf("day").toDate();
      const dailyCounts = (await CvApplication.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: { createdAt: { [Op.gte]: sevenDaysAgo } },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
        raw: true,
      })) as any[];

      const countsMap = new Map<string, number>(
        dailyCounts.map((item) => [
          moment(item.date).format("YYYY-MM-DD"),
          parseInt(item.count, 10),
        ])
      );

      const trendData: object[] = [];
      let currentDate = moment(sevenDaysAgo);
      const today = moment().endOf("day");

      while (currentDate.isSameOrBefore(today, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD");
        trendData.push({
          date: dateString,
          count: countsMap.get(dateString) || 0,
        });
        currentDate.add(1, "day");
      }
      return trendData;
    } catch (error: any) {
      console.error("Service Error: Fetching weekly submission trend:", error);
      throw createError(`Failed to fetch weekly trend: ${error.message}`, 500);
    }
  }

  public async getRecentApplications(
    limit: number = 5
  ): Promise<CvApplication[]> {
    try {
      const recentApplications = await CvApplication.findAll({
        where: { isArchived: false },
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit as any, 10) || 5,
        attributes: ["id", "fullName", "qualification", "status", "createdAt"],
      });
      return recentApplications;
    } catch (error: any) {
      console.error("Service Error: Fetching recent applications:", error);
      throw createError(`Failed to fetch recent apps: ${error.message}`, 500);
    }
  }

  // --- 6. PERBARUI FUNGSI RANKING ---
  public async getRankedApplications(
    filters: RankFiltersDTO = {},
    limit: number = 10
  ): Promise<CvApplication[]> {
    console.log("Service: Fetching ranked applications with filters:", filters);
    try {
      
      let whereClause: any = {
        isArchived: false,
        // Tampilkan hanya yang siap diseleksi Manajer
        status: {
            [Op.in]: [
                "Reviewed",          // Siap diolah
                "Interview_Queued",  // Sudah diantrikan
                "Interview_Scheduled", // Sudah dijadwalkan
                "Waiting_HR_Final",  // Tahap akhirs
                "Accepted",          // Sudah di-hire
                "Rejected",          // Sudah ditolak
            ],
        }, 
        similarity_score: { [Op.ne]: null },
      };

      if (filters.searchTerm) {
        const lower = filters.searchTerm.toLowerCase();
        const likeOp =
          (sequelize as any).options.dialect === "postgres" ? Op.iLike : Op.like;
        whereClause[Op.or] = [
          { fullName: { [likeOp]: `%${lower}%` } },
          { email: { [likeOp]: `%${lower}%` } },
          { qualification: { [likeOp]: `%${lower}%` } },
        ];
      }
      // Filter status di 'TopRanking' diabaikan, KARENA kita HANYA mau status 'Reviewed'
      // if (filters.statusFilter) {
      //   whereClause.status = filters.statusFilter;
      // }
      if (filters.qualificationFilter) {
        whereClause.qualification = filters.qualificationFilter;
      }
      if (filters.dateFilter) {
        const startOfDay = moment(filters.dateFilter, "YYYY-MM-DD")
          .startOf("day")
          .toDate();
        const endOfDay = moment(filters.dateFilter, "YYYY-MM-DD")
          .endOf("day")
          .toDate();
        whereClause.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      }

      const applications = await CvApplication.findAll({
        where: whereClause,
        order: [
          ["similarity_score", "DESC"],
          ["createdAt", "DESC"],
        ],
        limit: parseInt(limit as any, 10) || 10,
        attributes: this.standardAttributes,
      });

      if (applications.length > 0) {
        console.log("--- DEBUG: (SAMPEL getRanked) ---");
        console.log(
          `  -> ID ${applications[0].id} interview_notes ada?: ${!!applications[0].interview_notes}`
        );
      }

      console.log(
        `Service: Found ${applications.length} ranked applications.`
      );
      return applications;
    } catch (error: any) {
      console.error("Service Error: Fetching ranked applications:", error);
      throw new Error(
        `Failed to fetch ranked applications: ${error.message}`
      );
    }
  }
} // <-- Penutup Class

// Ekspor satu instance (singleton) dari class
export default new ApplicationService();