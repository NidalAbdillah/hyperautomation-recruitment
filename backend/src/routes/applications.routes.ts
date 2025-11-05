// src/routes/applications.routes.ts
import express, { Router, Request } from "express";
import multer from "multer";
// Impor controller (TS)
import {
  submitApplication,
  getAllApplications,
  getRankedApplicationsController,
  getArchivedApplications,
  archiveApplicationsController,
  unarchiveApplicationsController,
  bulkDeleteActiveController,
  bulkDownloadController,
  getApplicationById,
  deleteApplication,
  downloadCvFile,
  viewCvFile,
  updateApplicationStatus,
  handleN8nResult,
} from "../controllers/applications.controller";

// Konfigurasi Multer
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error: any = new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed.");
    error.code = "LIMIT_FILE_TYPE";
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

const publicRouter: Router = express.Router();
const adminRouter: Router = express.Router();

// --- Rute Publik ---
publicRouter.post("/", upload.single("cv_file"), submitApplication);

// --- Rute Admin ---
adminRouter.get("/", getAllApplications);
adminRouter.get("/ranking", getRankedApplicationsController);
adminRouter.get("/archived", getArchivedApplications);
adminRouter.put("/archive", archiveApplicationsController);
adminRouter.put("/unarchive", unarchiveApplicationsController);
adminRouter.post("/bulk-delete-active", bulkDeleteActiveController);
adminRouter.post("/bulk-download", bulkDownloadController);
adminRouter.get("/:id", getApplicationById);
adminRouter.delete("/:id", deleteApplication);
adminRouter.get("/:id/download-cv", downloadCvFile);
adminRouter.get("/:id/view-cv", viewCvFile);
adminRouter.put("/:id/status", updateApplicationStatus);
adminRouter.post("/:id/process-result", handleN8nResult);

// Export kedua router
export {
  publicRouter,
  adminRouter,
};