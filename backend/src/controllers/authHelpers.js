import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "northstar_intelligent_hiring_secure_jwt_token_secret_key_2026";

export function generateToken(account) {
  return jwt.sign(
    { userId: account._id, role: account.role, email: account.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function cleanEmail(email) {
  return email.trim().toLowerCase();
}
