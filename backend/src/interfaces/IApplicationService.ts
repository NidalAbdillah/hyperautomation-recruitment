// src/interfaces/IApplicationService.ts
import { CvApplication } from "../models";
import { Stream } from "stream"; 

// Semua DTO: Data Transfer Object atau kontrak utama antara Controller dan Service,
// Semua atribut yang diperlukan untuk operasi aplikasi sesuai dengan yang ada di model.
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

// Interface utama yang mendefinisikan kontrak fungsi-fungsi di ApplicationService.
export interface IApplicationService {
  // Fungsi untuk membuat aplikasi baru dengan data sesuai DTO di atas dan file CV.
  createApplication(
    applicationData: ApplicationCreationDTO,
    cvFile: Express.Multer.File
  ): Promise<CvApplication>;

  // semua fungsi utama pada service aplikasi yang digunakan di controller terkait cv dan aplikasi,
  // promise karena operasinya await dari database atau penyimpanan file
  getAllApplications(): Promise<CvApplication[]>;
  getApplicationById(applicationId: number): Promise<CvApplication | null>;
  deleteApplication(applicationId: number): Promise<{ success: true; message: string}>;
  downloadCvFile(applicationId: number): Promise<DownloadFileStream>;
  updateApplicationStatus(
    applicationId: number,
    updateData: ApplicationStatusUpdateDTO // gunakan DTO sesuai kontrak di atas
  ): Promise<CvApplication>;
  saveAutomatedAnalysisResult(
    applicationId: number,
    n8nResult: N8nResultDTO
  ): Promise<CvApplication | null>;
  
  // semua fungsi pada service aplikasi terkait arsip dan statistik, dan promise karena await ke cvApplication database
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
    filters?: RankFiltersDTO, // gunakan DTO filter sesuai kontrak di atas
    limit?: number
  ): Promise<CvApplication[]>;
}