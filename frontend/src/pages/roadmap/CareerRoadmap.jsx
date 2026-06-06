import { useState, useMemo } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../../components/dashboard/PageShell";
import RoadmapOverview from "../../components/roadmap/RoadmapOverview";
import RoadmapTimeline from "../../components/roadmap/RoadmapTimeline";
import useRoadmapProgress from "../../hooks/useRoadmapProgress";
import { normalizeRoadmapResponse } from "../../utils/roadmapEnricher";

const SUGGESTED_ROLES = [
  "Frontend Developer",
  "AI / ML Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "Backend Developer",
];

export default function CareerRoadmap() {
  const [role, setRole] = useState("");
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRole = roadmapData?.role || "";
  const { progress, toggleTopic, toggleProject, toggleStage, resetProgress, computeStats } =
    useRoadmapProgress(activeRole);

  const stats = useMemo(
    () => computeStats(roadmapData?.stages),
    [computeStats, roadmapData?.stages, progress]
  );

  const generateRoadmap = async (targetRole) => {
    const trimmed = (targetRole ?? role).trim();
    if (!trimmed) {
      setError("Please enter a career role to generate your roadmap.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/roadmap/generate", {
        role: trimmed,
      });

      const normalized = normalizeRoadmapResponse(res.data);
      if (!normalized) {
        setError("Received an empty roadmap. Please try again.");
        return;
      }

      setRoadmapData(normalized);
      setRole(trimmed);
    } catch (err) {
      console.error(err);
      setError("Failed to generate roadmap. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateRoadmap();
  };

  return (
    <PageShell
      title="Career Roadmap"
      description="Your personalized learning path — from beginner to job-ready, one milestone at a time."
    >
      {/* Hero search */}
      <div className="dash-card relative mb-8 overflow-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 auth-grid-bg opacity-50" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-brand-500/15 to-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 max-w-xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
              What do you want to become?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter any role and get a month-by-month plan with topics, projects, courses, and certifications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="e.g. Frontend Developer, AI Engineer..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-ring w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                  Generate Roadmap
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400">Popular:</span>
            {SUGGESTED_ROLES.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setRole(suggestion);
                  generateRoadmap(suggestion);
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!roadmapData && !loading && (
        <div className="dash-card flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-500/25">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-white">
              <path d="M3 12h4l3-8 4 16 3-8h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
            Your roadmap starts here
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Enter a career role above to get a visual, month-by-month learning plan with topics, projects, resources, and a job-readiness timeline.
          </p>
          <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {[
              { label: "Topics", icon: "📚" },
              { label: "Projects", icon: "🛠️" },
              { label: "Resources", icon: "🎓" },
              { label: "Job Ready", icon: "🚀" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="text-lg">{item.icon}</span>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="dash-card h-40 animate-pulse lg:col-span-5" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-7">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="dash-card h-28 animate-pulse" />
              ))}
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="dash-card h-48 animate-pulse" />
          ))}
        </div>
      )}

      {/* Roadmap content */}
      <AnimatePresence mode="wait">
        {roadmapData && !loading && (
          <motion.div
            key={roadmapData.role}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 flex items-center justify-end">
              <button
                type="button"
                onClick={resetProgress}
                className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              >
                Reset progress
              </button>
            </div>

            <RoadmapOverview role={roadmapData.role} meta={roadmapData.meta} stats={stats} />
            <RoadmapTimeline
              stages={roadmapData.stages}
              progress={progress}
              onToggleTopic={toggleTopic}
              onToggleProject={toggleProject}
              onToggleStage={toggleStage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
