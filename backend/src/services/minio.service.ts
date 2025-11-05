// src/services/minio.service.ts
import { Client } from "minio";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import config from "../config";
import { IMinioService } from "../interfaces/IMinioService";
import { Stream } from "stream";

// Tipe data untuk info file yang di-upload
interface UploadedFileInfo {
  objectName: string;
  fileName: string;
  etag: string;
}

/**
 * Service class untuk mengelola semua interaksi dengan MinIO Object Storage.
 * @class MinioService
 * @implements {IMinioService}
 */
class MinioService implements IMinioService {
  private minioClient: Client;
  private bucketName: string;
  private FOLDER_PREFIXES: { CVS: string; AVATARS: string };

  constructor() {
    if (
      !config.minio.endpoint ||
      !config.minio.accessKey ||
      !config.minio.secretKey ||
      !config.minio.bucketName
    ) {
      throw new Error("MinIO configuration is missing in .env file.");
    }

    this.minioClient = new Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });

    this.bucketName = config.minio.bucketName;
    this.FOLDER_PREFIXES = {
      CVS: "CVs/",
      AVATARS: "avatars/",
    };
    console.log("MinioService instantiated.");
  }

  public async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(
          this.bucketName,
          (config as any).minio.region || "us-east-1"
        );
        console.log(`MinIO Bucket "${this.bucketName}" created successfully.`);
      } else {
        console.log(`MinIO Bucket "${this.bucketName}" already exists.`);
      }
    } catch (error: any) {
      console.error(
        `Error ensuring MinIO bucket "${this.bucketName}" exists:`,
        error
      );
      throw error;
    }
  }

  /**
   * Fungsi internal untuk mengunggah file buffer ke MinIO.
   * @private
   */
  private async _uploadFileInternal(
    fileBuffer: Buffer,
    objectName: string,
    mimetype: string,
    originalName: string
  ): Promise<UploadedFileInfo> {
    const metaData = {
      "Content-Type": mimetype,
      "X-Amz-Meta-Original-Name": Buffer.from(originalName).toString("ascii"),
    };
    try {
    const uploadInfo = await this.minioClient.putObject( // <-- GANTI NAMA
      this.bucketName,
      objectName,
      fileBuffer,
      fileBuffer.length,
      metaData
    );
    console.log(`File uploaded to MinIO: ${objectName}, ETag: ${uploadInfo.etag}`); // <-- AMBIL .etag
    return { objectName: objectName, fileName: originalName, etag: uploadInfo.etag }; // <-- PERBAIKAN DI SINI
  } catch (error: any) {
      console.error(`Error uploading file ${objectName} to MinIO:`, error);
      const uploadError: any = new Error(
        `Failed to upload file to storage: ${error.message}`
      );
      uploadError.cause = "MinioUploadError";
      throw uploadError;
    }
  }

  /**
   * Fungsi internal untuk mendapatkan readable stream file dari MinIO.
   * @private
   */
  private async _downloadFileInternal(objectName: string): Promise<Stream | undefined> {
    if (!objectName) {
      const error: any = new Error("Object name required for download.");
      error.cause = "MinioInternalError";
      throw error;
    }
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      const fileStream = await this.minioClient.getObject(
        this.bucketName,
        objectName
      );
      console.log(`Stream retrieved from MinIO: ${objectName}`);
      return fileStream;
    } catch (error: any) {
      console.error(
        `Error downloading file stream ${objectName} from MinIO:`,
        error
      );
      let downloadError: any;
      if (error.code === "NotFound" || error.code === "NoSuchKey") {
        downloadError = new Error(`File not found in storage: ${objectName}`);
        downloadError.status = 404;
      } else {
        downloadError = new Error(
          `Failed to retrieve file stream: ${error.message}`
        );
        downloadError.status = 500;
      }
      throw downloadError;
    }
  }

  /**
   * Fungsi internal untuk menghapus objek dari MinIO.
   * @private
   */
  private async _deleteFileInternal(objectName: string): Promise<boolean> {
    if (!objectName) {
      const error: any = new Error("Object name required for delete.");
      error.cause = "MinioInternalError";
      throw error;
    }
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      console.log(`File deleted from MinIO: ${objectName}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting file ${objectName} from MinIO:`, error);
      if (error.code === "NoSuchKey" || error.code === "NotFound") {
        console.warn(`Attempted to delete non-existent file: ${objectName}`);
        return true;
      }
      const deleteError: any = new Error(
        `Failed to delete file from storage: ${error.message}`
      );
      deleteError.status = 500;
      throw deleteError;
    }
  }

  public async getPresignedUrl(
    objectName: string,
    expirySeconds: number = 60 * 60 * 1
  ): Promise<string | null> {
    if (!objectName) {
      console.warn("MinioService: Empty objectName for getPresignedUrl.");
      return null;
    }
    try {
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expirySeconds
      );
      console.log(`MinioService: Generated presigned URL for ${objectName}.`);
      return url;
    } catch (error: any) {
      console.error(
        `MinioService: Error generating presigned URL for ${objectName}:`,
        error
      );
      return null;
    }
  }

  public async uploadCvFile(file: Express.Multer.File): Promise<UploadedFileInfo> {
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      const error: any = new Error("Invalid file object provided for CV upload.");
      error.status = 400;
      error.cause = "MinioUploadError";
      throw error;
    }
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(fileExtension)) {
      const error: any = new Error(`Unsupported CV file type: ${fileExtension}`);
      error.status = 400;
      error.cause = "ValidationError";
      throw error;
    }
    const objectName = `${this.FOLDER_PREFIXES.CVS}${uuidv4()}${fileExtension}`;
    return this._uploadFileInternal(
      file.buffer,
      objectName,
      file.mimetype,
      file.originalname
    );
  }

  public async uploadAvatarFile(file: Express.Multer.File): Promise<UploadedFileInfo> {
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      const error: any = new Error("Invalid file object for Avatar upload.");
      error.status = 400;
      error.cause = "MinioUploadError";
      throw error;
    }
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileExtension)) {
      const error: any = new Error(`Unsupported Avatar file type: ${fileExtension}`);
      error.status = 400;
      error.cause = "ValidationError";
      throw error;
    }
    const objectName = `${
      this.FOLDER_PREFIXES.AVATARS
    }${uuidv4()}${fileExtension}`;
    return this._uploadFileInternal(
      file.buffer,
      objectName,
      file.mimetype,
      file.originalname
    );
  }

  public async downloadCvFile(objectKey: string): Promise<Stream | undefined> {
    console.log(`Downloading CV stream: ${objectKey}`);
    return this._downloadFileInternal(objectKey);
  }

  /**
   * Mengunduh file CV sebagai Buffer (untuk pemrosesan backend seperti ZIP).
   * @param {string} objectKey - Key file di MinIO.
   * @returns {Promise<Buffer>} - Buffer dari file.
   */
  public async downloadCvFileAsBuffer(objectKey: string): Promise<Buffer> {
    console.log(`Downloading CV buffer: ${objectKey}`);
    if (!objectKey) {
      console.error("Minio Service Error: Object key is required for downloadAsBuffer.");
      throw new Error("Object key is required.");
    }
    
    // --- PERBAIKAN DI SINI ---
    // Ubah dari pola callback ke pola async/await
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Dapatkan stream menggunakan await
        const dataStream = await this.minioClient.getObject(
          this.bucketName,
          objectKey
        );

        // 2. Pasang listener ke stream yang didapat
        const dataChunks: Buffer[] = [];
        dataStream.on("data", (chunk: Buffer) => dataChunks.push(chunk));
        dataStream.on("end", () => {
          console.log(`Successfully streamed buffer data for ${objectKey}.`);
          try {
            const fileBuffer = Buffer.concat(dataChunks);
            resolve(fileBuffer);
          } catch (bufferError: any) {
            console.error(`Error concatenating buffer for ${objectKey}:`, bufferError);
            reject(new Error(`Failed to process file buffer: ${bufferError.message}`));
          }
        });
        dataStream.on("error", (streamErr: Error) => {
          console.error(`Minio Error during buffer streaming for ${objectKey}:`, streamErr);
          reject(new Error(`Stream error while downloading buffer: ${streamErr.message}`));
        });

      } catch (err: any) {
        // 3. Tangkap error jika 'getObject' (promise) gagal
        console.error(`Minio Error getting object buffer ${objectKey}:`, err);
        let downloadError: any;
        if (err.code === "NoSuchKey" || err.code === "NotFound") {
          downloadError = new Error(`File not found: ${objectKey}`);
          downloadError.status = 404;
        } else {
          downloadError = new Error(`Failed to get file buffer: ${err.message}`);
          downloadError.status = 500;
        }
        return reject(downloadError);
      }
    });
    // --- BATAS PERBAIKAN ---
  }

  public async downloadAvatarFile(objectKey: string): Promise<Stream | undefined> {
    console.log(`Downloading Avatar stream: ${objectKey}`);
    return this._downloadFileInternal(objectKey);
  }

  public async deleteCvFile(objectKey: string): Promise<boolean> {
    console.log(`Deleting CV file: ${objectKey}`);
    return this._deleteFileInternal(objectKey);
  }

  public async deleteAvatarFile(objectKey: string): Promise<boolean> {
    console.log(`Deleting Avatar file: ${objectKey}`);
    return this._deleteFileInternal(objectKey);
  }
}

export default new MinioService();