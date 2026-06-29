const SKILL_DICTIONARY = [
  { term: "html", category: "technical" },
  { term: "css", category: "technical" },
  { term: "javascript", category: "technical" },
  { term: "typescript", category: "technical" },
  { term: "react", category: "technical" },
  { term: "next.js", category: "technical" },
  { term: "vue", category: "technical" },
  { term: "angular", category: "technical" },
  { term: "node.js", category: "technical" },
  { term: "express", category: "technical" },
  { term: "mongodb", category: "technical" },
  { term: "mysql", category: "technical" },
  { term: "postgresql", category: "technical" },
  { term: "redis", category: "technical" },
  { term: "git", category: "technical" },
  { term: "github", category: "technical" },
  { term: "docker", category: "technical" },
  { term: "kubernetes", category: "technical" },
  { term: "aws", category: "technical" },
  { term: "azure", category: "technical" },
  { term: "gcp", category: "technical" },
  { term: "tailwind css", category: "technical" },
  { term: "bootstrap", category: "technical" },
  { term: "python", category: "technical" },
  { term: "java", category: "technical" },
  { term: "c++", category: "technical" },
  { term: "c#", category: "technical" },
  { term: "flask", category: "technical" },
  { term: "django", category: "technical" },
  { term: "spring boot", category: "technical" },
  { term: "rest api", category: "technical" },
  { term: "graphql", category: "technical" },
  { term: "microservices", category: "technical" },
  { term: "machine learning", category: "technical" },
  { term: "deep learning", category: "technical" },
  { term: "data structures", category: "technical" },
  { term: "algorithms", category: "technical" },
  { term: "sql", category: "technical" },
  { term: "nosql", category: "technical" },
  { term: "figma", category: "technical" },
  { term: "ui/ux", category: "technical" },
  { term: "responsive design", category: "technical" },
  { term: "agile", category: "soft" },
  { term: "scrum", category: "soft" },
  { term: "problem solving", category: "soft" },
  { term: "team collaboration", category: "soft" },
  { term: "communication", category: "soft" },
  { term: "leadership", category: "soft" },
  { term: "project management", category: "soft" },
  { term: "analytical", category: "soft" },
  { term: "detail-oriented", category: "soft" },
];

const KEYWORD_PATTERNS = [
  "bachelor",
  "master",
  "b.tech",
  "b.e",
  "m.tech",
  "degree",
  "certification",
  "internship",
  "fresher",
  "entry level",
  "full stack",
  "frontend",
  "backend",
  "full-time",
  "remote",
  "hybrid",
  "portfolio",
  "open source",
  "ci/cd",
  "testing",
  "unit test",
  "api integration",
  "cross-functional",
  "stakeholder",
  "deadline",
  "scalable",
  "performance",
  "security",
  "cloud",
  "devops",
  "automation",
  "documentation",
  "code review",
  "version control",
  "object-oriented",
  "oop",
  "sdet",
  "qa",
  "selenium",
  "jira",
  "kanban",
];

const EXPERIENCE_PATTERNS = [
  { regex: /(\d+)\+?\s*(?:to|-)\s*(\d+)\s*years?/i, type: "range" },
  { regex: /(\d+)\+\s*years?/i, type: "min" },
  { regex: /minimum\s*(\d+)\s*years?/i, type: "min" },
  { regex: /at least\s*(\d+)\s*years?/i, type: "min" },
  { regex: /(\d+)\s*years?\s*(?:of\s*)?experience/i, type: "min" },
  { regex: /fresher|freshers|entry[\s-]level|no experience|0\s*years?/i, type: "entry" },
];

const normalize = (text) =>
  (text || "").toLowerCase().replace(/\s+/g, " ").trim();

const containsTerm = (text, term) => {
  if (term.includes(" ")) return text.includes(term);
  const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return re.test(text);
};

const extractJdSkills = (jdText) =>
  SKILL_DICTIONARY.filter(({ term }) => containsTerm(jdText, term));

const matchSkills = (jdText, resumeText) => {
  const required = extractJdSkills(jdText);
  const matched = required.filter(({ term }) => containsTerm(resumeText, term));
  const missing = required.filter(({ term }) => !containsTerm(resumeText, term));

  const score =
    required.length > 0
      ? Math.round((matched.length / required.length) * 100)
      : resumeText.length > 200
        ? 65
        : 40;

  return {
    score,
    total: required.length,
    matched: matched.map((s) => s.term),
    missing: missing.map((s) => s.term),
    matchedDetails: matched,
    missingDetails: missing,
  };
};

