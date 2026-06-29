import { loadDraft, mergeWithDefaults } from "./resumeDraft";

export function buildResumeText(draft, userId) {
  const data = draft || mergeWithDefaults(loadDraft(userId));
  const { personal } = data;

  return [
    personal?.name,
    personal?.jobTitle,
    personal?.location,
    data.summary,
    data.skills,
    data.experience,
    data.education,
    data.projects,
    data.achievements,
    data.certifications,
    data.responsibilities,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function hasResumeContent(userId) {
  const text = buildResumeText(null, userId);
  return text.replace(/\s/g, "").length > 50;
}
