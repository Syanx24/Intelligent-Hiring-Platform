import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address."],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["candidate", "company"],
      required: true,
      default: "candidate",
    },
    avatar: {
      type: String,
      default: "",
    },

    // Candidate Specific Profile Fields
    headline: {
      type: String,
      trim: true,
      default: "",
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Company Specific Profile Fields
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: "",
    },
    companyDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    companyLocation: {
      type: String,
      trim: true,
      default: "",
    },
    companyColor: {
      type: String,
      trim: true,
      default: "#059669",
    },
    companyInitials: {
      type: String,
      trim: true,
      default: "",
      maxlength: 4,
    },
    companySize: {
      type: String,
      trim: true,
      default: "10-50",
    },
  },
  { timestamps: true },
);

// Method to return public safe user JSON (excluding password)
userSchema.methods.toSafeJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model("User", userSchema);
