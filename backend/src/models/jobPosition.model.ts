// src/models/jobPosition.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";

// --- PERBAIKAN 1: Ubah tipe ke UPPER_SNAKE_CASE ---
type JobStatus = "DRAFT" | "OPEN" | "CLOSED" | "APPROVED" | "REJECTED";

interface JobPositionAttributes {
  id: number;
  name: string;
  location: string;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  specificRequirements: string | null;
  availableSlots: number;
  status: JobStatus; // <-- Tipe ini sekarang sudah benar
  announcement: string | null;
  requestedById: number | null;
  isArchived: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

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
  public status!: JobStatus; // <-- Tipe ini sekarang sudah benar
  public announcement!: string | null;
  public requestedById!: number | null;
  public isArchived!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // (Definisi asosiasi jika Anda menggunakannya di dalam model)
  public readonly requestor?: User;
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
      comment: "Nama atau judul posisi pekerjaan",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Lokasi pekerjaan",
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
      comment: "Persyaratan spesifik untuk posisi ini (internal)",
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
      // --- PERBAIKAN 2: Ubah ENUM ke UPPER_SNAKE_CASE ---
      type: DataTypes.ENUM("DRAFT", "OPEN", "CLOSED", "APPROVED", "REJECTED"),
      allowNull: false,
      // --- PERBAIKAN 3: Ubah defaultValue ke UPPER_SNAKE_CASE ---
      defaultValue: "DRAFT",
      comment: "Status posisi pekerjaan",
    },
    announcement: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Pengumuman/konten publik untuk lowongan",
    },
    requestedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID pengguna yang mengajukan posisi pekerjaan ini",
    },
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
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
    ],
  }
);

export default JobPosition;