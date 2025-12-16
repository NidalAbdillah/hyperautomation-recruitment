// src/controllers/dashboard.controller.ts
import { Request, Response } from "express";
import applicationService from "../services/application.service";
import { JobPosition } from "../models";

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any) => {
  const statusCode = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  console.error(
    `[Dashboard Controller Error] Status ${statusCode}, Message: ${message}`,
    error
  );
  res.status(statusCode).json({ message });
};

/**
 * GET /api/hr/dashboard/summary
 * Mengambil data statistik ringkasan untuk kartu di dashboard.
 */
export const getDashboardSummaryStats = async (req: Request, res: Response) => {
  console.log("[Dashboard Controller] Fetching summary stats...");
  try {
    const stats = await applicationService.getDashboardSummaryStats();
    res.status(200).json(stats);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

/**
 * GET /api/hr/dashboard/charts
 * ✅ INI YANG PALING PENTING - LENGKAP DENGAN JOB DISTRIBUTION!
 * Mengambil data untuk semua chart (Job Distribution, Status Distribution, Weekly Trend).
 */
export const getDashboardChartData = async (req: Request, res: Response) => {
  console.log("[Dashboard Controller] Fetching chart data...");
  try {
    // 1. Get Job Position Distribution (BREAKDOWN PER STATUS)
    const jobDistribution = await getJobPositionDistribution();
    
    // 2. Get Application Status Distribution
    const statusDistribution = await applicationService.getStatusDistribution();
    
    // 3. Get Weekly Submission Trend
    const weeklySubmissionTrend = await applicationService.getWeeklySubmissionTrend();

    const chartData = {
      jobDistribution,        // ✅ DITAMBAHKAN INI!
      statusDistribution,
      weeklySubmissionTrend,
    };

    console.log("[Dashboard Controller] Chart data fetched successfully:", {
      jobDistributionKeys: Object.keys(jobDistribution),
      statusDistributionKeys: Object.keys(statusDistribution),
      weeklyTrendLength: weeklySubmissionTrend.length,
    });

    res.status(200).json(chartData);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

/**
 * GET /api/hr/dashboard/recent-applications?limit=5
 * Mengambil aplikasi terbaru untuk tabel di dashboard.
 */
export const getRecentApplications = async (req: Request, res: Response) => {
  console.log("[Dashboard Controller] Fetching recent applications...");
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

    if (isNaN(limit) || limit <= 0) {
      const error: any = new Error(
        "Invalid limit parameter. Must be a positive number."
      );
      error.status = 400;
      return handleErrorResponse(res, error);
    }

    const recentApplications = await applicationService.getRecentApplications(limit);

    console.log(`[Dashboard Controller] Fetched ${recentApplications.length} recent applications.`);
    res.status(200).json(recentApplications);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// ==========================================
// ✅ HELPER FUNCTION: GET JOB DISTRIBUTION
// ==========================================
/**
 * Internal helper untuk menghitung breakdown job position per status.
 * Mengembalikan object dengan key UPPERCASE (DRAFT, APPROVED, OPEN, CLOSED, REJECTED).
 */
async function getJobPositionDistribution(): Promise<{
  DRAFT: number;
  APPROVED: number;
  OPEN: number;
  CLOSED: number;
  REJECTED: number;
}> {
  console.log("[Dashboard Helper] Calculating job position distribution...");
  try {
    // Hitung semua status job position yang TIDAK diarsip
    const [draftCount, approvedCount, openCount, closedCount, rejectedCount] = 
      await Promise.all([
        JobPosition.count({ where: { status: "DRAFT", isArchived: false } }),
        JobPosition.count({ where: { status: "APPROVED", isArchived: false } }),
        JobPosition.count({ where: { status: "OPEN", isArchived: false } }),
        JobPosition.count({ where: { status: "CLOSED", isArchived: false } }),
        JobPosition.count({ where: { status: "REJECTED", isArchived: false } }),
      ]);

    const distribution = {
      DRAFT: draftCount,
      APPROVED: approvedCount,
      OPEN: openCount,
      CLOSED: closedCount,
      REJECTED: rejectedCount,
    };

    console.log("[Dashboard Helper] Job distribution calculated:", distribution);
    return distribution;

  } catch (error: any) {
    console.error("[Dashboard Helper] Error calculating job distribution:", error);
    throw new Error(`Failed to calculate job distribution: ${error.message}`);
  }
}