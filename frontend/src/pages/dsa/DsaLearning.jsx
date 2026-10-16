import { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/dashboard/PageShell";
import Toast from "../../components/resume/Toast";
import { fetchDsaModule, updateDsaProgress } from "../../services/dsaService";

const safeExternalUrl = (value) => {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname &&
      !url.username &&
      !url.password
    ) {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
};

const formatUpdated = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const difficultyStyles = {
  Beginner: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Intermediate: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Advanced: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
};

function SummaryStat({ label, value, suffix = "" }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}{suffix}
      </p>
    </div>
  );
}

function ResourceLink({ href, children }) {
  const url = safeExternalUrl(href);

  if (!url) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        Resource not configured
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
    >
      {children}
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M11 3h6v6M17 3l-8 8M15 11v4a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function TopicCard({ topic, index, saving, onToggle }) {
  const updatedLabel = formatUpdated(topic.lastUpdated);

  return (
    <article id={`dsa-topic-${topic.id}`} tabIndex="-1" className="dash-card scroll-mt-6 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">{topic.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficultyStyles[topic.difficulty] || difficultyStyles.Intermediate}`}>
              {topic.difficulty}
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{topic.description}</p>
          <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            Estimated time: {topic.estimatedTime}{updatedLabel ? ` · Updated ${updatedLabel}` : ""}
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => onToggle(topic)}
          aria-pressed={topic.completed}
          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60 ${
            topic.completed
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500/50 dark:hover:text-brand-300"
          }`}
        >
          <span className={`flex h-4 w-4 items-center justify-center rounded border ${topic.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>
            {topic.completed && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3" aria-hidden="true">
                <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          {saving ? "Saving…" : topic.completed ? "Completed" : "Mark complete"}
        </button>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <ResourceLink href={topic.youtubeUrl}>YouTube tutorial</ResourceLink>
          <ResourceLink href={topic.practiceUrl}>Practice problems</ResourceLink>
          {topic.additionalResources?.map((resource) => (
            <ResourceLink key={`${topic.id}-${resource.label}`} href={resource.url}>
              {resource.label}
            </ResourceLink>
          ))}
        </div>
        {topic.notes && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Study note: </span>{topic.notes}
          </p>
        )}
      </div>
    </article>
  );
}

export default function DsaLearning() {
  const [topics, setTopics] = useState([]);
  const [summary, setSummary] = useState({
    totalTopics: 0,
    completedTopics: 0,
    totalResources: 0,
    completionPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingTopicId, setSavingTopicId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadDsaModule = async () => {
      try {
        setError("");
        const response = await fetchDsaModule();
        if (cancelled) return;
        setTopics(response.data?.topics || []);
        setSummary(response.data?.summary || {});
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load DSA learning resources. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDsaModule();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const continueTopic = useMemo(
    () => topics.find((topic) => !topic.completed) || topics[topics.length - 1] || null,
    [topics]
  );

  const scrollToTopic = () => {
    if (!continueTopic) return;
    document.getElementById(`dsa-topic-${continueTopic.id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleToggle = async (topic) => {
    try {
      setSavingTopicId(topic.id);
      const response = await updateDsaProgress(topic.id, !topic.completed);
      const updatedTopic = response.data?.topic;

      if (!updatedTopic) {
        throw new Error("The server did not return the updated topic.");
      }

      setTopics((currentTopics) =>
        currentTopics.map((item) =>
          item.id === updatedTopic.id ? updatedTopic : item
        )
      );
      setSummary(response.data?.summary || summary);
      setToast({
        type: "success",
        message: updatedTopic.completed
          ? `${updatedTopic.name} marked complete.`
          : `${updatedTopic.name} marked incomplete.`,
      });
    } catch (requestError) {
      setToast({
        type: "error",
        message:
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to update this topic. Please try again.",
      });
    } finally {
      setSavingTopicId(null);
    }
  };

  return (
    <PageShell
      title="Data Structures & Algorithms"
      description="Build problem-solving fundamentals through a guided, trackable DSA curriculum."
    >
      <section className="dash-card relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500/15 to-violet-500/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">Structured learning path</p>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">Learn the patterns that power technical interviews.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Move from fundamentals to advanced problem-solving with topic-specific tutorials, practice links, and private completion tracking.</p>
          </div>
          <button
            type="button"
            onClick={scrollToTopic}
            disabled={!continueTopic || loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {continueTopic?.completed ? "Review learning" : "Continue learning"}
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true"><path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => window.location.reload()} className="font-semibold underline underline-offset-2">Try again</button>
        </div>
      )}

      <section className="mt-5" aria-label="Learning progress summary">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Learning progress</h2>
          <span className="text-sm font-semibold text-brand-600 dark:text-brand-300">{summary.completionPercentage || 0}% complete</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryStat label="Total topics" value={summary.totalTopics || 0} />
            <SummaryStat label="Completed topics" value={summary.completedTopics || 0} />
            <SummaryStat label="Learning resources" value={summary.totalResources || 0} />
            <SummaryStat label="Overall completion" value={summary.completionPercentage || 0} suffix="%" />
          </div>
        )}
      </section>

      <section className="mt-7" aria-labelledby="dsa-topics-title">
        <div className="mb-4">
          <h2 id="dsa-topics-title" className="text-base font-semibold text-slate-900 dark:text-white">Topic-wise resources</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Each topic includes configurable YouTube and coding-practice resources that open in a new tab.</p>
        </div>

        {loading && <div className="space-y-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="dash-card h-44 animate-pulse" />)}</div>}

        {!loading && !error && topics.length === 0 && (
          <div className="dash-card px-5 py-12 text-center">
            <p className="font-semibold text-slate-900 dark:text-white">No DSA topics are configured yet.</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add topics in the server DSA configuration to begin learning.</p>
          </div>
        )}

        <div className="space-y-3">
          {topics.map((topic, index) => (
            <TopicCard key={topic.id} topic={topic} index={index} saving={savingTopicId === topic.id} onToggle={handleToggle} />
          ))}
        </div>
      </section>

      <Toast toast={toast} />
    </PageShell>
  );
}
