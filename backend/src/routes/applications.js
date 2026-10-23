import express from "express";
import {
  createApplication,
  getJobApplicants,
  getMyApplications,
  updateApplicationStatus,
} from "../controllers/applicationsController.js";
import { authRequired, optionalAuth, roleRequired } from "../middleware/auth.js";

const router = express.Router();

// Candidate submits application (optional auth if logged in)
router.post("/", optionalAuth, createApplication);

// Candidate tracks their own applications
router.get("/candidate/my-applications", authRequired, roleRequired("candidate"), getMyApplications);

// Company views applicants for a job
router.get("/company/job/:jobId", authRequired, roleRequired("company"), getJobApplicants);

// Company updates an applicant's status
router.patch("/:id/status", authRequired, roleRequired("company"), updateApplicationStatus);

export default router;
