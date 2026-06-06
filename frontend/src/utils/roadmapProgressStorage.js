const STORAGE_PREFIX = "careerpilot-roadmap-progress";

const slugify = (role) =>
  role
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function getRoadmapProgressPercent(role) {
  if (!role) return 0;

  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}-${slugify(role)}`);
    if (!stored) return 0;

    const progress = JSON.parse(stored);
    const topicKeys = Object.keys(progress.topics || {}).filter((k) => progress.topics[k]);
    const projectKeys = Object.keys(progress.projects || {}).filter((k) => progress.projects[k]);
    const stageKeys = Object.keys(progress.stages || {}).filter((k) => progress.stages[k]);

    const completed = topicKeys.length + projectKeys.length;
    const total = completed + 10;
    const stageBonus = stageKeys.length * 5;

    return Math.min(100, Math.round((completed / Math.max(total, 1)) * 80 + stageBonus));
  } catch {
    return 0;
  }
}
