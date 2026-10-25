import express from "express";
import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import Application from "../models/Application.js";

const router = express.Router();

// GET /api/resumes/user/:userId - Stream candidate resume PDF directly from MongoDB
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const resume = await Resume.findOne({ candidateUser: userId }).sort({ createdAt: -1 });
    if (!resume || !resume.data) {
      return res.status(404).json({ message: "No resume found for this candidate in database." });
    }

    res.setHeader("Content-Type", resume.contentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(resume.fileName)}"`);
    res.setHeader("Content-Length", resume.fileSize || resume.data.length);
    res.send(resume.data);
  } catch (error) {
    next(error);
  }
});

// GET /api/resumes/:id - Stream resume by Resume ID directly from MongoDB
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid resume ID." });
    }

    const resume = await Resume.findById(id);
    if (!resume || !resume.data) {
      return res.status(404).json({ message: "Resume not found in database." });
    }

    res.setHeader("Content-Type", resume.contentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(resume.fileName)}"`);
    res.setHeader("Content-Length", resume.fileSize || resume.data.length);
    res.send(resume.data);
  } catch (error) {
    next(error);
  }
});

// GET /api/resumes/application/:applicationId - Stream applicant resume from MongoDB
router.get("/application/:applicationId", async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Try finding resume linked to candidate user or application
    let resume = null;
    if (application.candidateUser) {
      resume = await Resume.findOne({ candidateUser: application.candidateUser }).sort({ createdAt: -1 });
    }

    if (!resume || !resume.data) {
      return res.status(404).json({ message: "No PDF resume found for this applicant." });
    }

    res.setHeader("Content-Type", resume.contentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(resume.fileName)}"`);
    res.setHeader("Content-Length", resume.fileSize || resume.data.length);
    res.send(resume.data);
  } catch (error) {
    next(error);
  }
});

export default router;
