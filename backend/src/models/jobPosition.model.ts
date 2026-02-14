// backend/src/models/jobPosition.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";

// Definisi tipe data custom untuk menjaga konsistensi alur persetujuan (SOP).
// Mencegah input status sembarangan (typo) di luar nilai yang diizinkan ini.
type JobStatus = "DRAFT" | "OPEN" | "CLOSED" | "APPROVED" | "REJECTED";

// Struktur data lengkap saat dibaca sistem.
// Ini kontrak data yang akan dikonsumsi oleh Service saat menampilkan detail lowongan ke Dashboard atau ke n8n.
interface JobPositionAttributes {
  id: number;
  name: string;
  location: string;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  specificRequirements: string | null;
  availableSlots: number;
  status: JobStatus; // Menggunakan tipe custom
  announcement: string | null;
  requestedById: number | null;
  isArchived: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// Aturan input saat Manager pertama kali membuat request.
// Manager cukup isi data inti, sisanya otomatis
interface JobPositionCreationAttributes
  extends Optional<
    JobPositionAttributes,
    | "id"
    | "specificRequirements"
    | "availableSlots"
    | "status"
    | "createdAt"
    | "updatedAt"
    | "registrationStartDate"
    | "registrationEndDate"
    | "isArchived"
  > {}

// Wadah OOP untuk tabel JobPosition.
//  fungsi database seperti sequilize .findAll() atau .update() dengan cara yang rapi.
class JobPosition
  extends Model<JobPositionAttributes, JobPositionCreationAttributes>
  implements JobPositionAttributes
{
  public id!: number;
  public name!: string;
  public location!: string;
  public registrationStartDate!: Date | null;
  public registrationEndDate!: Date | null;
  public specificRequirements!: string | null;
  public availableSlots!: number;
  public status!: JobStatus;
  public announcement!: string | null;
  public requestedById!: number | null;
  public isArchived!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual association untuk membantu TypeScript mengenali relasi dengan User (requestor).
  public readonly requestor?: User;
}

// Konfigurasi skema tabel fisik di PostgreSQL.
JobPosition.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nama atau judul posisi pekerjaan",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Lokasi pekerjaan (misal: Bandung/Remote)",
    },
    // Logika kontrol durasi tayang lowongan.
    // Service akan mengecek: Jika hari ini di luar tanggal ini, lowongan otomatis tidak muncul di portal pelamar.
    registrationStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Tanggal mulai periode pendaftaran",
    },
    registrationEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Tanggal akhir periode pendaftaran",
    },
    // Kolom paling krusial untuk fitur Hyperautomation (AI Context).
    // Teks di sini akan diambil n8n, dibaca Llama 3.3, dan dijadikan acuan (Ground Truth) untuk menilai CV pelamar.
    specificRequirements: {
      type: DataTypes.TEXT, // Pakai TEXT biar muat deskripsi panjang
      allowNull: true,
      comment: "Persyaratan spesifik untuk posisi ini (internal)",
    },
    availableSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // Mencegah input kuota negatif (integritas data).
      validate: {
        min: 0, 
      },
      comment: "Jumlah slot yang tersedia untuk posisi ini",
    },
    // State Machine untuk mengontrol siklus hidup lowongan.
    // Default 'DRAFT' memastikan lowongan yang baru dibuat Manager tidak langsung tayang sebelum di-approve Head HR.
    status: {
      type: DataTypes.ENUM("DRAFT", "OPEN", "CLOSED", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "DRAFT",
      comment: "Status posisi pekerjaan",
    },
    announcement: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Pengumuman/konten publik untuk lowongan",
    },
    // Audit Trail untuk melacak siapa pembuat lowongan.
    // Relasi ke tabel Users, berguna untuk laporan pertanggungjawaban Manager ke HR.
    requestedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID pengguna yang mengajukan posisi pekerjaan ini",
    },
    // Fitur Soft Delete (Arsip).
    // Lowongan lama tidak dihapus fisik agar data pelamar yang terhubung tetap aman referensinya (Foreign Key tidak putus).
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Flag untuk soft delete (arsip)",
    },
  },
  {
    sequelize,
    tableName: "job_positions",
    timestamps: true,
    comment: "Tabel untuk menyimpan data posisi pekerjaan yang dibuka",
    // Optimasi database: Index pada nama posisi biar pencarian/filter di dashboard admin ngebut.
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
    ],
  }
);

export default JobPosition;