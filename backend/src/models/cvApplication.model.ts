// backend/src/models/cvApplication.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// definisikan struktur data lengkap saat dibaca dari database (READ).
// Service ambil data dari DB untuk dikirim ke Controller/Frontend akan konsisten.
interface CvApplicationAttributes {
  id: number;
  fullName: string;
  email: string;
  cvFileName: string;
  cvFileObjectKey: string;
  qualification: string;
  agreeTerms: boolean;
  status: string;
  similarity_score: number | null;
  passed_hard_gate: boolean | null;
  qualitative_assessment: object | null; // Tipe JSON
  cv_data: object | null; // Tipe JSON
  requirement_data: object | null; // Tipe JSON
  isArchived: boolean;
  appliedPositionId: number;
  interview_notes: object | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// Interface untuk input data baru (CREATE).
// field yang di-generate otomatis oleh sistem (seperti ID, skor AI).
interface CvApplicationCreationAttributes extends Optional<
  CvApplicationAttributes,
  | "id"
  | "agreeTerms"
  | "status"
  | "similarity_score"
  | "passed_hard_gate"
  | "qualitative_assessment"
  | "cv_data"
  | "requirement_data"
  | "isArchived"
> {}

// Class OOP penghubung TypeScript & ORM Sequelize.
// Digunakan di 'application.service.ts' untuk memanggil method ORM seperti .create(), .findAll().                                                         
class CvApplication extends Model<CvApplicationAttributes, CvApplicationCreationAttributes> implements CvApplicationAttributes {
  public id!: number;
  public fullName!: string;
  public email!: string;
  public cvFileName!: string;
  public cvFileObjectKey!: string;
  public qualification!: string;
  public agreeTerms!: boolean;
  public status!: string;
  public similarity_score!: number | null;
  public passed_hard_gate!: boolean | null;
  public qualitative_assessment!: object | null;
  public cv_data!: object | null;
  public requirement_data!: object | null;
  public isArchived!: boolean;
  public appliedPositionId!: number;
  public interview_notes!: object | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inisialisasi konfigurasi kolom tabel dan aturan validasi.
CvApplication.init(
  {
    // Identitas unik pelamar (Primary Key).
    // Alur: ID ini akan dikirim ke n8n via Webhook agar n8n tahu data mana yang sedang diproses oleh AI.
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // Validasi format email dilakukan langsung di level model untuk menjaga integritas data sebelum masuk DB.
      validate: {
        isEmail: true,
      },
    },
    cvFileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Hanya menyimpan "Key/Alamat" file di MinIO, bukan menyimpan file fisik di database.
    // Alur: Frontend Upload -> Backend simpan ke MinIO -> MinIO balikin Key -> Key disimpan di sini.
    cvFileObjectKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    agreeTerms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Penanda posisi pelamar dalam pipeline rekrutmen (State Machine).
    // Alur: SUBMITTED (awal) -> REVIEWED (selesai diproses AI) -> INTERVIEW -> HIRED/REJECTED.
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "SUBMITTED",
    },
    // Skor relevansi vektor (0.0 - 1.0) dari perhitungan AI.
    // Alur: Dihitung oleh layanan Python/Node di n8n -> Dikirim balik ke Backend -> Disimpan untuk fitur Ranking otomatis.
    similarity_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    // Hasil cek syarat wajib (True/False) dari n8n.
    // Alur: n8n mengecek keyword wajib -> Hasil Boolean disimpan di sini sebagai filter deterministik (Hard Gate).
    passed_hard_gate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
    // Narasi analisis LLM (Llama 3.3) disimpan dalam format JSON.
    // Alur: Disimpan JSON agar struktur output AI fleksibel tanpa perlu mengubah skema tabel jika format prompt berubah.
    qualitative_assessment: {
      type: DataTypes.JSON, 
      allowNull: true,
      defaultValue: null,
    },
    // Hasil ekstraksi teks CV oleh OCR/AI untuk keperluan debugging.
    // Alur: Disimpan jika HR perlu melihat data mentah yang terbaca oleh sistem untuk verifikasi manual.
    cv_data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    requirement_data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    // Flag untuk fitur soft delete (arsip data).
    // Alur: True = Data disembunyikan dari list aktif dashboard, tapi record fisik tetap ada di DB untuk keperluan audit.
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Relasi ke tabel JobPosition.
    // Alur: Menghubungkan pelamar dengan lowongan spesifik yang dilamar agar data tidak tercampur antar posisi.
    appliedPositionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "job_positions",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Jika lowongan dihapus, data pelamar tidak hilang, putuskan relasi
    },
    // aktivitas HR (jadwal & feedback).
    // detail jadwal interview & feedback manager dalam format JSON yang fleksibel.
    interview_notes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "cv_applications",
    // pembuatan (createdAt) dan pembaruan (updatedAt)
    timestamps: true,
  }
);

export default CvApplication;