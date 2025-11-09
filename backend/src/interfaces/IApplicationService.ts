// src/interfaces/IApplicationService.ts
import { CvApplication } from "../models";
import { Stream } from "stream"; 

export interface ApplicationCreationDTO {
  fullName: string;
  email: string;
  appliedPositionId: string; 
  agreeTerms: boolean;
}

export interface N8nResultDTO {
  similarity_score: number;
  passed_hard_gate: boolean;
  qualitative_assessment: object;
  cv_data: object;
  requirement_data: object;
}

export interface RankFiltersDTO {
  searchTerm?: string;
  statusFilter?: string;
  qualificationFilter?: string;
  dateFilter?: string;
}

export interface DownloadFileStream {
  fileStream: Stream;
  fileName: string;
  contentType: string;
}

// --- 1. TAMBAHKAN TIPE DATA BARU INI ---
/**
 * Tipe DTO untuk update status (termasuk preferensi interview)
 */
export interface ApplicationStatusUpdateDTO {
  status?: string;
  interview_notes?: {
    preference?: 'Online' | 'Offline';
    scheduled_by?: string;
    schedule_link?: string;
    schedule_time?: Date;
    feedback?: string;
  };
}
// --- BATAS TAMBAHAN ---


/**
 * Interface (Kontrak) untuk ApplicationService.
 */
export interface IApplicationService {
  createApplication(
    applicationData: ApplicationCreationDTO,
    cvFile: Express.Multer.File
  ): Promise<CvApplication>;

  getAllApplications(): Promise<CvApplication[]>;
  getApplicationById(applicationId: number): Promise<CvApplication | null>;
  deleteApplication(applicationId: number): Promise<{ success: true; message: string }>;
  downloadCvFile(applicationId: number): Promise<DownloadFileStream>;

  // --- 2. UBAH TANDA (SIGNATURE) FUNGSI INI ---
  updateApplicationStatus(
    applicationId: number,
    updateData: ApplicationStatusUpdateDTO // <-- Ganti dari 'string' ke DTO
  ): Promise<CvApplication>;
  // --- BATAS PERUBAHAN ---

  saveAutomatedAnalysisResult(
    applicationId: number,
    n8nResult: N8nResultDTO
  ): Promise<CvApplication | null>;
  
  getAllArchivedApplications(): Promise<CvApplication[]>;
  archiveApplications(applicationIds: number[]): Promise<{ success: boolean; count: number; message: string }>;
  unarchiveApplications(applicationIds: number[]): Promise<{ success: boolean; count: number; message: string }>;
  bulkDeleteActiveApplications(applicationIds: number[]): Promise<{ success: boolean; count: number; message: string }>;
  bulkDownloadCvFiles(applicationIds: number[]): Promise<{ zipBuffer: Buffer; fileName: string }>;
  getDashboardSummaryStats(): Promise<object>;
  getStatusDistribution(): Promise<object>;
  getWeeklySubmissionTrend(): Promise<object[]>;
  getRecentApplications(limit?: number): Promise<CvApplication[]>;
  getRankedApplications(
    filters?: RankFiltersDTO,
    limit?: number
  ): Promise<CvApplication[]>;
}