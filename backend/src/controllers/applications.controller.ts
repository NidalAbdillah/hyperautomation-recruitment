// src/controllers/applications.controller.ts
import { Request, Response, NextFunction } from "express";
import applicationService from "../services/application.service";
import { ValidationError } from "sequelize";
import {
  ApplicationCreationDTO,
  N8nResultDTO,
  RankFiltersDTO,
  ApplicationStatusUpdateDTO,
} from "../interfaces/IApplicationService";
import { Stream } from "stream";

// ini untuk memetakan field error dari DB ke field yang dipahami Frontend
const validationErrorFieldMap: { [key: string]: string } = {
  fullName: "fullName",
  email: "email",
  qualification: "selectedPosition",
  agreeTerms: "agreeTerms",
  cvFileObjectKey: "cv_file",
};
// untuk menangkap error secara konsisten di semua controller
// res: respone sebagai parameter untuk mengirim response error dari service atau controller
// error: any karena bisa berupa error custom dengan properti status dan message, atau error dari library seperti Sequelize yang memiliki struktur berbeda
const handleErrorResponse = (res: Response, error: any) => {
  // statuscode default 500 untuk error tak terduga, message default untuk menjaga konsistensi response error
  const statusCode = error.status || 500;
  // message default untuk menjaga konsistensi response error
  const message = error.message || "An unexpected error occurred.";
  // ini dinamis sesuai error yang diterima, bisa error custom atau error dari library
  console.error(`Controller Error: Status ${statusCode}, Message: ${message}`, error.stack);
  
  // erorr dari sequelize saat validasi karena duplicate atau format salah, kita map field errornya ke field yang dipahami frontend agar lebih user-friendly
  if (error instanceof ValidationError) {
    const errors: { [key: string]: string[] } = {};
    // Pemetaan field error dari DB ke Frontend
    error.errors.forEach((err: any) => {
      const dbField: string = err.path;
      const frontendField: string = validationErrorFieldMap[dbField] || dbField; // Gunakan map

      if (!errors[frontendField]) errors[frontendField] = [];
      errors[frontendField].push(err.message);
    });
    return res.status(400).json({ message: "Validation failed.", errors });
  }
  if (!res.headersSent) {
    res.status(statusCode).json({ message });
  }
};

