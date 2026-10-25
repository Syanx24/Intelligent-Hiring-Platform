import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["company"], default: "company", immutable: true },
    companyName: { type: String, trim: true, default: "" },
    companyWebsite: { type: String, trim: true, default: "" },
    companyInitials: { type: String, trim: true, default: "" },
    companyDescription: { type: String, trim: true, default: "" },
    companyLocation: { type: String, trim: true, default: "" },
    companyColor: { type: String, trim: true, default: "" },
    companySize: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

recruiterSchema.methods.toSafeJSON = function toSafeJSON() {
  const recruiter = this.toObject();
  delete recruiter.password;
  delete recruiter.__v;
  return recruiter;
};

export default mongoose.models.Recruiter || mongoose.model("Recruiter", recruiterSchema);
