// src/services/application.service.ts
import { CvApplication, JobPosition, User, Schedule } from "../models";
import minioService from "./minio.service";
import { sequelize } from "../config/database";
import { Op, Transaction } from "sequelize";
import moment from "moment";
import jobPositionService from "./jobPosition.service";
import axios from "axios";
import JSZip from "jszip";
import {
  IApplicationService,
  ApplicationCreationDTO,
  N8nResultDTO,
  RankFiltersDTO,
  DownloadFileStream,
  ApplicationStatusUpdateDTO, 
} from "../interfaces/IApplicationService";
import { Stream } from "stream";

// Helper function untuk membuat error dengan status code
const createError = (message: string, status: number): Error => {
  const error: any = new Error(message);
  error.status = status;
  return error;
};

// class ApplicationService disini turunan dari interface IApplication service,
// jadi wajib implement semua method yang ada di interface
class ApplicationService implements IApplicationService {
  public standardAttributes: string[];
  public validStatuses: string[];

  constructor() {
    this.standardAttributes = [
      "id", "fullName", "email", "qualification", "cvFileName", "cvFileObjectKey",
      "status", "createdAt", "updatedAt", "isArchived", "appliedPositionId",
      "similarity_score", "passed_hard_gate", "qualitative_assessment", 
      "cv_data", "requirement_data", 
      "interview_notes",
    ];
    // untuk memudahkan agar tidak hardcode di dalam method ApplicationService, dan juga untuk validasi input status di method updateApplicationStatus
    this.validStatuses = [
      "SUBMITTED",
      "REVIEWED",
      "STAFF_APPROVED",
      "STAFF_REJECTED",
      "INTERVIEW_QUEUED",
      "INTERVIEW_SCHEDULED",
      "PENDING_FINAL_DECISION",
      "FINAL_INTERVIEW_QUEUED",
      "FINAL_INTERVIEW_SCHEDULED",
      "HIRED",
      "NOT_HIRED",
      "ONBOARDING"
    ];
    console.log("ApplicationService instantiated.");
  }

// Implementasi metode createApplication untuk apply CV pelamar
public async createApplication(
    applicationData: ApplicationCreationDTO, // DTO yang sudah didefinisikan di interface
    cvFile: Express.Multer.File // file CV yang diupload oleh pelamar
  ): Promise<CvApplication> { //await sampe database berhasil menyimpan data aplikasi baru, lalu return data aplikasi yang baru dibuat
    // Validasi input dasar
    if (!cvFile) throw createError("CV file is required.", 400);

    // Validasi posisi yang dilamar ada dan statusnya OPEN
    const positionId = parseInt(applicationData.appliedPositionId, 10);
    if (isNaN(positionId)) {
        throw createError("Valid Applied position ID is required.", 400);
    }
    // Ambil data posisi dari database lalu compare
    const position = await JobPosition.findOne({
        where: { id: positionId, status: "OPEN" },
    });
    if (!position) {
      // Jika posisi tidak ditemukan atau tidak terbuka, lempar error dengan status 404
      throw createError(`Position not found or not open.`, 404);
    }
    // transaction disni untuk menghindari race condition pada pengecekan duplikasi email 
    const t: Transaction = await sequelize.transaction();
    let uploadedMinioObjectName: string | null = null;

    try {
      // Cek duplikasi email untuk posisi yang sama di dalam transaksi
      const existingApplication = await CvApplication.findOne({
       where: {
          email: applicationData.email,
          appliedPositionId: position.id, // Gunakan posisi dari luar transaksi
          isArchived: false,
        },
        transaction: t,
      });
      // Jika sudah ada, batalkan proses
      if (existingApplication) {
        throw createError(
          `Email ${applicationData.email} has already applied for this position.`,
          409
        );
      }
      // Upload file CV ke MinIO
      const uploadedFileInfo = await minioService.uploadCvFile(cvFile);
      uploadedMinioObjectName = uploadedFileInfo.objectName;

       //data untuk disimpan di database
      const dataToSave = {
        fullName: applicationData.fullName,
        email: applicationData.email,
        qualification: position.name, // Simpan nama posisi, bukan ID
        agreeTerms: applicationData.agreeTerms,
        cvFileName: uploadedFileInfo.fileName,
        cvFileObjectKey: uploadedFileInfo.objectName,
        status: "SUBMITTED", // Status default saat membuat aplikasi baru
        appliedPositionId: position.id, // Gunakan posisi yang sudah diverifikasi
        interview_notes: null,
      };
      
      // Simpan data pelamar ke database dalam transaksi yang tadi dibuka saat awal
      const newApplication = await CvApplication.create(dataToSave as any, {
        transaction: t,
      });
      // Commit transaksi setelah semua langkah berhasil
      await t.commit();
      console.log(
        `[createApplication] SUCCESS! DB Commit OK. Application ID=${newApplication.id}`
      );
      // Trigger N8N webhook untuk analisis otomatis lewat post ke n8n
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nWebhookUrl) {
        // Kirim data ke webhook N8N
        axios
          .post(n8nWebhookUrl, {
            // Payload data untuk N8N
            applicationId: newApplication.id,
            cvFileObjectKey: uploadedFileInfo.objectName,
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
      // Rollback transaksi jika ada error
      if (t && !(t as any).finished) {
        try {
          // Rollback transaksi
          await t.rollback();
          console.log(`[createApplication] Transaction rolled back due to error.`);
        } catch (rollbackError: any) {
          console.error("[createApplication] Error during rollback:", rollbackError);
        }
      }
      console.error("[createApplication] ERROR during creation process:", error.message);

      // untuk hapus minio jika gagal agar tidak spam file di minio
      if (uploadedMinioObjectName) {
        try {
          await minioService.deleteCvFile(uploadedMinioObjectName); 
        } catch (cleanupError: any) {
          console.error(-
            "[createApplication] Failed to cleanup MinIO file:",
            cleanupError.message
          );
        }
      }
      if (!error.status) error.status = 500;
      throw error;
    }
  }

  // ambil aplikasi yang belum diarsipkan
  public async getAllApplications(): Promise<CvApplication[]> {
    try {
      // cari yang belum arsip, urutkan dari yang terbaru, dan hanya ambil field yang diperlukan saja (standardAttributes)
      const applications = await CvApplication.findAll({
        where: { isArchived: false },
        order: [["createdAt", "DESC"]],
        attributes: this.standardAttributes,
      });
      console.log(`Service: Fetched ${applications.length} active applications.`);
      return applications;
    } catch (error: any) {
      console.error("Service Error: Fetching active applications:", error);
      throw createError(`Failed to fetch applications: ${error.message}`, 500); //500 karena eror server saat fetching data dari database
    }
  }

  // ambil berdasarkan ID aplikasi, untuk detail aplikasi di halaman admin
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

  // hapus berdasarkan ID
public async deleteApplication(
    applicationId: number
  ): Promise<{ success: true; message: string}> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    console.log(`Service: Deleting application ID: ${applicationId} and related schedule...`);
    // transaksi untuk jalankan dua aksi sekaligus yaitu hapus aplikasi dan hapus jadwal interview yang terkait, agar tidak tidak spam
    const t: Transaction = await sequelize.transaction();
    try {
      // Cari aplikasi dulu untuk dapatkan object key file CV dan pastikan aplikasinya ada
      const application = await CvApplication.findByPk(applicationId, { transaction: t });
      if (!application) {
        await t.rollback();
        throw createError(`Application ID ${applicationId} not found.`, 404);
      }
      // Hapus file CV dari MinIO jika ada
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
      // Hapus jadwal interview dari child dlu
      await Schedule.destroy({
        where: { applicationId: applicationId },
        transaction: t
      });
      console.log(`Service: Deleted related schedule for application ID ${applicationId}.`);
      // baru dari parent hapus aplikasi dari database
      await application.destroy({ transaction: t });
      console.log(`Service: Deleted application ID ${applicationId} from DB.`);
      // commit agar transaksi selesai dan perubahan tersimpan di database, jika tidak commit maka perubahan tidak akan tersimpan
      await t.commit();
  
      return { success: true, message: "Application and related schedule deleted successfully."};

    } catch (dbError: any) {
      // Rollback transaksi jika ada error saat proses hapus
      await t.rollback();
      console.error(
        `Service Error: Deleting application ID ${applicationId} from DB:`,
        dbError
      );
      // throw langsung untuk menghentikan proses dan kirim error ke controller
      throw createError(
        `Failed to delete application from database: ${dbError.message}`,
        500
      );
    }
  }

   //download berdasarkan ID
public async downloadCvFile(
    applicationId: number
  ): Promise<DownloadFileStream> { // DTO sesuai Interface
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    // ambil data yaitu id nya, object keynya, dan nama file
    const application = await CvApplication.findByPk(applicationId, {
      attributes: ["id", "cvFileObjectKey", "cvFileName"],
    });
    //validasi jika apikasi ga ada atau object ga ada maka kirim error 404 
    if (!application || !application.cvFileObjectKey)
      throw createError(`CV file not available for ID ${applicationId}.`, 404);
    try {
      //panggil minio untuk download berdasarkan object key
      const fileStream = await minioService.downloadCvFile(
        application.cvFileObjectKey
      );
      // Tentukan content type berdasarkan ekstensi file untuk header response yang benar
      let contentType = "application/octet-stream";
      // extension untuk nama file di downloadnanti, seperti .pdf, .doc, .docx
      const extension = application.cvFileName?.split(".").pop()?.toLowerCase();
      // Tentukan content pdf atau word untuk memudahkan download di browser, jika tidak dikenali tetap default application/octet-stream
      if (extension === "pdf") contentType = "application/pdf";
      else if (extension === "doc") contentType = "application/msword";
      else if (extension === "docx") // untuk docx content type nya berbeda karena formatnya yang lebih kompleks
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          // return sesuai DTO
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

  // update status berdasarkan ID oleh N8N  atau oke user HR,
  // misal untuk update status setelah interview atau update hasil analisis N8N
public async triggerScheduleWorkflow(
  applicationId: number,
  scheduleData: any,
  hrUser: any
): Promise<CvApplication> {
  
  // ambil dari env webhook
  const n8nWebhookUrl = process.env.N8N_SCHEDULE_WEBHOOK_URL;
  if (!n8nWebhookUrl) {
    console.error("[Service] N8N_SCHEDULE_WEBHOOK_URL not configured.");
    throw createError("Schedule service is not configured.", 500);
  }

  // ambil applikasi by id
  const application = await CvApplication.findByPk(applicationId, {
    include: [
      {
        model: JobPosition,
        as: "appliedPosition",
        include: [{ model: User, as: "requestor" }],
      },
    ],
  });

  if (!application) {
    throw createError("Application not found.", 404);
  }
  // untuk validasi input dari controller, 
  // pastikan ada field yang diperlukan seperti dateTime, endTime, type (manager/final_hr), dan preference (online/offline)
  const interviewType = scheduleData.type; 

  if (!interviewType) {
    throw createError("Interview Type (manager/final_hr) is required.", 400);
  }
  // validasi bahwa type harus manager atau final_hr, jika tidak kirim 400 (input tidak valid)
  let newStatus: string;
  if (interviewType === 'manager') {
    newStatus = 'INTERVIEW_SCHEDULED';
  } else if (interviewType === 'final_hr') {
    newStatus = 'FINAL_INTERVIEW_SCHEDULED';
  } else if (interviewType === 'onboarding') {
    newStatus = 'ONBOARDING';
  } else {
    // Fallback hanya jika ada custom status, JANGAN default ke manager
    newStatus = scheduleData.newStatus || 'INTERVIEW_SCHEDULED';
  }

  // payload yang akan di kirim ke n8n
  let payload: any = {
    applicationId: application.id,
    candidateName: application.fullName,
    candidateEmail: application.email,
    dateTime: scheduleData.dateTime,
    endTime: scheduleData.endTime,
    notes_from_hr: scheduleData.notes_from_hr,
    userName: hrUser.email,
    interviewType: interviewType,
    positionName: application.qualification,
    newStatus: newStatus
  };

  // tentukan interviewer name dan email berdasarkan type interview, dan preference dari input frontend
  if (interviewType === 'manager') {
    const manager = (application as any).appliedPosition?.requestor;
    payload.interviewerName = manager?.name || "Manager";
    payload.interviewerEmail = manager?.email || null;
    payload.preference = (application.interview_notes as any)?.preference || scheduleData.preference || "Online";
    
  } else if (interviewType === 'final_hr') {
    // cari user untuk head hr untuk jadwal final interview.
    const headHrUser = await User.findOne({ where: { role: 'head_hr' } });
    payload.interviewerName = headHrUser?.name || "Kepala HR"; 
    payload.interviewerEmail = headHrUser?.email || null;
    payload.preference = scheduleData.preference || "Online";
    // jika preference online, maka link meeting akan dibuat oleh n8n, tapi jika offline maka link meeting tetap null
  } else if (interviewType === 'onboarding') {
    payload.interviewerName = hrUser.name || "HR Team"; 
    payload.interviewerEmail = hrUser.email;
    // Default Preference biasanya Offline (ke kantor), tapi ambil dari input frontend
    payload.preference = scheduleData.preference || "Offline";
  }
  
  // post ke n8n untuk trigger workflow jadwal interview, dan kirim payload yang sudah dibuat tanpa await
  axios.post(n8nWebhookUrl, payload)
    .then(() => console.log(`[N8N] ${interviewType} webhook triggered successfully.`))
    .catch((err) => console.error(`[N8N] Failed:`, err.message));
    
  // Update status aplikasi dan simpan notes jadwal interview di database, agar bisa ditampilkan di detail aplikasi
  application.status = newStatus;

  // Simpan notes jadwal
  application.interview_notes = {
    ...(application.interview_notes as any || {}),
    scheduled_by: hrUser.email,
    scheduled_at: new Date(),
    interview_type: interviewType,
    preference: payload.preference,
    
    // Data spesifik jadwal (penting untuk tabel)
    scheduled_time: scheduleData.dateTime, 
    schedule_link: scheduleData.scheduleLink || null, // Jika N8N mengembalikan link sync (opsional)
  };

  await application.save({
    fields: ["status", "interview_notes"],
  });
  return application;
}

// untuk segala terkait update misal (n8n, hr, atau update status biasa), 
// jadi satu fungsi saja untuk update status dan notes, agar tidak banyak fungsi yang mirip di service
public async updateApplicationStatus(
    applicationId: number,
    updateData: ApplicationStatusUpdateDTO
  ): Promise<CvApplication> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    // cek apakah ada aplikasi dengan ID tersebut
    const application = await CvApplication.findByPk(applicationId);
    if (!application)
      throw createError(`Application ID ${applicationId} not found.`, 404);
    
    // untuk simpan files yang akan diupdate, agar tidak update semua field tapi hanya field yang diubah saja, dan juga untuk validasi input status yang masuk
    const fieldsToUpdate: ("status" | "interview_notes")[] = [];
    
    // untuk update status, memudahkan saat update status biasa oleh HR atau update status otomatis oleh N8N, 
    // tapi tetap validasi input status yang masuk
    if (updateData.status) {
      //jika status yang diupdate tidak ada di daftar validStatuses, maka kirim error 400 (input tidak valid)
      if (!this.validStatuses.includes(updateData.status)) {
        throw createError(`Invalid status: ${updateData.status}.`, 400);
      }
      // jika valid, maka update status aplikasi dengan status yang baru, dan tambahkan "status" ke fieldsToUpdate agar saat save hanya update field status saja
      application.status = updateData.status;
      fieldsToUpdate.push("status");
    }
    
    // untuk update interview notes, dan cek jika ada data interview notes yang dikirim, 
    // maka update field interview_notes di database, dan tambahkan "interview_notes" ke fieldsToUpdate agar saat save hanya update field interview_notes saja
    if (updateData.interview_notes !== undefined && updateData.interview_notes !== null) {
      // ambil data dari database, lalu  merge dengan data baru yang dikirim dari input,
      //  agar data jadwal yang sudah ada tidak hilang saat update interview notes untuk update status biasa oleh HR, atau update hasil jadwal interview oleh N8N
      const currentNotes = application.interview_notes as any || {};
      
      // Jika status berubah ke PENDING_FINAL_DECISION, hapus data jadwal Manager
      if (updateData.status === 'PENDING_FINAL_DECISION') {
        delete currentNotes.scheduled_time;
        delete currentNotes.schedule_link;
        delete currentNotes.manager_proposed_start;
        delete currentNotes.manager_proposed_end;
        delete currentNotes.scheduled_by;
        delete currentNotes.scheduled_at;
        
        // Merge dengan data baru dari Manager (feedback)
        application.interview_notes = {
          ...currentNotes,
          ...updateData.interview_notes,
        };
      } else {
        // Update biasa (tidak ada clear)
        application.interview_notes = {
          ...currentNotes,
          ...updateData.interview_notes,
        };
      }
      // tambahkan "interview_notes" ke fieldsToUpdate agar saat save hanya update field interview_notes saja
      fieldsToUpdate.push("interview_notes");
    }
    // jika tidak ada field yang valid untuk diupdate, maka kirim peringatan dan return aplikasi tanpa update
    if (fieldsToUpdate.length === 0) {
       console.warn(`Service: No valid fields to update for ID ${applicationId}.`);
       return application;
    }
    try {
      // Simpan perubahan ke database hanya untuk field yang valid
      await application.save({ fields: fieldsToUpdate });
      // reaload aplikasi untuk memastikan data yang terbaru setelah update, dan hanya ambil field yang diperlukan saja (standardAttributes)
      await application.reload({ attributes: this.standardAttributes });
      return application;

    } catch (error: any) {
      throw createError(`Failed to update application: ${error.message}`, 500);
    }
  }

// post dari n8n ke service untuk simpan ke dabatase 
public async saveAutomatedAnalysisResult(
    applicationId: number,
    n8nResult: N8nResultDTO
  ): Promise<CvApplication | null> {
    if (isNaN(applicationId))
      throw createError("Invalid application ID.", 400);
    //cek jika data hasil analisis dari N8N tidak lengkap atau tidak valid
    if (
      !n8nResult ||
      typeof n8nResult.similarity_score !== "number" ||
      typeof n8nResult.passed_hard_gate !== "boolean"
    ) {
      throw createError("Invalid or incomplete analysis result data.", 400);
    }
    try {
      // cek ID di database, jika tidak ada maka log dan return null,
      const application = await CvApplication.findByPk(applicationId);
      if (!application) {
        return null;
      }
      if (application.status !== "SUBMITTED") {
        return application;
      }

      application.similarity_score = n8nResult.similarity_score;
      application.passed_hard_gate = n8nResult.passed_hard_gate;
      application.qualitative_assessment = n8nResult.qualitative_assessment;
      application.cv_data = n8nResult.cv_data;
      application.requirement_data = n8nResult.requirement_data;
      application.status = "REVIEWED";
      // update hanya fileds yang diubah saja, agar tidak update field lain yang tidak perlu, 
      // dan juga untuk validasi input status yang masuk
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
      await application.reload({ attributes: this.standardAttributes });
      return application;
    } catch (error: any) {
      throw createError(`Database error saving analysis: ${error.message}`, 500);
    }
  }

  // ambil yang sudah di arsipkan [] berarti objek ambil semua
public async getAllArchivedApplications(): Promise<CvApplication[]> {
    try {
      //cari yang udah arsip, descending, dan ambil standard atribut yang ada di constructor
      const applications = await CvApplication.findAll({
        where: { isArchived: true },
        order: [["createdAt", "DESC"]],
        attributes: this.standardAttributes,
      });
      console.log(
        `Service: Fetched ${applications.length} archived applications.`
      );
      return applications;
    } catch (error: any) {
      throw createError(`Failed to fetch archived apps: ${error.message}`, 500);
    }
  }
  
// arsip aplikasi berdasarkan status HIRED, NOT_HIRED, atau STAFF_REJECTED yang bisa diarsipkan
// arsip banyak sekaligus berdasarkan input array ID
public async archiveApplications(
    applicationIds: number[]
  ): Promise<{ success: boolean; count: number; message: string }> {
    // cek apakah array dan ada isinya
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      return { success: true, message: "No IDs provided.", count: 0 };
    // buang yang bukan angka, karena ID harus angka, jika semua ID tidak valid maka kirim error 400 (input tidak valid)
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs provided for archiving.", 400);
    try {
      // update banyak berdasarkan id nya menggunakan Op in
      const [updateCount] = await CvApplication.update(
        { isArchived: true },
        {
          where: {
            id: { [Op.in]: validIds },
            isArchived: false,
            status: { [Op.in]: ["HIRED", "NOT_HIRED", "STAFF_REJECTED"] },
          },
        }
      );
      return {
        // kembalikan sesuai DTO
        success: true,
        message: `${updateCount} applications archived.`,
        count: updateCount,
      };
    } catch (error: any) {
      throw createError(`Failed to archive: ${error.message}`, 500);
    }
  }

//  untuk unarchive aplikasi yang sudah diarsipkan
public async unarchiveApplications(
    applicationIds: number[]
  ): Promise<{ success: boolean; count: number; message: string }> {
    // cek apakah array dan ada isinya
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      return { success: true, message: "No IDs provided.", count: 0 };
    // mapping agar id yang valid saja
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs provided for unarchiving.", 400);
    try {
      // update sekaligus berdasarkan ID
      const [updateCount] = await CvApplication.update(
        { isArchived: false },
        { where: { id: { [Op.in]: validIds }, isArchived: true } }
      );
      return {
        // kembalikan sesuai DTO
        success: true,
        message: `${updateCount} applications unarchived.`,
        count: updateCount,
      };
    } catch (error: any) {
      throw createError(`Failed to unarchive: ${error.message}`, 500);
    }
  }

public async bulkDeleteActiveApplications(
    applicationIds: number[]
  ): Promise<{ success: boolean; count: number; message: string }> {
    // cek apakah array dan ada isinya
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      return { success: true, message: "No IDs.", count: 0 };
    // mapping agar id yang valid saja
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs for bulk delete.", 400);
    // transaction untuk memastikan proses hapus aplikasi dan file CV berjalan bersamaan
    const t: Transaction = await sequelize.transaction();
    try {
      // cari aplikasi berdasarkan id untuk di hapus dan ini array
      const applicationsToDelete = await CvApplication.findAll({
        where: { id: { [Op.in]: validIds }, isArchived: false },
        attributes: ["id", "cvFileObjectKey"],
        transaction: t, // transaksi masih berlaku
      });
      // cek jika ada yang bisa di hapus
      if (applicationsToDelete.length === 0) {
        await t.rollback(); // rollback dan transaksi dibatalkan 
        return {
          success: true,
          message: "No eligible active applications found.",
          count: 0,
        };
      }
      // ambil id nya saja
      const idsToDelete = applicationsToDelete.map((app: CvApplication) => app.id);
      // ambil object key dan filter yang string tidak kosong atau null
      const objectKeysToDelete = applicationsToDelete
        .map((app: CvApplication) => app.cvFileObjectKey)
        .filter(Boolean) as string[];
      // hapus sekaligus menggunakan Promise.allSettled untuk semua file CV 
      if (objectKeysToDelete.length > 0) {
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
      // hapus masal dengan id
      const deletedRowCount = await CvApplication.destroy({
        where: { id: { [Op.in]: idsToDelete } },
        transaction: t,
      });
      await t.commit(); // commit karena minio dan datqabase di hapus
      return {
        success: true,
        message: `${deletedRowCount} applications deleted permanently.`,
        count: deletedRowCount,
      };
    } catch (error: any) {
      if (t && !(t as any).finished) await t.rollback();
      throw createError(`Bulk deletion failed: ${error.message}`, 500);
    }
  }

public async bulkDownloadCvFiles(
    applicationIds: number[]
  ): Promise<{ zipBuffer: Buffer; fileName: string }> {
    // cek apakah array dan ada isinya
    if (!Array.isArray(applicationIds) || applicationIds.length === 0)
      throw createError("No IDs provided.", 400);
    // cek apakah id yang valid aja dan angka bukan null
    const validIds = applicationIds.filter((id) => !isNaN(id));
    if (validIds.length === 0)
      throw createError("Invalid IDs for bulk download.", 400);
    // cari aplikasi berdasarkan id hasilnya banyak
    const applications = await CvApplication.findAll({
      where: { id: { [Op.in]: validIds } },
      // tidak perlu panggil constructor karena hanya butuh field tertentu 
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
    // buat zip baru untuk simpan file CV yang akan di download
    const zip = new JSZip();
    // flag untuk hitung berapa aplikasi
    let filesAdded = 0;
    // download file CV dari minio berdasarkan object key nya untuk setiap aplikasi, 
    // lalu simpan di zip dengan nama file yang unik berdasarkan id
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

  public async getDashboardSummaryStats(): Promise<object> {
    try {
      const totalCvCount = await CvApplication.count();
      const twentyFourHoursAgo = moment().subtract(24, "hours").toDate();
      const newCvLast24Hours = await CvApplication.count({
        where: { createdAt: { [Op.gte]: twentyFourHoursAgo } },
      });
      const needReviewCount = await CvApplication.count({
        where: {
          status: { [Op.in]: ["SUBMITTED", "REVIEWED"] }, 
          isArchived: false,
        },
      });
      const acceptedCvCount = await CvApplication.count({
        where: { status: "HIRED", isArchived: false },
      });
      const rejectedCvCount = await CvApplication.count({
        where: { 
          status: { [Op.in]: ["NOT_HIRED", "STAFF_REJECTED"] }, 
          isArchived: false 
        },
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
      this.validStatuses.forEach((status) => {
        distribution[status] = 0;
      });
      statusCounts.forEach((item: any) => {
        if (this.validStatuses.includes(item.dataValues.status)) {
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

  public async getRankedApplications(
    filters: RankFiltersDTO = {},
    limit: number = 10
  ): Promise<CvApplication[]> {
    console.log("Service: Fetching ranked applications with filters:", filters);
    try {
      let whereClause: any = {
        isArchived: false,
        status: {
          [Op.in]: ["SUBMITTED", "REVIEWED", "STAFF_APPROVED", "INTERVIEW_QUEUED", "INTERVIEW_SCHEDULED", "PENDING_FINAL_DECISION" ,"HIRED", "NOT_HIRED", "ONBOARDING"],
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
}

export default new ApplicationService();