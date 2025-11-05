// src/index.ts
import { app, initializeApp } from "./app"; // Menggunakan import ES Module
import config from "./config"; // Mengimpor konfigurasi (akan kita buat di langkah 3)

/**
 * Fungsi asinkron untuk memulai server setelah inisialisasi selesai.
 */
const startServer = async () => {
  try {
    // 1. Jalankan inisialisasi (Database & MinIO)
    await initializeApp();
    console.log("Application initialization complete.");

    // 2. Mulai server Express
    const port = config.port;
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Access API root at http://localhost:${port}/`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// --- Jalankan Fungsi startServer ---
startServer();