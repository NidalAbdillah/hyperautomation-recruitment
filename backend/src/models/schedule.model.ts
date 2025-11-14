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
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// Interface untuk data yang dibutuhkan saat membuat Schedule baru
// 'id', 'createdAt', 'updatedAt' dibuat opsional
interface ScheduleCreationAttributes
  extends Optional<
    ScheduleAttributes,
    "id" | "description" | "createdAt" | "updatedAt"
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
    // createdAt dan updatedAt akan otomatis ditangani oleh Sequelize
    // karena 'timestamps: true' di bawah
  },
  {
    sequelize, // Koneksi sequelize
    tableName: "schedules", // Nama tabel di database
    timestamps: true, // Otomatis kelola createdAt dan updatedAt
    comment: "Tabel untuk menyimpan data jadwal atau event kalender",
  }
);

export default Schedule;