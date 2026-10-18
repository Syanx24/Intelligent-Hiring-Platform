import mongoose from "mongoose";
import Job from "../models/Job.js";

export async function listJobs(req, res, next) {
  try {
    const { search, category, workplace } = req.query;
    const filter = {};

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

    const jobs = await Job.find(filter).sort({ featured: -1, createdAt: -1 });
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

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json(job);
  } catch (error) {
    next(error);
  }
}
