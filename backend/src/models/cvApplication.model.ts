// backend/src/models/cvApplication.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

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

CvApplication.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    cvFileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
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
    status: {
      type: DataTypes.STRING, // Sebaiknya gunakan ENUM di sini
      allowNull: false,
      defaultValue: "Submitted",
    },
    similarity_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    passed_hard_gate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
    qualitative_assessment: {
      type: DataTypes.JSON, // Sequelize akan menangani JSON
      allowNull: true,
      defaultValue: null,
    },
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
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    appliedPositionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "job_positions",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    interview_notes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "cv_applications",
    timestamps: true,
  }
);

export default CvApplication;