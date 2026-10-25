import { Router } from "express";
import {
  createApplication,
  getJobApplicants,
  getMyApplications,
  streamApplicationResume,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { login, register } from "../controllers/auth.js";
import {
  getCandidate,
  streamCandidateResume,
  updateCandidateProfile,
  uploadCandidateResume,
} from "../controllers/candidateController.js";
import {
  createJob,
  deleteJob,
  getJob,
  getMyCompanyJobs,
  listJobs,
  updateJob,
} from "../controllers/jobDetailController.js";
import {
  getRecruiter,
  updateRecruiterProfile,
} from "../controllers/recruiterController.js";
import { authRequired, optionalAuth, roleRequired } from "../middleware/auth.js";
import {
  createPlan,
  listPlans,
  updatePlanCompletion,
} from "../features/improvement/controller.js";

const router = Router();

// Service health endpoint.
router.get("/health", (_req, res) => res.json({ status: "ok" }));

// Route shared account endpoints to the controller for the signed-in role.
function accountController(req, res, next, candidateController, recruiterController) {
  const handler = req.user?.role === "candidate" ? candidateController : recruiterController;
  return handler(req, res, next);
}

// Authentication and account profile routes.
router.post("/auth/register", register);
router.post("/auth/login", login);

router.get(
  "/auth/me",
  authRequired,
  (req, res, next) => accountController(req, res, next, getCandidate, getRecruiter),
);
router.put(
  "/auth/profile",
  authRequired,
  (req, res, next) => accountController(req, res, next, updateCandidateProfile, updateRecruiterProfile),
);
router.post("/auth/upload-resume", authRequired, roleRequired("candidate"), uploadCandidateResume);

// Public job browsing and recruiter-only job management.
// Keep the static recruiter path before the dynamic job ID route.
router.get("/jobs", listJobs);
router.get("/jobs/company/my-jobs", authRequired, roleRequired("company"), getMyCompanyJobs);
router.post("/jobs", authRequired, roleRequired("company"), createJob);
router.put("/jobs/:id", authRequired, roleRequired("company"), updateJob);
router.delete("/jobs/:id", authRequired, roleRequired("company"), deleteJob);
router.get("/jobs/:id", getJob);

// Candidate applications and recruiter applicant-management routes.
router.post("/applications", optionalAuth, createApplication);
router.get("/applications/candidate/my-applications", authRequired, roleRequired("candidate"), getMyApplications);
router.get("/applications/company/job/:jobId", authRequired, roleRequired("company"), getJobApplicants);
router.patch("/applications/:id/status", authRequired, roleRequired("company"), updateApplicationStatus);

// Resume file streaming routes.
router.get("/resumes/user/:candidateId", streamCandidateResume);
router.get("/resumes/application/:applicationId", streamApplicationResume);
router.get("/resumes/:id", (req, res, next) => {
  req.params.applicationId = req.params.id;
  return streamApplicationResume(req, res, next);
});

// Improvement-plan feature routes.
router.get("/improvement-plans", listPlans);
router.post("/improvement-plans", createPlan);
router.patch("/improvement-plans/:id", updatePlanCompletion);

export default router;
