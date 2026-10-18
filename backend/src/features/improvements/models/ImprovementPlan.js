import mongoose from "mongoose";

const improvementPlanSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true, min: 1 },
    status: {
      type: String,
      enum: ["Proposed", "Under review", "Planned", "In progress", "Completed"],
      default: "Proposed",
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
  },
  { timestamps: true },
);

export default mongoose.model("ImprovementPlan", improvementPlanSchema);
