// backend/src/models/user.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// Definisi struktur data User lengkap saat dibaca dari database.
// Alur: Data ini yang akan diambil saat proses Login untuk membuat Token JWT, dan saat Admin melihat daftar pengguna di Dashboard.
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'head_hr' | 'staff_hr' | 'manager';
  avatarObjectKey: string | null;
  department: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// Aturan input saat membuat User baru (Create).
// Field ID diurus database, dan Avatar bersifat opsional (bisa upload belakangan).
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "avatarObjectKey"> {}

// Class Model penghubung logika TypeScript dengan tabel Users di database.
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: 'head_hr' | 'staff_hr' | 'manager';
  public avatarObjectKey!: string | null;
  public department!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inisialisasi konfigurasi tabel.
User.init(
  {
    // Primary Key.
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Identitas Login.
    // Alur: Validasi isEmail menjaga agar tidak ada input format yang salah. Unique memastikan satu email hanya untuk satu akun.
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    // Keamanan Password.
    // Alur: Kita TIDAK menyimpan password asli (plain text).
    // Service akan melakukan Hashing (Bcrypt) terhadap input password user, lalu hasil hash-nya yang disimpan di sini.
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Role-Based Access Control (RBAC).
    // Alur: Kolom paling krusial untuk keamanan. Middleware (auth.middleware.ts) akan membaca kolom ini untuk menentukan izin:
    // - 'head_hr': Super Admin (Bisa approve, hapus data).
    // - 'manager': User yang me-request lowongan & melakukan interview.
    // - 'staff_hr': Admin operasional harian.
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "staff_hr",
      validate: {
        isIn: [["head_hr", "staff_hr", "manager"]], // Membatasi nilai agar tidak ada role ilegal.
      },
    },
    // Integrasi MinIO untuk Foto Profil.
    // Alur: Sama seperti CV, kita hanya menyimpan 'Key/Alamat' file di sini. File fisiknya ada di MinIO bucket 'avatars'.
    avatarObjectKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Konteks Departemen (Khusus Manager).
    // Alur: Mencatat asal divisi user (misal: "IT", "Finance").
    // Berguna saat Manager me-request lowongan, agar HR tahu lowongan itu untuk divisi mana.
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true, // Mencatat kapan user dibuat dan terakhir diupdate.
  }
);

export default User;