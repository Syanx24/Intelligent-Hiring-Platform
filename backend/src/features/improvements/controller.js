import mongoose from "mongoose";
import ImprovementPlan from "./models/ImprovementPlan.js";
import Sequence from "./models/Sequence.js";

async function nextPlanNumber() {
  try {
    const sequence = await Sequence.findOneAndUpdate(
      { _id: "improvement-plan" },
      { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return sequence.value;
  } catch (error) {
    if (error.code !== 11000) throw error;

    const sequence = await Sequence.findOneAndUpdate(
      { _id: "improvement-plan" },
      { $inc: { value: 1 } },
      { new: true },
    );
    if (!sequence) throw error;
    return sequence.value;
  }
}

export async function listPlans(_req, res, next) {
  try {
    const plans = await ImprovementPlan.find()
      .sort({ number: -1 })
      .limit(100)
      .lean();
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

    const normalizedTitle = title.trim();
    if (normalizedTitle.length > 120) {
      return res
        .status(400)
        .json({ message: "Plan titles must be 120 characters or fewer." });
    }

    const plan = await ImprovementPlan.create({
      number: await nextPlanNumber(),
      title: normalizedTitle,
    });
    res.status(201).json(plan);
  } catch (error) {
    next(error);
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
    if (!plan) {
      return res.status(404).json({ message: "Improvement not found." });
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
}

export async function deletePlan(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid improvement ID." });
    }

    const plan = await ImprovementPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Improvement not found." });
    }

    res.json({ message: "Improvement deleted." });
  } catch (error) {
    next(error);
  }
}
