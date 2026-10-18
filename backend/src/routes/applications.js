import { Router } from "express";
import { createApplication } from "../controllers/applicationsController.js";

const router = Router();

router.post("/", createApplication);

export default router;
