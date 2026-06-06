import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "careerpilot-roadmap-progress";

const slugify = (role) =>
  role
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const emptyProgress = () => ({
  topics: {},
  projects: {},
  stages: {},
});

export default function useRoadmapProgress(role) {
  const [progress, setProgress] = useState(emptyProgress);

  const storageKey = role ? `${STORAGE_PREFIX}-${slugify(role)}` : null;

  useEffect(() => {
    if (!storageKey) {
      setProgress(emptyProgress());
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      setProgress(stored ? JSON.parse(stored) : emptyProgress());
    } catch {
      setProgress(emptyProgress());
    }
  }, [storageKey]);

  const persist = useCallback(
    (next) => {
      setProgress(next);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }
    },
    [storageKey]
  );

  const toggleTopic = useCallback(
    (stageIndex, topicIndex) => {
      const key = `${stageIndex}-${topicIndex}`;
      persist({
        ...progress,
        topics: { ...progress.topics, [key]: !progress.topics[key] },
      });
    },
    [progress, persist]
  );

  const toggleProject = useCallback(
    (stageIndex, projectIndex) => {
      const key = `${stageIndex}-${projectIndex}`;
      persist({
        ...progress,
        projects: { ...progress.projects, [key]: !progress.projects[key] },
      });
    },
    [progress, persist]
  );

  const toggleStage = useCallback(
    (stageIndex) => {
      persist({
        ...progress,
        stages: { ...progress.stages, [stageIndex]: !progress.stages[stageIndex] },
      });
    },
    [progress, persist]
  );

  const resetProgress = useCallback(() => {
    persist(emptyProgress());
  }, [persist]);

  const computeStats = useCallback(
    (stages) => {
      if (!stages?.length) {
        return { completedTopics: 0, totalTopics: 0, completedProjects: 0, totalProjects: 0, overallPercent: 0, jobReadinessScore: 0 };
      }

      let totalTopics = 0;
      let completedTopics = 0;
      let totalProjects = 0;
      let completedProjects = 0;

      stages.forEach((stage, si) => {
        stage.topics.forEach((_, ti) => {
          totalTopics++;
          if (progress.topics[`${si}-${ti}`]) completedTopics++;
        });
        stage.projects.forEach((_, pi) => {
          totalProjects++;
          if (progress.projects[`${si}-${pi}`]) completedProjects++;
        });
      });

      const totalItems = totalTopics + totalProjects;
      const completedItems = completedTopics + completedProjects;
      const overallPercent = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

      const completedStages = stages.filter((_, si) => progress.stages[si]).length;
      const stagePercent = Math.round((completedStages / stages.length) * 100);
      const jobReadinessScore = Math.round(overallPercent * 0.6 + stagePercent * 0.4);

      return {
        completedTopics,
        totalTopics,
        completedProjects,
        totalProjects,
        completedStages,
        totalStages: stages.length,
        overallPercent,
        jobReadinessScore,
      };
    },
    [progress]
  );

  return {
    progress,
    toggleTopic,
    toggleProject,
    toggleStage,
    resetProgress,
    computeStats,
  };
}
