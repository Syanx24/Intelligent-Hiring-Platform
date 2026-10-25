import bcrypt from "bcryptjs";
import Candidate from "../models/Candidate.js";
import Recruiter from "../models/Recruiter.js";
import { cleanEmail, generateToken, isValidEmail } from "./authHelpers.js";

const passwordRules = [
  { pattern: /^.{6,}$/, message: "Password must be at least 6 characters long." },
  { pattern: /[^A-Za-z0-9]/, message: "Password must include at least one special character." },
  { pattern: /[A-Z]/, message: "Password must include at least one uppercase letter." },
  { pattern: /[a-z]/, message: "Password must include at least one lowercase letter." },
  { pattern: /[0-9]/, message: "Password must include at least one number." },
];

function normalizeRole(role) {
  if (role === "recruiter") return "company";
  return role || "candidate";
}

function validName(name) {
  return (
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 100 &&
    /^[\p{L}\p{M} .'-]+$/u.test(name.trim())
  );
}

function validGithubLink(link) {
  return (
    typeof link === "string" &&
    /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9](?:-?[A-Za-z0-9]){0,38}\/?$/i.test(link.trim())
  );
}

function registrationErrors({ name, email, password, role, githubUrl }) {
  const errors = [];
  if (!validName(name)) errors.push("Invalid name.");
  if (typeof email !== "string" || !isValidEmail(email.trim())) {
    errors.push("Invalid email address.");
  }
  if (role === "candidate" && githubUrl && !validGithubLink(githubUrl)) {
    errors.push("Invalid GitHub link. Use https://github.com/username.");
  }
  if (typeof password !== "string" || !password) {
    errors.push("Password is required.");
  } else {
    for (const rule of passwordRules) {
      if (!rule.pattern.test(password)) errors.push(rule.message);
    }
  }
  return errors;
}

export async function register(req, res, next) {
  try {
    const body = req.body ?? {};
    const role = normalizeRole(body.role);
    if (!["candidate", "company"].includes(role)) {
      return res.status(400).json({
        message: "Please correct the following errors.",
        errors: ["Role must be candidate or recruiter."],
      });
    }

    const errors = registrationErrors({ ...body, role });
    if (errors.length) {
      return res.status(400).json({ message: "Please correct the following errors.", errors });
    }

    const email = cleanEmail(body.email);
    const [existingCandidate, existingRecruiter] = await Promise.all([
      Candidate.exists({ email }),
      Recruiter.exists({ email }),
    ]);
    if (existingCandidate || existingRecruiter) {
      return res.status(409).json({
        message: "Please correct the following errors.",
        errors: ["An account with this email already exists."],
      });
    }

    const accountData = {
      name: body.name.trim(),
      email,
      password: await bcrypt.hash(body.password, 10),
    };

    let account;
    if (role === "candidate") {
      account = await Candidate.create({
        ...accountData,
        headline: typeof body.headline === "string" ? body.headline.trim() : "",
        githubUrl: typeof body.githubUrl === "string" ? body.githubUrl.trim() : "",
      });
    } else {
      const companyName =
        (typeof body.companyName === "string" && body.companyName.trim()) || body.name.trim();
      account = await Recruiter.create({
        ...accountData,
        companyName,
        companyWebsite: typeof body.companyWebsite === "string" ? body.companyWebsite.trim() : "",
        companyInitials: companyName.slice(0, 4).toUpperCase(),
      });
    }

    return res.status(201).json({
      message: "Account registered successfully.",
      token: generateToken(account),
      user: account.toSafeJSON(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Please correct the following errors.",
        errors: ["An account with this email already exists."],
      });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email: rawEmail, password } = req.body ?? {};
    const role = normalizeRole(req.body?.role);
    if (!["candidate", "company"].includes(role)) {
      return res.status(400).json({ message: "Role must be candidate or recruiter." });
    }
    if (typeof rawEmail !== "string" || !isValidEmail(rawEmail.trim())) {
      return res.status(404).json({ message: "Email not present." });
    }

    const email = cleanEmail(rawEmail);
    const Account = role === "candidate" ? Candidate : Recruiter;
    const OtherAccount = role === "candidate" ? Recruiter : Candidate;
    const account = await Account.findOne({ email }).select("+password");
    if (!account) {
      const accountInOtherRole = await OtherAccount.exists({ email });
      if (accountInOtherRole) {
        return res.status(401).json({
          message: `This email is registered as a ${role === "candidate" ? "recruiter" : "candidate"}.`,
        });
      }
      return res.status(404).json({ message: "Email not present." });
    }

    if (typeof password !== "string" || !(await bcrypt.compare(password, account.password))) {
      return res.status(401).json({ message: "Wrong password." });
    }

    return res.json({
      message: "Login successful.",
      token: generateToken(account),
      user: account.toSafeJSON(),
    });
  } catch (error) {
    return next(error);
  }
}
