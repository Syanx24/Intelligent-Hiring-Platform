import { randomUUID, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import AboutImage from "../models/AboutImage.js";
import {
  deleteCloudinaryAsset,
  isCloudinaryConfigured,
  uploadCloudinaryImage,
} from "../config/cloudinary.js";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function aboutImagesAdminRequired(req, res, next) {
  const expected = process.env.ABOUT_US_ADMIN_PASSWORD;
  if (!expected) {
    return res.status(503).json({ message: "About Us image management is not configured on the server." });
  }

  const provided = req.get("x-about-admin-password") || "";
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  if (
    expectedBytes.length !== providedBytes.length ||
    !timingSafeEqual(expectedBytes, providedBytes)
  ) {
    return res.status(401).json({ message: "The admin password is incorrect." });
  }
  next();
}

export function verifyAboutImagesAdmin(_req, res) {
  res.json({ verified: true });
}

export async function listAboutImages(_req, res, next) {
  try {
    const images = await AboutImage.find().sort({ createdAt: -1 }).lean();
    res.json(images);
  } catch (error) {
    next(error);
  }
}

export async function uploadAboutImage(req, res, next) {
  try {
    const { kind, memberId, fileName, fileData } = req.body ?? {};
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ message: "Image uploads are not configured. Add Cloudinary credentials to the API environment." });
    }
    if (!["profile", "profile-background", "background"].includes(kind)) {
      return res.status(400).json({ message: "Image type must be profile, profile-background, or background." });
    }
    if (kind !== "background" && (typeof memberId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(memberId))) {
      return res.status(400).json({ message: "A valid team member ID is required for profile images." });
    }

    const match = typeof fileData === "string"
      ? fileData.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([a-zA-Z0-9+/]+={0,2})$/i)
      : null;
    if (!match || !ALLOWED_IMAGE_TYPES.has(match[1].toLowerCase())) {
      return res.status(400).json({ message: "Choose a JPEG, PNG, WEBP, or GIF image." });
    }

    const buffer = Buffer.from(match[2], "base64");
    if (!buffer.length || buffer.length > MAX_IMAGE_SIZE) {
      return res.status(400).json({ message: "Images must be smaller than 3MB." });
    }

    const key = kind === "background" ? randomUUID() : memberId;
    const folder = kind === "background"
      ? "intelligent-hiring/about/backgrounds"
      : kind === "profile-background"
        ? "intelligent-hiring/about/profile-backgrounds"
        : "intelligent-hiring/about/profiles";
    const publicId = kind === "background"
      ? `background-${key}`
      : kind === "profile-background"
        ? `member-${memberId}-background`
        : `member-${memberId}`;
    let uploaded;
    try {
      uploaded = await uploadCloudinaryImage(buffer, { folder, publicId });
    } catch (error) {
      console.error("Cloudinary About Us image upload failed:", error.message);
      return res.status(502).json({ message: "Could not upload this image to Cloudinary." });
    }

    const image = await AboutImage.findOneAndUpdate(
      { kind, key },
      {
        $set: {
          memberId: kind === "background" ? "" : memberId,
          publicId: uploaded.public_id,
          secureUrl: uploaded.secure_url,
          fileName: typeof fileName === "string" ? fileName.slice(0, 200) : "",
        },
        $setOnInsert: { kind, key },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
}

export async function deleteAboutImage(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid image ID." });
    }
    const image = await AboutImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found." });

    await deleteCloudinaryAsset(image.secureUrl, "image");
    await image.deleteOne();
    res.json({ message: "Image deleted." });
  } catch (error) {
    next(error);
  }
}
