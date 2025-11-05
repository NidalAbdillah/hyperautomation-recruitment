// src/controllers/dashboard.controller.ts
import { Request, Response, NextFunction } from "express"; // <-- 1. Impor Tipe Express
import applicationService from "../services/application.service"; // <-- 2. Ubah ke import

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any) => { // <-- 3. Tambahkan Tipe
  const statusCode = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  console.error(
    `Controller Error: Status ${statusCode}, Message: ${message}`,
    error
  );
  res.status(statusCode).json({ message });
};

/**
 * Mengambil data statistik ringkasan untuk kartu di dashboard.
 */
const getDashboardSummaryStats = async (req: Request, res: Response) => { // <-- 4. Tambahkan Tipe
  console.log("Controller: Received request for dashboard summary stats.");
  try {
    const stats = await applicationService.getDashboardSummaryStats();
    res.status(200).json(stats);
  } catch (error: any) { // <-- 5. Tambahkan Tipe
    handleErrorResponse(res, error);
  }
};

/**
 * Mengambil data untuk chart (Distribusi Status & Tren Mingguan).
 */
const getDashboardChartData = async (req: Request, res: Response) => {
  console.log("Controller: Received request for dashboard chart data.");
  try {
    const statusDistribution = await applicationService.getStatusDistribution();
    const weeklySubmissionTrend =
      await applicationService.getWeeklySubmissionTrend();

    const chartData = {
      statusDistribution,
      weeklySubmissionTrend,
    };

    res.status(200).json(chartData);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

/**
 * Mengambil aplikasi terbaru untuk tabel di dashboard.
 */
const getRecentApplications = async (req: Request, res: Response) => {
  console.log("Controller: Received request for recent applications.");
  try {
    // 6. Beri tipe pada req.query
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

    if (isNaN(limit) || limit <= 0) {
      const error: any = new Error(
        "Invalid limit parameter. Must be a positive number."
      );
      error.status = 400;
      return handleErrorResponse(res, error);
    }

    const recentApplications = await applicationService.getRecentApplications(
      limit
    );

    res.status(200).json(recentApplications);
  } catch (error: any) {
    handleErrorResponse(res, error);
  }
};

// 7. Ubah ke ES Module export
export {
  getDashboardSummaryStats,
  getDashboardChartData,
  getRecentApplications,
};