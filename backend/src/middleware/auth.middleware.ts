// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express"; // <-- 1. Impor Tipe Express
import * as jwt from "jsonwebtoken"; // <-- 2. Impor jwt dengan benar
import config from "../config"; // Impor config TS
import { UserResponseDTO } from "../interfaces/IUserService"; // Impor DTO User

// 3. PENTING: "Memberitahu" TypeScript tentang 'req.user'
// Ini adalah "Deklarasi Global" yang menambahkan properti 'user' ke
// tipe 'Request' bawaan Express. Ini akan memperbaiki error 'Property 'user' does not exist'.
declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDTO; // Properti 'user' akan berisi DTO kita yang aman
    }
  }
}
// --- BATAS PENJELASAN PENTING ---

/**
 * Helper untuk menangani respons error yang konsisten.
 */
const handleErrorResponse = (res: Response, error: any, statusCode: number) => {
  const message = error.message || "An unexpected error occurred.";
  res.status(statusCode).json({ message });
};

/**
 * Middleware 1: Mengautentikasi User (Memeriksa Token JWT)
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("[Middleware] Authentication: Running...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.warn("[Middleware] Authentication: No token provided.");
    return res
      .status(401)
      .json({ message: "Authentication required. No token provided." });
  }

  try {
    // 4. Verifikasi token (config.jwt.secret sudah Tipe 'Secret')
    const decodedPayload = jwt.verify(token, config.jwt.secret);

    // 5. Validasi Tipe Payload
    if (typeof decodedPayload === "string" || !decodedPayload.id) {
      console.warn("[Middleware] Authentication: Invalid token payload type.");
      throw new Error("Invalid token payload.");
    }
    
    // 6. Set req.user dengan tipe yang aman (sesuai DTO)
    req.user = {
      id: decodedPayload.id,
      role: decodedPayload.role,
      email: decodedPayload.email,
      // Kita tidak bisa mengisi semua field DTO dari token,
      // tapi ini sudah cukup untuk middleware otorisasi.
    } as UserResponseDTO; // Kita 'cast' agar TypeScript tahu

    console.log(
      "[Middleware] Authentication: req.user set from token payload:",
      req.user
    );

    next();
  } catch (error: any) {
    console.error(
      "[Middleware] Authentication: Token verification failed:",
      error.message
    );
    return res
      .status(401)
      .json({ message: "Authentication failed. Invalid or expired token." });
  }
};

/**
 * Middleware 2: Memeriksa Otorisasi (Memastikan User adalah Head HR)
 */
export const requireHeadHr = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("[Middleware] Otorisasi: Checking requireHeadHr...");

  if (!req.user || !req.user.role) {
    console.error(
      "[Middleware] Otorisasi: requireHeadHr dijalankan tanpa informasi user terautentikasi."
    );
    return handleErrorResponse(
      res,
      new Error("Authorization context missing."),
      500
    );
  }

  console.log("[Middleware] Otorisasi: User role:", req.user.role);
  
  // 7. PERBAIKAN: Ganti "Super Admin" menjadi "head_hr"
  if (req.user.role === "head_hr") {
    console.log("[Middleware] Otorisasi: User is Head HR. Proceeding.");
    next();
  } else {
    console.warn(
      "[Middleware] Otorisasi: User is not Head HR. Access denied."
    );
    return handleErrorResponse(
      res,
      new Error("Unauthorized: Hanya Head HR yang dapat melakukan tindakan ini."),
      403 // Forbidden
    );
  }
};

/**
 * Middleware 3: Memeriksa Otorisasi (Memastikan User boleh mengedit user lain)
 */
export const canEditUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("[Middleware] Otorisasi: Checking canEditUser...");
  const userIdToUpdate = parseInt(req.params.id, 10);

  if (!req.user || !req.user.id) {
    console.error(
      "[Middleware] Otorisasi: canEditUser dijalankan tanpa user terautentikasi."
    );
    return handleErrorResponse(
      res,
      new Error("Authentication context missing."),
      500
    );
  }
  if (isNaN(userIdToUpdate)) {
    console.warn(
      "[Middleware] Otorisasi: Invalid ID parameter for canEditUser check."
    );
    return handleErrorResponse(
      res,
      new Error("Invalid user ID format."),
      400
    );
  }

  console.log(
    `[Middleware] Otorisasi: User ${req.user.id} (Role: ${req.user.role}) attempting to edit user ${userIdToUpdate}.`
  );

  // 1. User bisa mengedit profilnya sendiri
  if (req.user.id === userIdToUpdate) {
    console.log(
      `[Middleware] Otorisasi: User ${req.user.id} editing own profile ${userIdToUpdate}. Proceeding.`
    );
    next();
  }
  // 8. PERBAIKAN: Ganti "Super Admin" menjadi "head_hr"
  else if (req.user.role === "head_hr") {
    console.log(
      `[Middleware] Otorisasi: Head HR ${req.user.id} editing user ${userIdToUpdate}. Proceeding.`
    );
    next();
  }
  // Jika tidak memenuhi kedua kondisi di atas
  else {
    console.warn(
      `[Middleware] Otorisasi: User ${req.user.id} (Role: ${req.user.role}) denied edit access to user ${userIdToUpdate}.`
    );
    return handleErrorResponse(
      res,
      new Error("Unauthorized: Anda hanya dapat mengedit profil Anda sendiri."),
      403 // Forbidden
    );
  }
};

// (Kita tidak perlu export 'module.exports' lagi)