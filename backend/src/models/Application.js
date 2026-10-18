import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    resumeUrl: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["New", "Reviewing", "Interview", "Rejected", "Hired"],
      default: "New",
    },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, email: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
