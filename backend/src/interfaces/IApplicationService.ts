// src/interfaces/IApplicationService.ts
import { CvApplication } from "../models";
import { Stream } from "stream"; // Untuk tipe data file download

/**
 * Tipe Data Transfer Object (DTO) untuk aplikasi baru.
 */
export interface ApplicationCreationDTO {
  fullName: string;
  email: string;
  appliedPositionId: string; // ID dari form
  agreeTerms: boolean;
}

/**
 * Tipe Data Transfer Object (DTO) untuk hasil dari N8N.
 */
export interface N8nResultDTO {
  similarity_score: number;
  passed_hard_gate: boolean;
  qualitative_assessment: object;
  cv_data: object;
  requirement_data: object;
}

/**
 * Tipe Data Transfer Object (DTO) untuk filter di Dashboard.
 */
export interface RankFiltersDTO {
  searchTerm?: string;
  statusFilter?: string;
  qualificationFilter?: string;
  dateFilter?: string;
}

/**
 * Tipe data untuk file yang akan di-download (stream).
 */
export interface DownloadFileStream {
  fileStream: Stream;
  fileName: string;
  contentType: string;
}

/**
 * Interface (Kontrak) untuk ApplicationService.
 * Ini adalah blueprint yang akan Anda gunakan untuk membuat Diagram Kelas di Bab IV.
 */
export interface IApplicationService {
  /**
   * Membuat aplikasi baru, mengunggah CV, dan memicu webhook N8N.
   */
  createApplication(
    applicationData: ApplicationCreationDTO,
    cvFile: Express.Multer.File // Tipe file dari Multer/Express
  ): Promise<CvApplication>;

  /**
   * Mengambil semua aplikasi yang aktif (tidak diarsip).
   */
  getAllApplications(): Promise<CvApplication[]>;

  /**
   * Mengambil satu aplikasi berdasarkan ID.
   */
  getApplicationById(applicationId: number): Promise<CvApplication | null>;

  /**
   * Menghapus satu aplikasi dan file CV terkait di MinIO.
   */
  deleteApplication(applicationId: number): Promise<{ success: true; message: string }>;

  /**
   * Mengambil stream file CV dari MinIO untuk diunduh/dilihat.
   */
  downloadCvFile(applicationId: number): Promise<DownloadFileStream>;

  /**
   * Memperbarui status aplikasi secara manual (oleh admin/HR).
   */
  updateApplicationStatus(
    applicationId: number,
    newStatus: string
  ): Promise<CvApplication>;

  /**
   * Menyimpan hasil analisis otomatis dari N8N ke database.
   */
  saveAutomatedAnalysisResult(
    applicationId: number,
    n8nResult: N8nResultDTO
  ): Promise<CvApplication | null>;

  /**
   * Mengambil semua aplikasi yang telah diarsip.
   */
  getAllArchivedApplications(): Promise<CvApplication[]>;

  /**
   * Mengarsipkan aplikasi (bulk).
   */
  archiveApplications(applicationIds: number[]): Promise<{ success: boolean; count: number; message: string }>;

  /**
   * Mengembalikan aplikasi dari arsip (bulk).
   */
  unarchiveApplications(applicationIds: number[]): Promise<{ success: boolean; count: number; message: string }>;

  /**
   * Menghapus permanen aplikasi aktif (bulk).
   */
  bulkDeleteActiveApplications(applicationIds: number[]): Promise<{ success: boolean; count: number; message: string }>;

  /**
   * Mengunduh beberapa file CV sebagai satu file ZIP.
   */
  bulkDownloadCvFiles(applicationIds: number[]): Promise<{ zipBuffer: Buffer; fileName: string }>;

  /**
   * Mengambil statistik ringkasan untuk dashboard.
   */
  getDashboardSummaryStats(): Promise<object>;

  /**
   * Mengambil data distribusi status aplikasi untuk chart.
   */
  getStatusDistribution(): Promise<object>;

  /**
   * Mengambil data tren pengiriman CV selama 7 hari terakhir.
   */
  getWeeklySubmissionTrend(): Promise<object[]>;

  /**
   * Mengambil aplikasi terbaru.
   */
  getRecentApplications(limit?: number): Promise<CvApplication[]>;

  /**
   * Mengambil aplikasi yang sudah di-ranking berdasarkan skor AI.
   */
  getRankedApplications(
    filters?: RankFiltersDTO,
    limit?: number
  ): Promise<CvApplication[]>;
}