// untuk submit aplikasi baru
const submitApplication = async (req: Request, res: Response) => {
  console.log("Controller: submitApplication started.");
  try {
    const body = req.body as any;
    const errors: { [key: string]: string } = {};
    if (!body.fullName) errors.fullName = "Nama Lengkap wajib diisi.";
    if (!body.email) errors.email = "Email wajib diisi.";
    if (!body.appliedPositionId) errors.appliedPositionId = "Posisi Tersedia wajib dipilih.";
    if (body.agreeTerms !== 'true' && body.agreeTerms !== true) {
        errors.agreeTerms = "Anda harus menyetujui Syarat dan Ketentuan.";
    }
    if (!req.file) errors.cv_file = "CV wajib diupload.";
    if (Object.keys(errors).length > 0) {
      console.log("Controller: Basic validation failed.", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

// untuk DTO agar service tidak tergantung req/res cukup pakai applicationData dan gunakan DTO dari interface agar sesuai kontrak
    const applicationData: ApplicationCreationDTO = {
      fullName: body.fullName,
      email: body.email,
      appliedPositionId: body.appliedPositionId,
      agreeTerms: true,
    };
    // multer file untuk CV
    const cvFile = req.file!; 
    console.log("Controller: Calling service with data:", {
      fullName: applicationData.fullName,
      email: applicationData.email,
      appliedPositionId: applicationData.appliedPositionId,
    });

    // panggil service untuk buat aplikasi dan await sampe selesai
    const newApplication = await applicationService.createApplication(applicationData, cvFile);
    console.log("Controller: Application created successfully, ID:", newApplication.id);
    // balas ke frontend
    return res.status(201).json({
      success: true,
      message: "Application submitted successfully. We will contact you soon.",
      data: newApplication,
    });

  // jika error
  } catch (error: any) {
    console.error(`Controller Error: Status ${error.status || 500}, Message: ${error.message}`, error);
    const statusCode = error.status || 500;
    const message = error.message || "Internal server error";
    // erorr saat validasi dari ORM Sequelize karena duplicate atau format salah
    return res.status(statusCode).json({
      success: false,
      message: message,
      errors: (error as any).errors || null,
    });
  }
};

// untuk get all aplikasi yang belum di archive untuk aplikasi yang aktif
const getAllApplications = async (req: Request, res: Response) => {
  console.log("Controller: Request for all non-archived applications.");
  try {
    // panggil service dan await hasilnya
    const applications = await applicationService.getAllApplications();
    res.status(200).json(applications);
  } catch (error: any) {
    // tanggkap erorr dan kirim response error yang konsisten
    handleErrorResponse(res, error);
  }
};

// untuk get aplikasi berdasarkan ID
const getApplicationById = async (req: Request, res: Response) => {
  try {
    // validasi bahwa ID adalah angka
    const applicationId = parseInt(req.params.id, 10);
    // jika id bukan angka kirim 400(input tidak valid)
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    // panggil service dan await hasilnya, 200 (OK) jika berhasil
    const application = await applicationService.getApplicationById(applicationId);
    res.status(200).json(application);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// hapus aplikasi berdasarkan id
const deleteApplication = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    const result = await applicationService.deleteApplication(applicationId);
    res.status(200).json(result);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// untuk download file CV berdasarkan ID aplikasi
const downloadCvFile = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    // panggil service untuk download file CV, file stream untuk cicil data agar tidak overload memory
    const { fileStream, fileName, contentType } = await applicationService.downloadCvFile(applicationId);
    // set header agar browser tahu ini file download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    // set content type sesuai file
    res.setHeader("Content-Type", contentType);
    // pipe stream ke response agar data dikirim secara bertahap
    fileStream.pipe(res);
    // tangkap error pada stream
    fileStream.on("error", (streamError: any) => {
        if (!res.headersSent) handleErrorResponse(res, streamError);
    });
  } catch (error: any) {
    if (!res.headersSent) handleErrorResponse(res, error);
  }
};

// untuk melihat file CV di browser berdasarkan ID aplikasi
const viewCvFile = async (req: Request, res: Response) => {
   try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    // bedanya di sini tidak ada header content-disposition attachment untuk download
    const { fileStream, contentType } = await applicationService.downloadCvFile(applicationId);
    res.setHeader("Content-Type", contentType);
    fileStream.pipe(res);
     fileStream.on("error", (streamError: any) => {
        if (!res.headersSent) handleErrorResponse(res, streamError);
    });
  } catch (error: any) {
    if (!res.headersSent) handleErrorResponse(res, error);
  }
};

// untuk update status aplikasi berdasarkan ID
const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    // gunakan DTO untuk validasi dan kontrak data
    const updateData = req.body as ApplicationStatusUpdateDTO; 
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    // validasi bahwa setidaknya ada satu field yang diupdate, yaitu status atau interview_notes, jika tidak ada kirim 400 (input tidak valid)
    if (!updateData || Object.keys(updateData).length === 0) { 
        const err: any = new Error("Update data is required (e.g., status or interview_notes)."); 
        err.status = 400; 
        throw err; 
    }
    // panggil service, dan await hasilnya untuk update
    const updatedApplication = await applicationService.updateApplicationStatus(
      applicationId, 
      updateData // Kirim objek utuh
    );
    res.status(200).json({ message: "Application status updated.", application: updatedApplication });
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// untuk menerima hasil analisis otomatis dari n8n dan menyimpan ke database berdasarkan ID aplikasi
const handleN8nResult = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    // gunakan DTO sesuai kontrak data yang dikirim n8n
    const n8nResult = req.body as N8nResultDTO;
    console.log(`Controller: Received N8N result for Application ID: ${applicationId}`);
    
    // panggil service untuk simpan hasil analisis otomatis dari n8n ke database, dan await hasilnya
    const updatedApplication = await applicationService.saveAutomatedAnalysisResult(applicationId, n8nResult);
    if (!updatedApplication) {
      const error: any = new Error(`Application with ID ${applicationId} not found.`);
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Application analysis results saved successfully.' });
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// get yang udah di arsip
const getArchivedApplications = async (req: Request, res: Response) => {
  try {
    const applications = await applicationService.getAllArchivedApplications();
    res.status(200).json(applications);
  } catch (error: any) { handleErrorResponse(res, error); }
};

// untuk aksi archive banyak sekaligus
const archiveApplicationsController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
        const err: any = new Error("Array of application IDs required."); err.status = 400; throw err;
    }
    const result = await applicationService.archiveApplications(ids);
    res.status(200).json({ message: result.message, count: result.count });
  } catch (error: any) { handleErrorResponse(res, error); }
};

