// backend/src/models/jobPosition.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

type JobStatus = "Draft" | "Open" | "Closed" | "Approved" | "Rejected";

interface JobPositionAttributes {
  id: number;
  name: string;
  location: string;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  specificRequirements: string | null;
  availableSlots: number;
  status: JobStatus;
  announcement: string | null;
  requestedById: number | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

interface JobPositionCreationAttributes extends Optional<JobPositionAttributes, "id" | "specificRequirements" | "availableSlots" | "status" | "createdAt" | "updatedAt" | "registrationStartDate" | "registrationEndDate"> {}

class JobPosition extends Model<JobPositionAttributes, JobPositionCreationAttributes> implements JobPositionAttributes {
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

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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
      // unique: true, // <-- 1. HAPUS DARI SINI
      comment: "Nama atau judul posisi pekerjaan, contoh: Backend Developer (JavaScript)",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Lokasi pekerjaan, contoh: Remote, Onsite (Bandung)",
    },
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
    specificRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Persyaratan spesifik untuk posisi ini (dalam format teks)",
    },
    availableSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
      comment: "Jumlah slot yang tersedia untuk posisi ini",
    },
    status: {
      type: DataTypes.ENUM("Draft", "Open", "Closed"),
      allowNull: false,
      defaultValue: "Draft",
      comment: 'Status posisi pekerjaan (Draft, Open, Closed). Hanya "Open" yang tampil di publik.',
    },
    announcement: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Pengumuman terkait posisi pekerjaan ini (dalam format teks)",
    },
    requestedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID pengguna yang mengajukan posisi pekerjaan ini",
    },
  },
  {
    sequelize,
    tableName: "job_positions",
    timestamps: true,
    comment: "Tabel untuk menyimpan data posisi pekerjaan yang dibuka",
    
    // --- 2. TAMBAHKAN BLOK 'indexes' INI ---
    // Ini adalah cara OOP yang benar untuk `unique: true`
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  }
);

export default JobPosition;