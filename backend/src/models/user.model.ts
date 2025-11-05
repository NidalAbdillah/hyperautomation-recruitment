import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// Definisikan atribut yang dimiliki model (untuk type-safety)
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'head_hr' | 'staff_hr' | 'manager'; // Tipe data peran yang spesifik
  avatarObjectKey: string | null;
  department: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// 2. Definisikan atribut yang opsional saat membuat (misal: id)
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "avatarObjectKey"> {}

// 3. Buat Class (Kelas) Model Anda
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: 'head_hr' | 'staff_hr' | 'manager';
  public avatarObjectKey!: string | null;
  public department!: string | null;

  // Timestamps (createdAt, updatedAt) ditambahkan otomatis
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

}

// 4. Inisialisasi Model (ini menggantikan sequelize.define)
User.init(
  {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "staff_hr",
      validate: {
        isIn: [["head_hr", "staff_hr", "manager"]],
      },
    },
    avatarObjectKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize, // Wajib: instance sequelize
    tableName: "users",
    timestamps: true,
  }
);

export default User;