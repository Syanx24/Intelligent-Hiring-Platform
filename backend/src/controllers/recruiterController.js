import Recruiter from "../models/Recruiter.js";

export function getRecruiter(req, res) {
  res.json(req.user.toSafeJSON());
}

export async function updateRecruiterProfile(req, res, next) {
  try {
    const recruiter = req.user;
    const body = req.body ?? {};
    if (typeof body.name === "string" && body.name.trim()) recruiter.name = body.name.trim();
    if (typeof body.companyName === "string" && body.companyName.trim()) {
      recruiter.companyName = body.companyName.trim();
      recruiter.companyInitials = recruiter.companyName.slice(0, 4).toUpperCase();
    }
    if (body.companyWebsite !== undefined) recruiter.companyWebsite = String(body.companyWebsite).trim();
    if (body.companyDescription !== undefined) recruiter.companyDescription = String(body.companyDescription).trim();
    if (body.companyLocation !== undefined) recruiter.companyLocation = String(body.companyLocation).trim();
    if (body.companyColor !== undefined) recruiter.companyColor = String(body.companyColor).trim();
    if (body.companySize !== undefined) recruiter.companySize = String(body.companySize).trim();

    await recruiter.save();
    res.json({ message: "Profile updated successfully.", user: recruiter.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}
