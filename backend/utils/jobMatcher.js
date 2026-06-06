const { analyzeAts } = require("./atsAnalyzer");

const computeMatchScore = (resumeText, job) => {
  if (!resumeText?.trim()) {
    return { matchScore: null, grade: null, matchedSkills: [], missingSkills: [] };
  }

  const jobDescription = [
    job.role,
    job.company,
    job.description,
    `Required skills: ${(job.skills || []).join(", ")}`,
    `Location: ${job.location}`,
    `Experience: ${job.experience || ""}`,
  ].join("\n");

  const analysis = analyzeAts(resumeText, jobDescription);

  return {
    matchScore: analysis.atsScore,
    grade: analysis.grade,
    matchedSkills: analysis.matchedSkills,
    missingSkills: analysis.missingSkills,
    skillMatch: analysis.skillMatch.score,
    keywordMatch: analysis.keywordMatch.score,
  };
};

module.exports = { computeMatchScore };
