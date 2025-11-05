// src/routes/users.routes.ts
import express, { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller"; // Impor controller TS
import {
  authenticate,
  requireHeadHr,
  canEditUser,
} from "../middleware/auth.middleware"; // Impor middleware TS

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log(`Multer FileFilter: Checking file ${file.originalname}, mimetype: ${file.mimetype}`);
  if (file.mimetype.startsWith("image/")) {
    console.log(`Multer FileFilter: File ${file.originalname} accepted.`);
    cb(null, true);
  } else {
    console.warn(`Multer FileFilter: File ${file.originalname} rejected. Invalid type: ${file.mimetype}`);
    cb(new Error("Invalid file type. Only image files are allowed for photos.") as any, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const router: Router = express.Router();

// Rute ini sudah benar (menggunakan controller TS dan middleware TS)
router.get("/", requireHeadHr, getAllUsers);

router.post("/", requireHeadHr, upload.single("photo"), createUser);

router.put("/:id", upload.single("photo"), canEditUser, updateUser);

router.delete("/:id", requireHeadHr, deleteUser);

export default router;