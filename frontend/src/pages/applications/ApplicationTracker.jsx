import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/dashboard/PageShell";
import SourceBadge from "../../components/jobs/SourceBadge";
import MatchScoreBadge from "../../components/jobs/MatchScoreBadge";
import {
  getApplications,
  updateApplication,
  deleteApplication,
} from "../../services/jobService";

const COLUMNS = [
  { id: "saved", label: "Saved", color: "bg-slate-400", headerBg: "bg-slate-50 dark:bg-slate-800/60" },
  { id: "applied", label: "Applied", color: "bg-brand-500", headerBg: "bg-brand-50/80 dark:bg-brand-500/5" },
  { id: "screening", label: "Screening", color: "bg-violet-500", headerBg: "bg-violet-50/80 dark:bg-violet-500/5" },
  { id: "interview", label: "Interview", color: "bg-cyan-500", headerBg: "bg-cyan-50/80 dark:bg-cyan-500/5" },
  { id: "offer", label: "Offer", color: "bg-emerald-500", headerBg: "bg-emerald-50/80 dark:bg-emerald-500/5" },
  { id: "rejected", label: "Rejected", color: "bg-red-400", headerBg: "bg-red-50/80 dark:bg-red-500/5" },
];

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState(null);
  const [mutatingId, setMutatingId] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getApplications();
      setApplications(res.data.applications || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleStatusChange = async (id, status) => {
    const currentApplication = applications.find((application) => application._id === id);
    if (!currentApplication || currentApplication.status === status || mutatingId) return;

    setError("");
    setMutatingId(id);
    try {
      const res = await updateApplication(id, { status });
      const updatedApplication = res.data.application;
      setApplications((prev) =>
        prev.map((application) =>
          application._id === id ? updatedApplication : application
        )
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update status.");
    } finally {
      setMutatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this application from tracker?")) return;
    if (mutatingId) return;

    setError("");
    setMutatingId(id);
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((application) => application._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete.");
    } finally {
      setMutatingId(null);
    }
  };

  const handleDrop = async (status) => {
    if (!dragId) return;
    await handleStatusChange(dragId, status);
    setDragId(null);
  };

  const stats = useMemo(() => {
    const nextStats = Object.fromEntries(COLUMNS.map((column) => [column.id, 0]));
    applications.forEach((application) => {
      if (nextStats[application.status] !== undefined) {
        nextStats[application.status] += 1;
      }
    });
    return nextStats;
  }, [applications]);

  const applicationsByStatus = useMemo(
    () =>
      Object.fromEntries(
        COLUMNS.map((column) => [
          column.id,
          applications.filter((application) => application.status === column.id),
        ])
      ),
    [applications]
  );

  const totalApps = applications.length;

  return (
    <PageShell
      title="Application Tracker"
      description="Track every job and internship from saved to offer — drag cards or update status."
      action={
        <Link
          to="/jobs"
          className="rounded-lg bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Find Jobs →
        </Link>
      }
    >
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="dash-card p-3 text-center sm:p-4">
            <div className={`mx-auto h-1.5 w-8 rounded-full ${col.color}`} />
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {stats[col.id] || 0}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
              {col.label}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : totalApps === 0 ? (
        <div className="dash-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-brand-600 dark:text-brand-400">
              <path d="M4 4h16v16H4V4z" strokeLinejoin="round" />
              <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
            No applications yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Save jobs from the Job Finder and click &quot;Track&quot; to start monitoring your applications.
          </p>
          <Link
            to="/jobs"
            className="mt-6 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Discover Jobs
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnApps = applicationsByStatus[col.id];

            return (
              <div
                key={col.id}
                className="flex w-72 shrink-0 flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                <div
                  className={`mb-3 flex items-center justify-between rounded-xl px-3 py-2 ${col.headerBg}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${col.color}`} />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {col.label}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                    {columnApps.length}
                  </span>
                </div>

                <div className="min-h-[200px] space-y-3 rounded-xl bg-slate-50/50 p-2 dark:bg-slate-900/30">
                  {columnApps.map((app) => (
                    <div
                      key={app._id}
                      draggable
                      onDragStart={() => setDragId(app._id)}
                      onDragEnd={() => setDragId(null)}
                      className={`dash-card cursor-grab p-4 transition-shadow active:cursor-grabbing ${
                        dragId === app._id ? "opacity-50 shadow-lg" : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {app.role}
                          </p>
                          <p className="truncate text-xs text-slate-500">{app.company}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(app._id)}
                          disabled={mutatingId === app._id}
                          className="shrink-0 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                          title="Remove"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {app.source && <SourceBadge source={app.source} />}
                        <MatchScoreBadge score={app.matchScore} />
                      </div>

                      {app.location && (
                        <p className="mt-2 text-[11px] text-slate-400">📍 {app.location}</p>
                      )}
                      {app.salary && (
                        <p className="text-[11px] text-slate-400">💰 {app.salary}</p>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          disabled={mutatingId === app._id}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>

                        {app.applyUrl && (
                          <a
                            href={app.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                            title="Apply on platform"
                          >
                            Apply
                          </a>
                        )}
                      </div>

                      <p className="mt-2 text-[10px] text-slate-400">
                        Added {new Date(app.appliedAt || app.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}

                  {columnApps.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
