import express from "express";
import {
  createJob,
  deleteJob,
  getJob,
  getMyCompanyJobs,
  listJobs,
  updateJob,
} from "../controllers/jobsController.js";
import { authRequired, roleRequired } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", listJobs);

// Company job management (Must be before /:id)
router.get("/company/my-jobs", authRequired, roleRequired("company"), getMyCompanyJobs);
router.post("/", authRequired, roleRequired("company"), createJob);
router.put("/:id", authRequired, roleRequired("company"), updateJob);
router.delete("/:id", authRequired, roleRequired("company"), deleteJob);

// Public single job
router.get("/:id", getJob);

export default router;
