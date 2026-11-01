import mongoose from "mongoose";
import Candidate from "../models/Candidate.js";
import Recruiter from "../models/Recruiter.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

function detectContentType(fileData, fileName = "") {
  const match = fileData.match(/^data:([^;]+);base64,/i);
  if (match && ALLOWED_MIME_TYPES.has(match[1].toLowerCase())) {
    return match[1].toLowerCase();
  }

  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".png")) return "image/png";
  if (lowerName.endsWith(".webp")) return "image/webp";
  if (lowerName.endsWith(".gif")) return "image/gif";
  if (lowerName.endsWith(".svg")) return "image/svg+xml";
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";

  return null;
}

export async function uploadAvatar(req, res, next) {
  try {
    const { fileName, fileData } = req.body ?? {};
    if (typeof fileData !== "string" || !fileData) {
      return res.status(400).json({ message: "Please select a valid image file." });
    }

    const safeFileName = typeof fileName === "string" ? fileName.trim() : "avatar.jpg";
    const contentType = detectContentType(fileData, safeFileName);
    const hasImagePrefix = fileData.startsWith("data:image/");
    const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => safeFileName.toLowerCase().endsWith(ext));

    if (!contentType && !hasImagePrefix && !hasAllowedExt) {
      return res.status(400).json({
        message: "Only JPEG, PNG, WEBP, GIF, or SVG image files are supported.",
      });
    }

    const base64Data = fileData.replace(/^data:[^;]+;base64,/i, "");
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length === 0) {
      return res.status(400).json({ message: "Uploaded image appears to be empty." });
    }

    // Maximum 3MB file size limit for avatars
    if (buffer.length > 3 * 1024 * 1024) {
      return res.status(400).json({ message: "Image files cannot exceed 3MB." });
    }

    const user = req.user;
    const finalContentType = contentType || "image/jpeg";

    user.avatarData = buffer;
    user.avatarFileName = safeFileName;
    user.avatarContentType = finalContentType;
    user.avatarUrl = `/api/avatars/${user.role}/${user._id}`;
    await user.save();

    res.json({
      message: "Profile photo uploaded successfully.",
      avatarUrl: user.avatarUrl,
      fileName: user.avatarFileName,
      fileSize: buffer.length,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function removeAvatar(req, res, next) {
  try {
    const user = req.user;
    user.avatarData = undefined;
    user.avatarFileName = "";
    user.avatarContentType = "image/jpeg";
    user.avatarUrl = "";
    await user.save();

    res.json({
      message: "Profile photo removed successfully.",
      avatarUrl: "",
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function streamAvatar(req, res, next) {
  try {
    const { role, id } = req.params;
    const targetId = id || req.params.userId;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    let user = null;
    const selectFields = "+avatarData +avatarFileName +avatarContentType";

    if (role === "candidate") {
      user = await Candidate.findById(targetId).select(selectFields);
    } else if (role === "company" || role === "recruiter") {
      user = await Recruiter.findById(targetId).select(selectFields);
    } else {
      user =
        (await Candidate.findById(targetId).select(selectFields)) ||
        (await Recruiter.findById(targetId).select(selectFields));
    }

    if (!user?.avatarData) {
      return res.status(404).json({ message: "No profile photo found." });
    }

    res.setHeader("Content-Type", user.avatarContentType || "image/jpeg");
    res.setHeader("Content-Length", user.avatarData.length);
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=43200");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(user.avatarFileName || "avatar.jpg")}"`);
    res.send(user.avatarData);
  } catch (error) {
    next(error);
  }
}
