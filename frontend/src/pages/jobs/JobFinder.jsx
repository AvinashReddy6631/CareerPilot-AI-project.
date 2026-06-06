import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../../components/dashboard/PageShell";
import JobCard from "../../components/jobs/JobCard";
import JobDetailPanel from "../../components/jobs/JobDetailPanel";
import { SOURCE_CONFIG } from "../../components/jobs/SourceBadge";
import {
  searchJobs,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  trackApplication,
} from "../../services/jobService";
import { buildResumeText, hasResumeContent } from "../../utils/resumeText";

const SOURCES = Object.keys(SOURCE_CONFIG);

export default function JobFinder() {
  const [tab, setTab] = useState("job");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeSources, setActiveSources] = useState(SOURCES);
  const [matchEnabled, setMatchEnabled] = useState(hasResumeContent());
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState("");

  const savedIds = new Set(savedJobs.map((s) => s.jobId));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchSaved = useCallback(async () => {
    try {
      const res = await getSavedJobs();
      setSavedJobs(res.data.savedJobs || []);
    } catch {
      /* ignore */
    }
  }, []);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await searchJobs({
        query,
        location,
        type: tab,
        sources: activeSources,
        resumeText: matchEnabled ? buildResumeText() : "",
        limit: 30,
      });
      const results = res.data.jobs || [];
      setJobs(results);
      setTotal(res.data.total || 0);
      setSelectedJob((prev) => {
        if (prev && results.find((j) => j.id === prev.id)) return prev;
        return results[0] || null;
      });
    } catch {
      setError("Failed to load jobs. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [query, location, tab, activeSources, matchEnabled]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  useEffect(() => {
    runSearch();
  }, [tab, activeSources, matchEnabled]);

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch();
  };

  const toggleSource = (source) => {
    setActiveSources((prev) => {
      if (prev.includes(source)) {
        const next = prev.filter((s) => s !== source);
        return next.length ? next : SOURCES;
      }
      return [...prev, source];
    });
  };

  const handleSave = async (job) => {
    await saveJob({
      jobId: job.id,
      source: job.source,
      company: job.company,
      role: job.role,
      location: job.location,
      salary: job.salary,
      type: job.type,
      applyUrl: job.applyUrl,
      matchScore: job.matchScore,
      description: job.description,
      skills: job.skills,
    });
    await fetchSaved();
    showToast("Job saved!");
  };

  const handleUnsave = async (job) => {
    const saved = savedJobs.find((s) => s.jobId === job.id);
    if (saved) {
      await removeSavedJob(saved._id);
      await fetchSaved();
      showToast("Removed from saved");
    }
  };

  const handleTrack = async (job) => {
    await trackApplication(
      {
        jobId: job.id,
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        source: job.source,
        applyUrl: job.applyUrl,
        matchScore: job.matchScore,
      },
      "applied"
    );
    showToast("Added to Application Tracker");
  };

  return (
    <PageShell
      title="Job & Internship Discovery"
      description="Search across LinkedIn, Internshala, Unstop, Indeed, and Naukri — with resume match scoring."
      action={
        <Link
          to="/applications"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Application Tracker →
        </Link>
      }
    >
      {/* Source strip */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Sources
        </span>
        {SOURCES.map((source) => (
          <button
            key={source}
            type="button"
            onClick={() => toggleSource(source)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSources.includes(source)
                ? SOURCE_CONFIG[source].className + " ring-2 ring-offset-1 ring-current/20"
                : "bg-slate-100 text-slate-400 opacity-50 dark:bg-slate-800"
            }`}
          >
            {SOURCE_CONFIG[source].label}
          </button>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="dash-card mb-5 overflow-hidden">
        <div className="flex border-b border-slate-200/80 dark:border-slate-800">
          {[
            { id: "job", label: "Jobs", count: tab === "job" ? total : null },
            { id: "internship", label: "Internships", count: tab === "internship" ? total : null },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSelectedJob(null);
              }}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors sm:flex-none sm:px-8 ${
                tab === t.id
                  ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs dark:bg-brand-500/20">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role or keyword
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Frontend Developer, Data Analyst, SDE Intern"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:w-48">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={matchEnabled}
              onChange={(e) => setMatchEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Resume match scoring
            </span>
          </label>
          {matchEnabled && !hasResumeContent() && (
            <Link
              to="/resume-builder"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Build your resume first →
            </Link>
          )}
          {savedJobs.length > 0 && (
            <span className="text-xs text-slate-400">
              {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="dash-card animate-pulse p-5">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="dash-card flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                No {tab === "internship" ? "internships" : "jobs"} found
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try different keywords, location, or enable more sources
              </p>
            </div>
          ) : (
            jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <JobCard
                  job={job}
                  isSaved={savedIds.has(job.id)}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                  onTrack={handleTrack}
                  onSelect={setSelectedJob}
                  selected={selectedJob?.id === job.id}
                />
              </motion.div>
            ))
          )}
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <JobDetailPanel job={selectedJob} />
        </div>
      </div>

      {/* Mobile detail drawer */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedJob(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-slate-900">
            <JobDetailPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-slate-900">
          {toast}
        </div>
      )}
    </PageShell>
  );
}
