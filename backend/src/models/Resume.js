import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    candidateUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      default: "resume.pdf",
    },
    fileSize: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      default: "application/pdf",
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Resume", resumeSchema);
