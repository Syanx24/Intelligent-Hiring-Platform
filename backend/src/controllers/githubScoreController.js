import { githubScoreTestCase } from "../models/githubScore.js";

export function getGithubScoreTestCase(_req, res) {
  res.json({
    ...githubScoreTestCase,
    evaluation: { ...githubScoreTestCase.evaluation },
    note: "Demo score only. This sample is not linked to the candidate profile.",
  });
}
