import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "JobDetail", required: true },
    candidateUser: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    githubUrl: { type: String, trim: true, default: "" },
    resumeUrl: { type: String, trim: true, default: "" },
    resumeFileName: { type: String, default: "", select: false },
    resumeFileSize: { type: Number, default: 0, select: false },
    resumeData: { type: Buffer, select: false },
    message: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["Applied", "Under review", "Interviewing", "Accepted", "Rejected", "New", "Reviewing", "Interview", "Hired"],
      default: "Applied",
    },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, email: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
