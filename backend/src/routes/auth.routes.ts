// src/routes/auth.routes.ts
import express, { Router } from "express";
import { login } from "../controllers/auth.controller"; // Impor controller TS

const router: Router = express.Router();

router.post("/login", login);

export default router;