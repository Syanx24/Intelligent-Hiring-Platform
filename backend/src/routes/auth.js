import express from "express";
import { getMe, login, register, updateProfile, uploadResume } from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, getMe);
router.put("/profile", authRequired, updateProfile);
router.post("/upload-resume", authRequired, uploadResume);

export default router;
