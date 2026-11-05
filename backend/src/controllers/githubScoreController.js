import { githubScoreTestCase } from "../models/githubScore.js";
import GithubAnalysis from "../models/githubScore.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

export async function getMyGithubScore(req, res, next) {
  try {
    const score = await GithubAnalysis.findOne({ candidateId: req.user._id }).lean();
    res.json({ score: score || null });
  } catch (error) {
    next(error);
  }
}

export async function refreshGithubScore(candidate) {
  const githubUrl = candidate.githubUrl?.trim();
  if (!githubUrl) {
    await GithubAnalysis.deleteOne({ candidateId: candidate._id });
    return null;
  }

  try {
    const python = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
    const script = fileURLToPath(new URL("../features/github/fetchScore.py", import.meta.url));
    const { stdout } = await execFileAsync(python, [script, githubUrl, "--schema"], {
      timeout: 180000,
      maxBuffer: 1024 * 1024,
      env: process.env,
    });
    const result = JSON.parse(stdout.trim());
    if (!result.evaluation || result.evaluation.evidenceScore == null) {
      await GithubAnalysis.deleteOne({ candidateId: candidate._id });
      return null;
    }
    return await GithubAnalysis.findOneAndUpdate(
      { candidateId: candidate._id },
      {
        $set: {
          githubUsername: result.githubUsername,
          githubUrl: result.githubUrl || githubUrl,
          ...result.evaluation,
          status: "completed",
          analyzedAt: result.analyzedAt ? new Date(result.analyzedAt) : new Date(),
          analysisVersion: "1.0",
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
  } catch (error) {
    console.error("GitHub score generation failed:", error.message);
    await GithubAnalysis.deleteOne({ candidateId: candidate._id });
    return null;
  }
}

export function getGithubScoreTestCase(_req, res) {
  res.json({
    ...githubScoreTestCase,
    evaluation: { ...githubScoreTestCase.evaluation },
    note: "Demo score only. This sample is not linked to the candidate profile.",
  });
}
