import StageCard from "./StageCard";

function getStageProgress(stage, stageIndex, progress) {
  const topicCount = stage.topics.length;
  const projectCount = stage.projects.length;
  const total = topicCount + projectCount;
  if (!total) return 0;

  let done = 0;
  stage.topics.forEach((_, ti) => {
    if (progress.topics[`${stageIndex}-${ti}`]) done++;
  });
  stage.projects.forEach((_, pi) => {
    if (progress.projects[`${stageIndex}-${pi}`]) done++;
  });

  return Math.round((done / total) * 100);
}

export default function RoadmapTimeline({
  stages,
  progress,
  onToggleTopic,
  onToggleProject,
  onToggleStage,
}) {
  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Learning Timeline</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click checkboxes to track progress. Complete milestones as you finish each month.
          </p>
        </div>
      </div>

      <div className="space-y-0">
        {stages.map((stage, index) => {
          const stageProgress = getStageProgress(stage, index, progress);
          const isStageComplete = !!progress.stages[index];

          return (
            <StageCard
              key={index}
              stage={stage}
              stageIndex={index}
              isLast={index === stages.length - 1}
              isStageComplete={isStageComplete}
              stageProgress={stageProgress}
              progress={progress}
              onToggleTopic={onToggleTopic}
              onToggleProject={onToggleProject}
              onToggleStage={onToggleStage}
            />
          );
        })}
      </div>
    </div>
  );
}
