import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "northstar_intelligent_hiring_secure_jwt_token_secret_key_2026";

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role = "candidate",
      companyName,
      companyWebsite,
      githubUrl,
      headline,
    } = req.body ?? {};

    // Input Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Please provide a valid name." });
    }
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
    if (!["candidate", "company"].includes(role)) {
      return res.status(400).json({ message: "Role must be candidate or company." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role,
    };

    if (role === "candidate") {
      userData.githubUrl = typeof githubUrl === "string" ? githubUrl.trim() : "";
      userData.headline = typeof headline === "string" ? headline.trim() : "";
    } else if (role === "company") {
      const cName = (companyName && typeof companyName === "string" ? companyName.trim() : "") || name.trim();
      userData.companyName = cName;
      userData.companyWebsite = typeof companyWebsite === "string" ? companyWebsite.trim() : "";
      userData.companyInitials = cName.slice(0, 4).toUpperCase();
    }

    const user = await User.create(userData);
    const token = generateToken(user);

    res.status(201).json({
      message: "Account registered successfully.",
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Role check if specified by client login portal
    if (role && user.role !== role) {
      return res.status(401).json({
        message: `This account is registered as a ${user.role}. Please log in via the ${user.role} portal.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.json(req.user.toSafeJSON());
}

export async function updateProfile(req, res, next) {
  try {
    const user = req.user;
    const body = req.body ?? {};

    if (body.name && typeof body.name === "string" && body.name.trim()) {
      user.name = body.name.trim();
    }

    if (user.role === "candidate") {
      if (body.headline !== undefined) user.headline = String(body.headline).trim();
      if (body.githubUrl !== undefined) user.githubUrl = String(body.githubUrl).trim();
      if (body.portfolioUrl !== undefined) user.portfolioUrl = String(body.portfolioUrl).trim();
      if (body.bio !== undefined) user.bio = String(body.bio).trim();
      if (body.location !== undefined) user.location = String(body.location).trim();
      if (body.resumeUrl !== undefined) user.resumeUrl = String(body.resumeUrl).trim();
      if (body.experienceYears !== undefined) user.experienceYears = Number(body.experienceYears) || 0;
      if (Array.isArray(body.skills)) {
        user.skills = body.skills.map((s) => String(s).trim()).filter(Boolean);
      }
    } else if (user.role === "company") {
      if (body.companyName !== undefined && String(body.companyName).trim()) {
        user.companyName = String(body.companyName).trim();
        user.companyInitials = user.companyName.slice(0, 4).toUpperCase();
      }
      if (body.companyWebsite !== undefined) user.companyWebsite = String(body.companyWebsite).trim();
      if (body.companyDescription !== undefined) user.companyDescription = String(body.companyDescription).trim();
      if (body.companyLocation !== undefined) user.companyLocation = String(body.companyLocation).trim();
      if (body.companyColor !== undefined) user.companyColor = String(body.companyColor).trim();
      if (body.companySize !== undefined) user.companySize = String(body.companySize).trim();
    }

    await user.save();

    res.json({
      message: "Profile updated successfully.",
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadResume(req, res, next) {
  try {
    const user = req.user;
    if (user.role !== "candidate") {
      return res.status(403).json({ message: "Only candidates can upload a CV." });
    }

    const { fileName, fileData } = req.body ?? {};
    if (!fileData || typeof fileData !== "string") {
      return res.status(400).json({ message: "Please provide a valid PDF resume file." });
    }

    // Validate that it's a PDF data URL or base64
    const isPdf =
      fileData.startsWith("data:application/pdf;base64,") ||
      fileData.startsWith("data:application/octet-stream;base64,") ||
      (fileName && fileName.toLowerCase().endsWith(".pdf"));

    if (!isPdf) {
      return res.status(400).json({ message: "Only PDF documents (.pdf) are allowed." });
    }

    // Extract base64 payload and check binary size (max 2MB = 2,097,152 bytes)
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (buffer.length > MAX_SIZE) {
      const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        message: `File size exceeds the 2MB limit (selected: ${sizeMb} MB). Please choose a smaller PDF.`,
      });
    }

    // Ensure uploads/resumes directory exists
    const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate safe clean filename
    const safeBaseName = (fileName || "resume")
      .replace(/\.pdf$/i, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const savedFileName = `${user._id}_${Date.now()}_${safeBaseName}.pdf`;
    const filePath = path.join(uploadsDir, savedFileName);

    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/resumes/${savedFileName}`;
    user.resumeUrl = fileUrl;
    await user.save();

    res.json({
      message: "CV uploaded successfully.",
      resumeUrl: fileUrl,
      fileName: fileName || `${safeBaseName}.pdf`,
      fileSize: buffer.length,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
}

