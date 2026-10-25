import mongoose from "mongoose";
import ImprovementPlan from "./schema.js";

export async function listPlans(_req, res, next) {
  try {
    const plans = await ImprovementPlan.find().sort({ createdAt: -1, _id: -1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
}

export async function createPlan(req, res, next) {
  try {
    const { title } = req.body ?? {};
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "A plan title is required." });
    }
    if (title.trim().length > 120) {
      return res.status(400).json({ message: "Plan titles must be 120 characters or fewer." });
    }

    const plan = await ImprovementPlan.create({ title: title.trim() });
    return res.status(201).json(plan);
  } catch (error) {
    return next(error);
  }
}

export async function updatePlanCompletion(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid improvement ID." });
    }
    const { completed } = req.body ?? {};
    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "Completion must be true or false." });
    }

    const plan = await ImprovementPlan.findByIdAndUpdate(
      req.params.id,
      { status: completed ? "Completed" : "Proposed" },
      { new: true, runValidators: true },
    );
    if (!plan) return res.status(404).json({ message: "Improvement not found." });
    return res.json(plan);
  } catch (error) {
    return next(error);
  }
}

