// src/services/user.service.ts
import bcrypt from "bcrypt";
import { User } from "../models";
import minioService from "./minio.service";
import { sequelize } from "../config/database";
import { Transaction } from "sequelize";
// PERBAIKAN: Impor DTO baru
import {
  IUserService,
  UserCreationDTO,
  UserResponseDTO,
} from "../interfaces/IUserService";

const SALT_ROUNDS = 10;

/**
 * Service class untuk mengelola semua logika bisnis terkait User.
 * @class UserService
 * @implements {IUserService}
 */
class UserService implements IUserService {
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  public async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Helper privar untuk membuat DTO Respons yang aman.
   * @param user
   * @returns {Promise<UserResponseDTO>}
   */
  private async _buildUserResponseDTO(user: User): Promise<UserResponseDTO> {
    const userJson = user.toJSON();
    let photoUrl: string | null = null;
    
    if (userJson.avatarObjectKey) {
      photoUrl = await minioService.getPresignedUrl(userJson.avatarObjectKey);
    }

    // Buat objek DTO yang bersih sesuai kontrak
    const userResponse: UserResponseDTO = {
      id: userJson.id,
      name: userJson.name,
      email: userJson.email,
      role: userJson.role,
      department: userJson.department,
      createdAt: userJson.createdAt,
      updatedAt: userJson.updatedAt,
      photoUrl: photoUrl,
    };
    
    return userResponse;
  }

