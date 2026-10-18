import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

export async function createApplication(req, res, next) {
  try {
    const { jobId, name, email, resumeUrl, message } = req.body ?? {};
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "A valid job is required." });
    }
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res
        .status(400)
        .json({ message: "Please provide your name and a valid email." });
    }
    if (
      (resumeUrl !== undefined && typeof resumeUrl !== "string") ||
      (message !== undefined && typeof message !== "string")
    ) {
      return res.status(400).json({ message: "Invalid application details." });
    }

    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      return res
        .status(404)
        .json({ message: "This job is no longer available." });
    }

    const application = await Application.create({
      job: jobId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      resumeUrl: resumeUrl?.trim() ?? "",
      message: message?.trim() ?? "",
    });
    res.status(201).json({
      message: "Your application has been submitted.",
      applicationId: application.id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied to this role with that email.",
      });
    }
    next(error);
  }
}
