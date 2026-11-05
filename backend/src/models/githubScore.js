import mongoose from "mongoose";

// Demo fixture for recruiter score previews. This is not a candidate record.
export const githubScoreTestCase = Object.freeze({
  isDemo: true,
  githubUsername: "octocat",
  githubUrl: "https://github.com/octocat",
  evaluation: Object.freeze({
    projectEvidence: 86,
    technicalBreadth: 78,
    recentActivity: 92,
    collaborationEvidence: 84,
    originalProjectPortfolio: 88,
    evidenceScore: 86,
  }),
  status: "completed",
  analyzedAt: "2026-11-04T00:00:00.000Z",
  analysisVersion: "demo-1.0",
});

const githubAnalysisSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      unique: true,
    },
    githubUsername: String,
    githubUrl: String,
    projectEvidence: { type: Number, default: null },
    technicalBreadth: { type: Number, default: null },
    recentActivity: { type: Number, default: null },
    collaborationEvidence: { type: Number, default: null },
    originalProjectPortfolio: { type: Number, default: null },
    evidenceScore: { type: Number, default: null },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    analyzedAt: Date,
    analysisVersion: { type: String, default: "1.0" },
  },
  { timestamps: true },
);

export default mongoose.models.GithubAnalysis ||
  mongoose.model("GithubAnalysis", githubAnalysisSchema);
