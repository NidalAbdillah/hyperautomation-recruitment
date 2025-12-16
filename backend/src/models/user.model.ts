// backend/src/models/user.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
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
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "avatarObjectKey"> {}
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
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

export default User;