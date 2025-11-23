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
import { Stream } from "stream"; // Pastikan Stream diimpor

// --- PERBAIKAN 1: Definisikan Error Map di luar ---
/**
 * Peta untuk mengubah nama field error dari database ke frontend.
 */
const validationErrorFieldMap: { [key: string]: string } = {
  fullName: "fullName",
  email: "email",
  qualification: "selectedPosition",
  agreeTerms: "agreeTerms",
  cvFileObjectKey: "cv_file",
};
// --- BATAS PERBAIKAN 1 ---

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any) => {
  const statusCode = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  console.error(`Controller Error: Status ${statusCode}, Message: ${message}`, error.stack);
  
  if (error instanceof ValidationError) {
    const errors: { [key: string]: string[] } = {};
    
    // PERBAIKAN 2: Gunakan map yang aman
    error.errors.forEach((err: any) => {
      const dbField: string = err.path; // Jadikan string
      const frontendField: string = validationErrorFieldMap[dbField] || dbField; // Gunakan map

      if (!errors[frontendField]) errors[frontendField] = [];
      errors[frontendField].push(err.message);
    });
    // --- BATAS PERBAIKAN 2 ---

    return res.status(400).json({ message: "Validation failed.", errors });
  }
  if (!res.headersSent) {
    res.status(statusCode).json({ message });
  }
};

// --- Core Application Flow ---

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

    const applicationData: ApplicationCreationDTO = {
      fullName: body.fullName,
      email: body.email,
      appliedPositionId: body.appliedPositionId,
      agreeTerms: true,
    };

    const cvFile = req.file!; 

    console.log("Controller: Calling service with data:", {
      fullName: applicationData.fullName,
      email: applicationData.email,
      appliedPositionId: applicationData.appliedPositionId,
    });

    const newApplication = await applicationService.createApplication(applicationData, cvFile);

    console.log("Controller: Application created successfully, ID:", newApplication.id);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully. We will contact you soon.",
      data: newApplication,
    });

  } catch (error: any) {
    console.error(`Controller Error: Status ${error.status || 500}, Message: ${error.message}`, error);

    const statusCode = error.status || 500;
    const message = error.message || "Internal server error";

    return res.status(statusCode).json({
      success: false,
      message: message,
      errors: (error as any).errors || null,
    });
  }
};

const getAllApplications = async (req: Request, res: Response) => {
  console.log("Controller: Request for all non-archived applications.");
  try {
    const applications = await applicationService.getAllApplications();
    res.status(200).json(applications);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

const getApplicationById = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    const application = await applicationService.getApplicationById(applicationId);
    res.status(200).json(application);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

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

const downloadCvFile = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    const { fileStream, fileName, contentType } = await applicationService.downloadCvFile(applicationId);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", contentType);
    fileStream.pipe(res);
    fileStream.on("error", (streamError: any) => {
        if (!res.headersSent) handleErrorResponse(res, streamError);
    });
  } catch (error: any) {
    if (!res.headersSent) handleErrorResponse(res, error);
  }
};

const viewCvFile = async (req: Request, res: Response) => {
   try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
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

const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    
    // --- INI PERBAIKANNYA ---
    // 1. Ambil seluruh body sebagai DTO
    const updateData = req.body as ApplicationStatusUpdateDTO; 
    
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    
    // 2. Validasi bahwa body tidak kosong
    if (!updateData || Object.keys(updateData).length === 0) { 
        const err: any = new Error("Update data is required (e.g., status or interview_notes)."); 
        err.status = 400; 
        throw err; 
    }

    // 3. Kirim seluruh objek 'updateData' ke service, bukan hanya string 'status'
    const updatedApplication = await applicationService.updateApplicationStatus(
      applicationId, 
      updateData // <-- Kirim objek utuh
    );
    // --- BATAS PERBAIKAN ---

    res.status(200).json({ message: "Application status updated.", application: updatedApplication });
  
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// --- Automation & Bulk Actions ---

const handleN8nResult = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) { 
        const err: any = new Error("Invalid application ID."); err.status = 400; throw err; 
    }
    const n8nResult = req.body as N8nResultDTO;
    console.log(`Controller: Received N8N result for Application ID: ${applicationId}`);
    
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

const getArchivedApplications = async (req: Request, res: Response) => {
  try {
    const applications = await applicationService.getAllArchivedApplications();
    res.status(200).json(applications);
  } catch (error: any) { handleErrorResponse(res, error); }
};

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

// src/controllers/applications.controller.ts

const triggerSchedule = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const scheduleData = req.body; // { dateTime, endTime, notes_from_hr, type, preference }
    const hrUser = (req as any).user; // Pastikan user ada

    if (isNaN(applicationId)) {
      const err: any = new Error("Invalid application ID."); err.status = 400; throw err;
    }
    
    // --- 🔥 TAMBAHAN VALIDASI ---
    // Pastikan 'type' ada agar Service tidak salah langkah
    if (!scheduleData.type) {
        const err: any = new Error("Interview type (manager/final_hr) is required."); 
        err.status = 400; 
        throw err;
    }

    if (!scheduleData.dateTime || !scheduleData.endTime) {
      const err: any = new Error("dateTime and endTime are required."); err.status = 400; throw err;
    }
    
    if (!hrUser) {
      const err: any = new Error("HR User not authenticated."); err.status = 401; throw err;
    }

    console.log(`Controller: Triggering schedule ${scheduleData.type} for App ID ${applicationId}`);

    // Panggil Service
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