// backend/src/models/cvApplication.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// Definisi struktur data lengkap untuk tabel CvApplication (Pelamar).
// Ini kontrak data yang akan dikonsumsi oleh Service saat menampilkan daftar pelamar atau detail pelamar.
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

// Aturan input saat membuat CvApplication baru (pelamar).
// Field ID, status, skor AI, dan arsip diurus sistem sehingga opsional saja.
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

// Wadah OOP untuk tabel CvApplication yang extend ke Model Sequelize,
// posisi <CvApplicationAttributes, dan CvApplicationCreationAttributes> adalah untuk menghubungkan tipe data TypeScript dengan Model Sequelize.
// fungsi database seperti sequilize .findAll() atau .update() dengan cara yang rapi karena udah konek ke Models Sequelize.                                                         
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

// Inisialisasi skema tabel fisik di database PostgreSQL saat aplikasi dijalankan.
// menggunakan fungsi fungsi pada Sequelize untuk mengatur tipe data, validasi, relasi, dan opsi lainnya. bukan dengan query SQL manual.
CvApplication.init(
  {
    // Primary Key untuk setiap pelamar.
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    // Data dasar pelamar.
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // validate untuk memastikan format email benar.
      validate: {
        isEmail: true,
      },
    },
    cvFileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // hanya metda data file CV yang disimpan di database.
    // Frontend Upload -> Backend simpan ke MinIO -> MinIO balikin Key -> Key disimpan di sini.
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
    // SUBMITTED (awal) sebagai default.
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "SUBMITTED",
    },
    // Hasil skor kemiripan CV dengan deskripsi pekerjaan dari n8n.
    similarity_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    // Hasil cek syarat wajib (True/False) dari n8n.
    passed_hard_gate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
    // Narasi analisis LLM (Llama 3.3) disimpan dalam format JSON.
    qualitative_assessment: {
      type: DataTypes.JSON, 
      allowNull: true,
      defaultValue: null,
    },
    // Hasil ekstraksi teks CV oleh OCR/AI disimpan sama dengan requirement_data.
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
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Relasi ke tabel JobPosition.
    // hubungkan pelamar dengan lowongan spesifik yang dilamar agar data tidak tercampur antar posisi.
    appliedPositionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "job_positions",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Jika lowongan dihapus, data pelamar tidak hilang, putuskan relasi
    },
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