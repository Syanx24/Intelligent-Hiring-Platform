import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["candidate", "company"], default: "candidate", required: true },
    githubUrl: { type: String, trim: true, default: "" },
    headline: { type: String, trim: true, default: "" },
    portfolioUrl: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    resumeUrl: { type: String, trim: true, default: "" },
    experienceYears: { type: Number, min: 0, default: 0 },
    skills: { type: [String], default: [] },
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

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
