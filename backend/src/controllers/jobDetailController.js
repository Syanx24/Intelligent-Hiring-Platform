import mongoose from "mongoose";
import Application from "../models/Application.js";
import JobDetail from "../models/JobDetail.js";

export async function listJobs(req, res, next) {
  try {
    const { search, category, workplace } = req.query;
    const filter = { status: { $ne: "Closed" } };

    if (category && category !== "All roles") filter.category = category;
    if (workplace) filter.workplace = workplace;
    if (search) {
      const expression = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { title: expression },
        { company: expression },
        { location: expression },
        { category: expression },
        { tags: expression },
      ];
    }

const jobs = await JobDetail.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

export async function getJob(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

const job = await JobDetail.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json(job);
  } catch (error) {
    next(error);
  }
}

export async function getMyCompanyJobs(req, res, next) {
  try {
const jobs = await JobDetail.find({ companyUser: req.user._id }).sort({ createdAt: -1 });

    // Attach application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        const jobObj = job.toObject();
        jobObj.applicantCount = applicantCount;
        return jobObj;
      }),
    );

    res.json(jobsWithCounts);
  } catch (error) {
    next(error);
  }
}

export async function createJob(req, res, next) {
  try {
    const {
      title,
      company,
      companyInitials,
      companyColor,
      location,
      workplace = "Remote",
      type = "Full-time",
      category,
      salary,
      description,
      tags = [],
      featured = false,
    } = req.body ?? {};

    if (!title || !category || !salary || !description) {
      return res.status(400).json({
        message: "Title, category, salary range, and description are required.",
      });
    }

    const companyName = company || req.user.companyName || req.user.name || "Engineering Team";
    const initials = companyInitials || req.user.companyInitials || companyName.slice(0, 4).toUpperCase();
    const color = companyColor || req.user.companyColor || "#059669";
    const loc = location || req.user.companyLocation || "Remote";

const job = await JobDetail.create({
      title: title.trim(),
      company: companyName.trim(),
      companyInitials: initials.trim(),
      companyColor: color,
      location: loc.trim(),
      workplace,
      type,
      category: category.trim(),
      salary: salary.trim(),
      description: description.trim(),
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      featured: Boolean(featured),
      companyUser: req.user._id,
      status: "Active",
    });

    res.status(201).json({
      message: "Job listing created successfully.",
      job,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

const job = await JobDetail.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Ownership check
    if (job.companyUser && job.companyUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this job listing." });
    }

    const body = req.body ?? {};
    if (body.title !== undefined) job.title = String(body.title).trim();
    if (body.company !== undefined) job.company = String(body.company).trim();
    if (body.companyInitials !== undefined) job.companyInitials = String(body.companyInitials).trim();
    if (body.companyColor !== undefined) job.companyColor = String(body.companyColor).trim();
    if (body.location !== undefined) job.location = String(body.location).trim();
    if (body.workplace !== undefined) job.workplace = body.workplace;
    if (body.type !== undefined) job.type = body.type;
    if (body.category !== undefined) job.category = String(body.category).trim();
    if (body.salary !== undefined) job.salary = String(body.salary).trim();
    if (body.description !== undefined) job.description = String(body.description).trim();
    if (body.status !== undefined) job.status = body.status;
    if (body.featured !== undefined) job.featured = Boolean(body.featured);
    if (body.tags !== undefined) {
      job.tags = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
        ? body.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }

    await job.save();

    res.json({
      message: "Job listing updated successfully.",
      job,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

const job = await JobDetail.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Ownership check
    if (job.companyUser && job.companyUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this job listing." });
    }

await JobDetail.findByIdAndDelete(req.params.id);
    // Delete associated applications
    await Application.deleteMany({ job: req.params.id });

    res.json({ message: "Job listing and associated applications deleted successfully." });
  } catch (error) {
    next(error);
  }
}
