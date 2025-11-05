// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import * as jwt from "jsonwebtoken"; // <-- PERBAIKAN: Gunakan import * as
import config from "../config";
import { User } from "../models";

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any) => {
  const status = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  res.status(status).json({ message });
};

/**
 * Menangani login user dan mengembalikan JWT.
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  console.log(
    "Login attempt received for email:",
    req.body.email,
    "from IP:",
    req.ip
  );

  const { email, password, rememberMe } = req.body as {
    email?: string;
    password?: string;
    rememberMe?: boolean;
  };

  if (!email || !password) {
    console.warn("Login attempt failed: Email or password missing.");
    const error: any = new Error("Email dan password harus diisi.");
    error.status = 400;
    return handleErrorResponse(res, error);
  }

  try {
    const user: User | null = await userService.findUserByEmail(email);

    if (!user || !user.passwordHash) {
      console.warn(
        `Login attempt failed for email "${email}": User not found.`
      );
      const error: any = new Error("Email tidak terdaftar atau password tidak valid.");
      error.status = 401;
      return handleErrorResponse(res, error);
    }

    const isPasswordMatch = await userService.comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordMatch) {
      console.warn(
        `Login attempt failed for email "${email}": Password mismatch.`
      );
      const error: any = new Error("Password salah.");
      error.status = 401;
      return handleErrorResponse(res, error);
    }

    console.log(`User "${user.email}" successfully authenticated.`);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const expiresIn: string = rememberMe
      ? config.jwt.rememberMeExpiresIn
      : config.jwt.expiresIn;

    console.log(`Creating JWT for ${user.email} with expiresIn: ${expiresIn}`);

    // Sekarang error 'No overload matches' akan hilang
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: expiresIn,
    } as jwt.SignOptions); // <-- PERBAIKAN DI SINI
    
    const userResponseDTO = await userService.getUserById(user.id);

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: userResponseDTO,
    });
  } catch (error: any) {
    console.error(
      "Error during login process for email:",
      req.body.email,
      ":",
      error.message,
      error
    );
    if (!res.headersSent) {
      const errorMessage =
        error.message || "An unexpected error occurred during login.";
      handleErrorResponse(res, {
        status: error.status || 500,
        message: errorMessage,
      });
    }
  }
};

export {
  login,
};