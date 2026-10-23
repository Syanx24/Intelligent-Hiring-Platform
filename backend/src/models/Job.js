import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyInitials: { type: String, required: true, trim: true, maxlength: 6 },
    companyColor: { type: String, default: "#059669" },
    location: { type: String, required: true, trim: true },
    workplace: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "Hybrid",
    },
    type: { type: String, default: "Full-time" },
    category: { type: String, required: true, trim: true },
    salary: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    companyUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
