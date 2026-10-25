import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["candidate"], default: "candidate", immutable: true },
    githubUrl: { type: String, trim: true, default: "" },
    headline: { type: String, trim: true, default: "" },
    portfolioUrl: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    resumeUrl: { type: String, trim: true, default: "" },
    resumeFileName: { type: String, default: "", select: false },
    resumeFileSize: { type: Number, default: 0, select: false },
    resumeContentType: { type: String, default: "application/pdf", select: false },
    resumeData: { type: Buffer, select: false },
    experienceYears: { type: Number, min: 0, default: 0 },
    skills: { type: [String], default: [] },
  },
  { timestamps: true },
);

candidateSchema.methods.toSafeJSON = function toSafeJSON() {
  const candidate = this.toObject();
  delete candidate.password;
  delete candidate.resumeData;
  delete candidate.resumeFileName;
  delete candidate.resumeFileSize;
  delete candidate.resumeContentType;
  delete candidate.__v;
  return candidate;
};

export default mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
