import mongoose from "mongoose";
import Candidate from "../models/Candidate.js";

export function getCandidate(req, res) {
  res.json(req.user.toSafeJSON());
}

export async function updateCandidateProfile(req, res, next) {
  try {
    const candidate = req.user;
    const body = req.body ?? {};
    if (typeof body.name === "string" && body.name.trim()) candidate.name = body.name.trim();
    if (body.headline !== undefined) candidate.headline = String(body.headline).trim();
    if (body.githubUrl !== undefined) candidate.githubUrl = String(body.githubUrl).trim();
    if (body.portfolioUrl !== undefined) candidate.portfolioUrl = String(body.portfolioUrl).trim();
    if (body.bio !== undefined) candidate.bio = String(body.bio).trim();
    if (body.location !== undefined) candidate.location = String(body.location).trim();
    if (body.resumeUrl !== undefined) candidate.resumeUrl = String(body.resumeUrl).trim();
    if (body.experienceYears !== undefined) candidate.experienceYears = Number(body.experienceYears) || 0;
    if (Array.isArray(body.skills)) candidate.skills = body.skills.map((skill) => String(skill).trim()).filter(Boolean);

    await candidate.save();
    res.json({ message: "Profile updated successfully.", user: candidate.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function uploadCandidateResume(req, res, next) {
  try {
    const { fileName, fileData } = req.body ?? {};
    if (typeof fileData !== "string" || !fileData) {
      return res.status(400).json({ message: "Please provide a valid PDF resume file." });
    }

    const safeFileName = typeof fileName === "string" ? fileName : "resume.pdf";
    const isPdf =
      fileData.startsWith("data:application/pdf;base64,") ||
      fileData.startsWith("data:application/octet-stream;base64,") ||
      safeFileName.toLowerCase().endsWith(".pdf");
    if (!isPdf) return res.status(400).json({ message: "Only PDF documents (.pdf) are allowed." });

    const buffer = Buffer.from(fileData.replace(/^data:[^;]+;base64,/, ""), "base64");
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ message: "Resume files cannot exceed 2MB." });
    }

    const candidate = req.user;
    candidate.resumeData = buffer;
    candidate.resumeFileName = safeFileName;
    candidate.resumeFileSize = buffer.length;
    candidate.resumeContentType = "application/pdf";
    candidate.resumeUrl = `/api/resumes/user/${candidate._id}`;
    await candidate.save();

    res.json({
      message: "CV stored successfully.",
      resumeUrl: candidate.resumeUrl,
      fileName: candidate.resumeFileName,
      fileSize: buffer.length,
      user: candidate.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function streamCandidateResume(req, res, next) {
  try {
    const { candidateId } = req.params;
    if (!mongoose.isValidObjectId(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate ID." });
    }

    const candidate = await Candidate.findById(candidateId).select(
      "+resumeData +resumeFileName +resumeFileSize +resumeContentType",
    );
    if (!candidate?.resumeData) {
      return res.status(404).json({ message: "No resume found for this candidate." });
    }

    res.setHeader("Content-Type", candidate.resumeContentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(candidate.resumeFileName || "resume.pdf")}"`);
    res.setHeader("Content-Length", candidate.resumeFileSize || candidate.resumeData.length);
    res.send(candidate.resumeData);
  } catch (error) {
    next(error);
  }
}
