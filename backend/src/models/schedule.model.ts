// src/models/schedule.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// Definisi struktur data jadwal.
// Memastikan tipe data tanggal (Date) konsisten agar sinkronisasi ke Google Calendar via n8n tidak error format.
interface ScheduleAttributes {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
  // Foreign Key: Menghubungkan jadwal spesifik ke satu pelamar.
  // Alur: Agar sistem tahu "Jadwal jam 9 ini interview-nya siapa?".
  applicationId: number | null; 
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// Aturan input saat membuat jadwal baru.
// ID dan timestamps diurus sistem, applicationId opsional (bisa null kalau ini jadwal internal HR non-interview).
interface ScheduleCreationAttributes
  extends Optional<
    ScheduleAttributes,
    "id" | "description" | "createdAt" | "updatedAt" | "applicationId"
  > {}

// Wadah OOP untuk tabel Schedule dan fungsi database dari Sequelize.

class Schedule
  extends Model<ScheduleAttributes, ScheduleCreationAttributes>
  implements ScheduleAttributes
{
  public id!: number;
  public title!: string;
  public startDate!: Date;
  public endDate!: Date;
  public description!: string | null;
  public applicationId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Konfigurasi tabel fisik di database.
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
      comment: "Judul event atau jadwal (misal: 'Interview Teknis - Nidal')",
    },
    // Waktu Mulai & Selesai.
    // Alur: Data ini krusial. Backend akan kirim ini ke n8n, lalu n8n booking slot di Google Calendar.
    // Tipe DATE di sini dipetakan ke TIMESTAMPTZ di Postgres untuk akurasi zona waktu.
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
      comment: "Deskripsi atau detail event (link meet, catatan, dll)",
    },

    // Relasi ke tabel Pelamar (CvApplication).
    // Ini jembatan penting. Tanpa kolom ini, jadwal jadi berdiri sendiri.
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Boleh null jika jadwal manual internal HR.
      references: {
        model: "cv_applications",
        key: "id",
      },
      onUpdate: "CASCADE",
      // Safety Net: Jika data pelamar dihapus, jadwalnya JANGAN dihapus (history), tapi set NULL.
      onDelete: "SET NULL", 
      comment: "ID dari aplikasi CV jika event ini adalah wawancara",
    },
  },
  {
    sequelize,
    tableName: "schedules",
    timestamps: true,
    comment: "Tabel untuk menyimpan data jadwal atau event kalender",
  }
);

export default Schedule;