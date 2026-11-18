import mongoose from "mongoose";

const aboutImageSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["profile", "profile-background", "background"], required: true },
    key: { type: String, required: true, trim: true },
    memberId: { type: String, trim: true, default: "" },
    publicId: { type: String, required: true, trim: true },
    secureUrl: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

aboutImageSchema.index({ kind: 1, key: 1 }, { unique: true });

export default mongoose.models.AboutImage || mongoose.model("AboutImage", aboutImageSchema);