const extractJdKeywords = (jdText) => {
  const fromPatterns = KEYWORD_PATTERNS.filter((kw) => containsTerm(jdText, kw));

  const jdWords = jdText
    .replace(/[^a-z0-9\s/+.-]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const freq = {};
  jdWords.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  const frequent = Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .map(([word]) => word)
    .slice(0, 15);

  return [...new Set([...fromPatterns, ...frequent])];
};

const matchKeywords = (jdText, resumeText) => {
  const required = extractJdKeywords(jdText);
  const matched = required.filter((kw) => containsTerm(resumeText, kw));
  const missing = required.filter((kw) => !containsTerm(resumeText, kw));

  const score =
    required.length > 0
      ? Math.round((matched.length / required.length) * 100)
      : 50;

  return { score, total: required.length, matched, missing };
};

const parseExperienceRequirement = (jdText) => {
  for (const { regex, type } of EXPERIENCE_PATTERNS) {
    const match = jdText.match(regex);
    if (!match) continue;

    if (type === "entry") {
      return { type: "entry", minYears: 0, maxYears: 1, label: "Entry level / Fresher" };
    }
    if (type === "range") {
      return {
        type: "range",
        minYears: parseInt(match[1], 10),
        maxYears: parseInt(match[2], 10),
        label: `${match[1]}–${match[2]} years`,
      };
    }
    if (type === "min") {
      const years = parseInt(match[1], 10);
      return { type: "min", minYears: years, maxYears: years + 2, label: `${years}+ years` };
    }
  }

  if (/senior|lead|principal|architect/i.test(jdText)) {
    return { type: "senior", minYears: 5, maxYears: 10, label: "Senior (5+ years)" };
  }

  if (/intern/i.test(jdText)) {
    return { type: "intern", minYears: 0, maxYears: 1, label: "Internship" };
  }

  return { type: "general", minYears: 0, maxYears: 3, label: "General (0–3 years)" };
};

const estimateResumeExperience = (resumeText) => {
  let years = 0;
  const signals = [];

  const yearMatches = [...resumeText.matchAll(/(\d+)\+?\s*years?/gi)];
  yearMatches.forEach((m) => {
    const val = parseInt(m[1], 10);
    if (val <= 20) {
      years = Math.max(years, val);
      signals.push(`${val} years mentioned`);
    }
  });

  const internshipCount = (resumeText.match(/internship|intern\b/gi) || []).length;
  if (internshipCount > 0) {
    signals.push(`${internshipCount} internship reference(s)`);
    years = Math.max(years, 0.5);
  }

  const projectCount = (resumeText.match(/\bproject\b/gi) || []).length;
  if (projectCount >= 2) {
    signals.push(`${projectCount} project references`);
    years = Math.max(years, 1);
  }

  if (/fresher|recent graduate|passing out|pursuing/i.test(resumeText)) {
    signals.push("Fresher / student indicated");
    years = Math.min(years, 1);
  }

  if (years === 0 && resumeText.length > 300) {
    years = 1;
    signals.push("Experience section detected");
  }

  return { years: Math.round(years * 10) / 10, signals };
};

const matchExperience = (jdText, resumeText) => {
  const requirement = parseExperienceRequirement(jdText);
  const resume = estimateResumeExperience(resumeText);

  let score = 0;

  if (requirement.type === "entry" || requirement.type === "intern") {
    score = resume.years <= 1 ? 95 : resume.years <= 2 ? 75 : 50;
  } else if (requirement.type === "senior") {
    score =
      resume.years >= requirement.minYears
        ? 90
        : resume.years >= requirement.minYears - 2
          ? 60
          : 30;
  } else {
    const inRange =
      resume.years >= requirement.minYears && resume.years <= requirement.maxYears + 1;
    const close =
      resume.years >= requirement.minYears - 1 &&
      resume.years <= requirement.maxYears + 2;

    score = inRange ? 92 : close ? 70 : resume.years < requirement.minYears ? 45 : 65;
  }

  return {
    score,
    requirement: requirement.label,
    detected: resume.years === 0 ? "Not specified" : `${resume.years} year(s)`,
    signals: resume.signals,
  };
};

const buildStrengths = (skills, keywords, experience) => {
  const strengths = [];

  if (skills.matched.length > 0) {
    strengths.push(
      `Strong skill alignment: ${skills.matched.slice(0, 5).join(", ")}${skills.matched.length > 5 ? ` +${skills.matched.length - 5} more` : ""}`
    );
  }

  if (keywords.matched.length > 0) {
    strengths.push(
      `Resume uses ${keywords.matched.length} of ${keywords.total} key job-description terms`
    );
  }

  if (experience.score >= 80) {
    strengths.push(`Experience level aligns with role requirement (${experience.requirement})`);
  }

  if (skills.score >= 75) {
    strengths.push("Technical competency profile matches role expectations");
  }

  if (strengths.length === 0) {
    strengths.push("Resume uploaded successfully — optimization opportunities identified below");
  }

  return strengths.slice(0, 5);
};

const buildWeaknesses = (skills, keywords, experience) => {
  const weaknesses = [];

  if (skills.missing.length > 0) {
    weaknesses.push(
      `Missing ${skills.missing.length} required skill(s): ${skills.missing.slice(0, 4).join(", ")}${skills.missing.length > 4 ? "…" : ""}`
    );
  }

  if (keywords.missing.length > 0) {
    weaknesses.push(
      `Low keyword density for: ${keywords.missing.slice(0, 4).join(", ")}${keywords.missing.length > 4 ? "…" : ""}`
    );
  }

  if (experience.score < 70) {
    weaknesses.push(
      `Experience gap: role expects ${experience.requirement}, resume shows ${experience.detected}`
    );
  }

  if (skills.total === 0) {
    weaknesses.push("Job description lacks recognizable technical skills — add more detail to JD");
  }

  return weaknesses.slice(0, 5);
};

const buildRecommendations = (skills, keywords, experience, atsScore) => {
  const recs = [];

  if (skills.missing.length > 0) {
    recs.push({
      priority: "high",
      text: `Add a dedicated Skills section listing: ${skills.missing.slice(0, 6).join(", ")}`,
    });
  }

  if (keywords.missing.length > 0) {
    recs.push({
      priority: "high",
      text: `Mirror job-description language — incorporate terms like "${keywords.missing.slice(0, 3).join('", "')}" in your summary and experience bullets`,
    });
  }

  if (experience.score < 75) {
    recs.push({
      priority: "medium",
      text: `Highlight projects and internships that demonstrate readiness for ${experience.requirement} roles`,
    });
  }

  if (atsScore < 60) {
    recs.push({
      priority: "high",
      text: "Tailor this resume version specifically for this job — generic resumes score 40% lower on average",
    });
  }

  recs.push({
    priority: "medium",
    text: "Use quantified bullet points (e.g., 'Improved load time by 30%') to strengthen ATS parsing",
  });

  recs.push({
    priority: "low",
    text: "Export as PDF with standard fonts (Arial, Calibri) and avoid tables or graphics that ATS cannot parse",
  });

  return recs.slice(0, 6);
};

const analyzeAts = (resumeText, jobDescription) => {
  const resume = normalize(resumeText);
  const jd = normalize(jobDescription);

  const skills = matchSkills(jd, resume);
  const keywords = matchKeywords(jd, resume);
  const experience = matchExperience(jd, resume);

  const atsScore = Math.round(
    skills.score * 0.4 + keywords.score * 0.35 + experience.score * 0.25
  );

  const strengths = buildStrengths(skills, keywords, experience);
  const weaknesses = buildWeaknesses(skills, keywords, experience);
  const recommendations = buildRecommendations(skills, keywords, experience, atsScore);

  const grade =
    atsScore >= 85
      ? "Excellent"
      : atsScore >= 70
        ? "Good"
        : atsScore >= 55
          ? "Fair"
          : atsScore >= 40
            ? "Needs Work"
            : "Poor";

  return {
    atsScore,
    grade,
    skillMatch: {
      score: skills.score,
      matched: skills.matched,
      missing: skills.missing,
      total: skills.total,
      matchedCount: skills.matched.length,
    },
    keywordMatch: {
      score: keywords.score,
      matched: keywords.matched,
      missing: keywords.missing,
      total: keywords.total,
      matchedCount: keywords.matched.length,
    },
    experienceMatch: {
      score: experience.score,
      requirement: experience.requirement,
      detected: experience.detected,
      signals: experience.signals,
    },
    strengths,
    weaknesses,
    missingKeywords: [...new Set([...skills.missing, ...keywords.missing])],
    recommendations,
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    totalKeywords: skills.total,
    matchedCount: skills.matched.length,
  };
};

module.exports = { analyzeAts };
