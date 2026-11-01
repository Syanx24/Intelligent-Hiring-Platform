import crypto from "crypto";
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

function getClientUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

function getCallbackUrl(req) {
  return (
    process.env.GITHUB_CALLBACK_URL ||
    `${req.protocol}://${req.get("host")}/api/auth/github/callback`
  );
}

export function getGithubAuthStatus(_req, res) {
  const configured = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  );
  return res.json({
    enabled: configured,
    clientId: configured ? process.env.GITHUB_CLIENT_ID : null,
  });
}

export function initiateGithubAuth(req, res) {
  const clientUrl = getClientUrl();
  const role = normalizeRole(req.query.role || "candidate");
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect(
      `${clientUrl}?oauth_error=${encodeURIComponent(
        "GitHub OAuth is not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to backend/.env",
      )}`,
    );
  }

  const state = Buffer.from(
    JSON.stringify({
      role,
      nonce: crypto.randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");

  const callbackUrl = getCallbackUrl(req);
  const githubAuthorizeUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthorizeUrl.searchParams.set("client_id", clientId);
  githubAuthorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  githubAuthorizeUrl.searchParams.set("scope", "read:user user:email");
  githubAuthorizeUrl.searchParams.set("state", state);

  return res.redirect(githubAuthorizeUrl.toString());
}

export async function githubAuthCallback(req, res, next) {
  const clientUrl = getClientUrl();
  const { code, state, error: oauthError, error_description: errorDescription } = req.query;

  if (oauthError) {
    return res.redirect(
      `${clientUrl}?oauth_error=${encodeURIComponent(
        errorDescription || "GitHub authorization was cancelled.",
      )}`,
    );
  }

  if (!code) {
    return res.redirect(
      `${clientUrl}?oauth_error=${encodeURIComponent("No authorization code received from GitHub.")}`,
    );
  }

  let requestedRole = "candidate";
  try {
    if (state) {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      if (decoded.role) requestedRole = normalizeRole(decoded.role);
    }
  } catch {
    // Ignore malformed state and default to candidate.
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(
        `${clientUrl}?oauth_error=${encodeURIComponent(
          tokenData.error_description || "Could not retrieve access token from GitHub.",
        )}`,
      );
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "Northstar-Hiring-App",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userRes.ok) {
      return res.redirect(
        `${clientUrl}?oauth_error=${encodeURIComponent("Could not load user profile from GitHub.")}`,
      );
    }

    const ghUser = await userRes.json();

    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "Northstar-Hiring-App",
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primary =
          emails.find((e) => e.primary && e.verified) ||
          emails.find((e) => e.verified) ||
          emails[0];
        if (primary?.email) email = primary.email;
      }
    }

    if (!email) {
      email = `${ghUser.login || ghUser.id}@users.noreply.github.com`;
    }
    email = cleanEmail(email);

    const githubIdStr = String(ghUser.id);
    let account = null;

    account = await Candidate.findOne({ githubId: githubIdStr });
    if (!account) {
      account = await Recruiter.findOne({ githubId: githubIdStr });
    }

    if (!account) {
      account = await Candidate.findOne({ email });
      if (account) {
        account.githubId = githubIdStr;
        account.authProvider = "github";
        if (!account.avatarUrl && ghUser.avatar_url) account.avatarUrl = ghUser.avatar_url;
        if (!account.githubUrl && ghUser.login) account.githubUrl = `https://github.com/${ghUser.login}`;
        await account.save();
      } else {
        account = await Recruiter.findOne({ email });
        if (account) {
          account.githubId = githubIdStr;
          account.authProvider = "github";
          if (!account.avatarUrl && ghUser.avatar_url) account.avatarUrl = ghUser.avatar_url;
          await account.save();
        }
      }
    }

    if (!account) {
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      const name = (ghUser.name && ghUser.name.trim()) || ghUser.login || "GitHub User";

      if (requestedRole === "candidate") {
        account = await Candidate.create({
          name,
          email,
          password: randomPassword,
          role: "candidate",
          authProvider: "github",
          githubId: githubIdStr,
          avatarUrl: ghUser.avatar_url || "",
          githubUrl: ghUser.login ? `https://github.com/${ghUser.login}` : "",
          headline: ghUser.bio ? ghUser.bio.slice(0, 100) : "",
          location: ghUser.location || "",
        });
      } else {
        const companyName = ghUser.company ? ghUser.company.replace(/^@/, "").trim() : `${name}'s Team`;
        account = await Recruiter.create({
          name,
          email,
          password: randomPassword,
          role: "company",
          authProvider: "github",
          githubId: githubIdStr,
          avatarUrl: ghUser.avatar_url || "",
          companyName,
          companyInitials: companyName.slice(0, 4).toUpperCase(),
          companyWebsite: ghUser.blog || "",
          companyLocation: ghUser.location || "",
        });
      }
    }

    const token = generateToken(account);
    return res.redirect(
      `${clientUrl}/?oauth_token=${encodeURIComponent(token)}&oauth_status=success`,
    );
  } catch (err) {
    console.error("GitHub OAuth Callback Error:", err);
    return res.redirect(
      `${clientUrl}?oauth_error=${encodeURIComponent("An error occurred during GitHub authentication.")}`,
    );
  }
}
