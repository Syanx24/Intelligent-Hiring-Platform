import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { Router } from "express";
import User from "../models/User.js";

const router = Router();
const scrypt = promisify(scryptCallback);
const tokenSecret = process.env.AUTH_TOKEN_SECRET || randomBytes(32).toString("hex");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex || !/^[a-f\d]+$/i.test(hashHex)) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function issueToken(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user._id.toString(),
    email: user.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })).toString("base64url");
  const signature = createHmac("sha256", tokenSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function sendAuthResponse(res, user, status = 200) {
  res.status(status).json({
    token: issueToken(user),
    user: { id: user._id, name: user.name, email: user.email },
  });
}

router.post("/signup", async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
    }
    if (!emailPattern.test(email) || email.length > 254) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    return sendAuthResponse(res, user, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Please check your account details and try again." });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!emailPattern.test(email) || !password) {
      return res.status(400).json({ message: "Enter your email and password." });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    return sendAuthResponse(res, user);
  } catch (error) {
    return next(error);
  }
});

export default router;
