// src/interfaces/IMinioService.ts
import { Stream } from "stream";

// Tipe data untuk info file yang di-upload
interface UploadedFileInfo {
  objectName: string;
  fileName: string;
  etag: string;
}

/**
 * Interface (Kontrak) untuk MinioService.
 */
export interface IMinioService {
  ensureBucketExists(): Promise<void>;
  
  getPresignedUrl(objectName: string, expirySeconds?: number): Promise<string | null>;

  uploadCvFile(file: Express.Multer.File): Promise<UploadedFileInfo>;
  
  uploadAvatarFile(file: Express.Multer.File): Promise<UploadedFileInfo>;

  downloadCvFile(objectKey: string): Promise<Stream | undefined>; // Stream

  downloadCvFileAsBuffer(objectKey: string): Promise<Buffer>; // Buffer

  downloadAvatarFile(objectKey: string): Promise<Stream | undefined>; // Stream

  deleteCvFile(objectKey: string): Promise<boolean>;

  deleteAvatarFile(objectKey: string): Promise<boolean>;
}