// untuk aksi unarchive banyak sekaligus
const unarchiveApplicationsController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
        const err: any = new Error("Array of application IDs required."); err.status = 400; throw err;
    }
    const result = await applicationService.unarchiveApplications(ids);
    res.status(200).json({ message: result.message, count: result.count });
  } catch (error: any) { handleErrorResponse(res, error); }
};

// untuk aksi hapus banyak aplikasi aktif sekaligus
const bulkDeleteActiveController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      const error: any = new Error("Array of application IDs required.");
      error.status = 400;
      throw error;
    }
    console.log(`Controller: Requesting bulk delete for ACTIVE IDs: ${ids.join(', ')}`);
    const result = await applicationService.bulkDeleteActiveApplications(ids);
    res.status(200).json({ message: result.message, count: result.count });
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

//untuk download banyak file CV sekaligus dalam bentuk ZIP
const bulkDownloadController = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body as { ids: number[] };
        if (!Array.isArray(ids) || ids.length === 0) {
            const error: any = new Error("Array of application IDs required.");
            error.status = 400;
            throw error;
        }
        console.log(`Controller: Requesting bulk download for IDs: ${ids.join(', ')}`);
        const { zipBuffer, fileName } = await applicationService.bulkDownloadCvFiles(ids);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/zip');
        res.send(zipBuffer);
    } catch (error: any) {
        if (!res.headersSent) {
            handleErrorResponse(res, error);
        }
    }
};


// untuk trigger jadwal interview via n8n berdasarkan ID aplikasi
const triggerSchedule = async (req: Request, res: Response) => {
  try {
    // ambil ID aplikasi dari parameter URL
    const applicationId = parseInt(req.params.id, 10);
    // ambil data jadwal dari body request, pastikan ada field yang diperlukan seperti dateTime, endTime, type (manager/final_hr), dan preference (online/offline)
    const scheduleData = req.body;
    const hrUser = (req as any).user;

    if (isNaN(applicationId)) {
      const err: any = new Error("Invalid application ID."); err.status = 400; throw err;
    }
    // validasi bahwa field yang diperlukan ada, jika tidak kirim 400 (input tidak valid)
    if (!scheduleData.type) {
        const err: any = new Error("Interview type (manager/final_hr) is required."); 
        err.status = 400; 
        throw err;
    }
    // validasi bahwa type harus manager atau final_hr, jika tidak kirim 400 (input tidak valid)
    if (!scheduleData.dateTime || !scheduleData.endTime) {
      const err: any = new Error("dateTime and endTime are required."); err.status = 400; throw err;
    }
    // validasi bahwa dateTime dan endTime harus berupa tanggal yang valid, jika tidak kirim 400 (input tidak valid)
    if (!hrUser) {
      const err: any = new Error("HR User not authenticated."); err.status = 401; throw err;
    }
    console.log(`Controller: Triggering schedule ${scheduleData.type} for App ID ${applicationId}`);
    
    // panggil service untuk trigger jadwal interview via n8n, dan await hasilnya untuk update aplikasi dengan data jadwal yang baru
    const updatedApplication = await applicationService.triggerScheduleWorkflow(
      applicationId,
      scheduleData,
      hrUser
    );

    res.status(200).json({
      message: `Schedule triggered for ${scheduleData.type}.`,
      application: updatedApplication,
    });

  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// untuk mendapatkan daftar aplikasi yang sudah diurutkan berdasarkan skor AI dan filter lainnya sesuai query params
const getRankedApplicationsController = async (req: Request, res: Response) => {
  console.log("Controller: Request for ranked applications received.");
  try {
    const filters: RankFiltersDTO = {
      searchTerm: req.query.search as string | undefined,
      statusFilter: req.query.status as string | undefined,
      qualificationFilter: req.query.qualification as string | undefined,
      dateFilter: req.query.date as string | undefined,
    };
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const applications = await applicationService.getRankedApplications(filters, limit);
    res.status(200).json(applications);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

export {
  submitApplication,
  getAllApplications,
  getApplicationById,
  deleteApplication,
  downloadCvFile,
  viewCvFile,
  updateApplicationStatus,
  handleN8nResult,
  getArchivedApplications,
  archiveApplicationsController,
  unarchiveApplicationsController,
  bulkDeleteActiveController,
  bulkDownloadController,
  getRankedApplicationsController,
  triggerSchedule,
};