// src/models/schedule.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database"; // Pastikan path ini benar

// Interface untuk atribut Schedule
interface ScheduleAttributes {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
  // --- ✅ PR: TAMBAHKAN FOREIGN KEY ---
  applicationId: number | null; 
  // --- BATAS PR ---
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// Interface untuk data yang dibutuhkan saat membuat Schedule baru
interface ScheduleCreationAttributes
  extends Optional<
    ScheduleAttributes,
    "id" | "description" | "createdAt" | "updatedAt" | "applicationId" // <-- ✅ PR: Tambahkan "applicationId"
  > {}

// Definisikan Model
class Schedule
  extends Model<ScheduleAttributes, ScheduleCreationAttributes>
  implements ScheduleAttributes
{
  public id!: number;
  public title!: string;
  public startDate!: Date;
  public endDate!: Date;
  public description!: string | null;
  // --- ✅ PR: TAMBAHKAN FOREIGN KEY ---
  public applicationId!: number | null;
  // --- BATAS PR ---

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inisialisasi Model
Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Judul event atau jadwal",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Waktu mulai event",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Waktu selesai event",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Deskripsi atau detail event",
    },

    // --- ✅ PR: TAMBAHKAN DEFINISI KOLOM (Sesuai Migrasi Anda) ---
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Boleh null (untuk event manual HR)
      references: {
        model: "cv_applications", // Nama tabel aplikasi
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", 
      comment: "ID dari aplikasi CV jika event ini adalah wawancara",
    },
    // --- BATAS PR ---
  },
  {
    sequelize, // Koneksi sequelize
    tableName: "schedules", // Nama tabel di database
    timestamps: true, // Otomatis kelola createdAt dan updatedAt
    comment: "Tabel untuk menyimpan data jadwal atau event kalender",
  }
);

export default Schedule;