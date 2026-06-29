const DEFAULT_RESOURCES = [
  { name: "MDN Web Docs", type: "docs", provider: "MDN", url: "https://developer.mozilla.org" },
  { name: "freeCodeCamp", type: "course", provider: "freeCodeCamp", url: "https://www.freecodecamp.org" },
];

const DEFAULT_PROJECT = (title) => ({
  name: `${title} Practice Project`,
  description: `Hands-on project to apply everything you learn about ${title}.`,
  difficulty: "Beginner",
});

export function enrichRoadmapFromStrings(roadmap, role) {
  const stages = roadmap.map((title, index) => ({
    month: index + 1,
    title,
    goal: `Master ${title} and apply it in real projects`,
    topics: [
      `${title} fundamentals`,
      `Core concepts of ${title}`,
      `Best practices in ${title}`,
      `Common patterns & tools`,
    ],
    projects: [DEFAULT_PROJECT(title)],
    resources: DEFAULT_RESOURCES,
    certification: null,
  }));

  return {
    role,
    roadmap,
    stages,
    meta: {
      estimatedMonths: stages.length,
      jobReadinessMonth: stages.length,
      totalTopics: stages.reduce((s, st) => s + st.topics.length, 0),
      totalProjects: stages.length,
      totalResources: stages.length * DEFAULT_RESOURCES.length,
      certifications: [],
    },
  };
}

export function normalizeRoadmapResponse(data) {
  if (data.stages?.length) {
    return {
      role: data.role,
      roadmap: data.roadmap || data.stages.map((s) => s.title),
      stages: data.stages,
      meta: data.meta || {
        estimatedMonths: data.stages.length,
        jobReadinessMonth: data.stages.length,
        totalTopics: data.stages.reduce((s, st) => s + (st.topics?.length || 0), 0),
        totalProjects: data.stages.reduce((s, st) => s + (st.projects?.length || 0), 0),
        certifications: [],
      },
    };
  }

  if (data.roadmap?.length) {
    return enrichRoadmapFromStrings(data.roadmap, data.role);
  }

  return null;
}