  public async createUser(userData: UserCreationDTO): Promise<UserResponseDTO> {
    if (!userData.password) {
      const error: any = new Error("Password is required to create a user.");
      error.status = 400;
      throw error;
    }

    const validRoles: string[] = ["head_hr", "staff_hr", "manager"];
    if (!userData.role || !validRoles.includes(userData.role)) {
      const error: any = new Error(
        "Invalid or missing role. Must be one of: head_hr, staff_hr, manager."
      );
      error.status = 400;
      throw error;
    }

    const t: Transaction = await sequelize.transaction();
    let avatarObjectKey: string | null = null;

    try {
      const hashedPassword = await this.hashPassword(userData.password!);

      if (userData.photoFile) {
        const uploadedFileInfo = await minioService.uploadAvatarFile(
          userData.photoFile
        );
        avatarObjectKey = uploadedFileInfo.objectName;
      }

      const userToCreate = {
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        avatarObjectKey: avatarObjectKey,
      };

      const user = await User.create(userToCreate as any, { transaction: t });
      await t.commit();
      
      console.log(`Service: Create user transaction committed for ID: ${user.id}.`);
      
      // PERBAIKAN: Panggil helper DTO, jangan 'delete'
      return this._buildUserResponseDTO(user);

    } catch (error: any) {
      // PERBAIKAN: 't.finished'
      if (t && !(t as any).finished) {
        await t.rollback();
      }
      
      if (avatarObjectKey) {
        try {
          await minioService.deleteAvatarFile(avatarObjectKey);
        } catch (cleanupError: any) {
          console.error("Service Error: Failed to clean up Minio file:", cleanupError);
        }
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        const duplicateError: any = new Error("Email address is already registered.");
        duplicateError.status = 409;
        throw duplicateError;
      }
      if (error.name === "SequelizeValidationError") {
        const validationError: any = new Error(
          error.errors[0].message || "Validation error."
        );
        validationError.status = 400;
        throw validationError;
      }

      throw error;
    }
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { email: email },
        attributes: [
          "id", "name", "email", "passwordHash", "role", "avatarObjectKey",
        ],
      });

      // (Logika photoUrl tidak ditambahkan di sini karena
      // fungsi ini dipakai internal oleh auth.controller
      // yang butuh passwordHash, bukan photoUrl)
      return user;
    } catch (error: any) {
      console.error("Service Error finding user by email:", error);
      throw error;
    }
  }

  public async getAllStaffAndManagers(): Promise<UserResponseDTO[]> {
    try {
      const users: User[] = await User.findAll({
        where: {
          role: ["head_hr", "staff_hr", "manager"],
        },
        attributes: [
          "id", "name", "email", "role", "avatarObjectKey", "createdAt", "updatedAt",
        ],
        order: [["createdAt", "ASC"]],
      });

      // PERBAIKAN: Ubah 'users.map' untuk me-return DTO
      const usersWithPhotoUrls = await Promise.all(
        users.map(user => this._buildUserResponseDTO(user))
      );

      return usersWithPhotoUrls;
    } catch (error: any) {
      console.error("Service Error getting all users:", error);
      throw error;
    }
  }

  public async getUserById(userId: number): Promise<UserResponseDTO> {
    try {
      const user = await User.findByPk(userId, {
        attributes: [
          "id", "name", "email", "role", "avatarObjectKey", "createdAt", "updatedAt",
        ],
      });

      if (!user || !["head_hr", "staff_hr", "manager"].includes(user.role)) {
        const error: any = new Error("User not found.");
        error.status = 404;
        throw error;
      }

      // PERBAIKAN: Return DTO
      return this._buildUserResponseDTO(user);
    } catch (error: any) {
      console.error(`Service Error getting user by ID ${userId}:`, error);
      throw error;
    }
  }

  public async updateUser(
    userId: number,
    updateData: Partial<UserCreationDTO>
  ): Promise<UserResponseDTO> {
    const t: Transaction = await sequelize.transaction();
    let newAvatarObjectKey: string | null | undefined = undefined;
    let oldAvatarObjectKey: string | null = null;

    try {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) {
        const error: any = new Error("User not found.");
        error.status = 404;
        throw error;
      }
      
      oldAvatarObjectKey = user.avatarObjectKey; // Simpan key lama

      if (
        user.role === "head_hr" &&
        updateData.role &&
        updateData.role !== "head_hr"
      ) {
        const headHrCount = await User.count({
          where: { role: "head_hr" },
          transaction: t,
        });
        if (headHrCount <= 1) {
          const error: any = new Error("Cannot change role of the last Head HR.");
          error.status = 400;
          throw error;
        }
      }

      if (
        updateData.role &&
        !["head_hr", "staff_hr", "manager"].includes(updateData.role)
      ) {
        const error: any = new Error("Invalid role provided for update.");
        error.status = 400;
        throw error;
      }

      const dataToUpdate: any = {
        name: updateData.name ?? user.name,
        email: updateData.email ?? user.email,
        role: updateData.role ?? user.role,
      };

      if (updateData.password) {
        dataToUpdate.passwordHash = await this.hashPassword(updateData.password);
      }

      if (updateData.photoFile || updateData.removePhoto === true) {
        if (updateData.removePhoto === true) {
          newAvatarObjectKey = null; // Tandai untuk dihapus
        } else if (updateData.photoFile) {
          const uploadedFileInfo = await minioService.uploadAvatarFile(
            updateData.photoFile
          );
          newAvatarObjectKey = uploadedFileInfo.objectName; // Tandai untuk diganti
        }

        if (newAvatarObjectKey !== undefined) {
          dataToUpdate.avatarObjectKey = newAvatarObjectKey;
        }
      }

      // Lakukan update DB
      await user.update(dataToUpdate, { transaction: t });
      await t.commit(); // Commit SEBELUM menghapus file lama

      // Clean up file MinIO LAMA (jika ada file baru ATAU jika remove=true)
      if ((newAvatarObjectKey !== undefined) && oldAvatarObjectKey) {
          try {
            await minioService.deleteAvatarFile(oldAvatarObjectKey);
          } catch (fileDeleteError: any) {
            console.error(`Service Error: Failed to delete old avatar file ${oldAvatarObjectKey}:`, fileDeleteError);
            // Jangan gagalkan seluruh proses hanya karena gagal hapus file lama
          }
      }

      // PERBAIKAN: Return DTO
      return this._buildUserResponseDTO(user); // 'user' sudah di-update di memori

    } catch (error: any) {
      // PERBAIKAN: 't.finished'
      if (t && !(t as any).finished) {
        await t.rollback();
      }

      // Jika upload file baru sukses TAPI DB Gagal, hapus file baru
      if (newAvatarObjectKey) {
        try {
          await minioService.deleteAvatarFile(newAvatarObjectKey);
        } catch (cleanupError: any) {
          console.error("Service Error: Failed to clean up NEW Minio file:", cleanupError);
        }
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        const duplicateError: any = new Error("Email address is already registered.");
        duplicateError.status = 409;
        throw duplicateError;
      }
      if (error.name === "SequelizeValidationError") {
        const validationError: any = new Error(
          error.errors[0].message || "Validation error."
        );
        validationError.status = 400;
        throw validationError;
      }
      
      console.error(`Service Error updating user ${userId}:`, error);
      throw error;
    }
  }

  public async deleteUser(userId: number): Promise<{ message: string }> {
    const t: Transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) {
        const error: any = new Error("User not found.");
        error.status = 404;
        throw error;
      }

      const headHrCount = await User.count({
        where: { role: "head_hr" },
        transaction: t,
      });
      if (user.role === "head_hr" && headHrCount <= 1) {
        const error: any = new Error("Cannot delete the last Head HR.");
        error.status = 400;
        throw error;
      }

      const oldAvatarObjectKey = user.avatarObjectKey; // Simpan key

      await user.destroy({ transaction: t });
      await t.commit(); // Commit SEBELUM hapus file

      if (oldAvatarObjectKey) {
        try {
          await minioService.deleteAvatarFile(oldAvatarObjectKey);
        } catch (fileDeleteError: any) {
          console.error(`Service Error: Failed to delete old avatar file ${oldAvatarObjectKey}:`, fileDeleteError);
        }
      }

      return { message: "User deleted successfully" };
    } catch (error: any) {
      // PERBAIKAN: 't.finished'
      if (t && !(t as any).finished) {
        await t.rollback();
      }
      console.error(`Service Error deleting user ${userId}:`, error);
      throw error;
    }
  }
} // <-- Penutup Class

export default new UserService();