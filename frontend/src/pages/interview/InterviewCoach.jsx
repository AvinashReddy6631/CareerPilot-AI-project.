import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Lightbulb,
  LoaderCircle,
  MessageSquareText,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import { generateQuestions as requestQuestions } from "../../services/interviewService";
import PageShell from "../../components/dashboard/PageShell";

const HISTORY_KEY = "careerpilot_interview_question_sets";

const CATEGORIES = [
  { label: "Technical", icon: Code2, color: "brand" },
  { label: "Behavioral", icon: UsersRound, color: "violet" },
  { label: "Leadership", icon: Trophy, color: "amber" },
  { label: "Case study", icon: Lightbulb, color: "cyan" },
];

const POPULAR_ROLES = [
  "Frontend Developer",
  "Product Manager",
  "Data Analyst",
  "AI Engineer",
  "UX Designer",
  "Backend Developer",
];

const PREP_TIPS = [
  "Use the STAR format to give concise, credible examples.",
  "Quantify results so your impact is easy to remember.",
  "Pause briefly before answering—it helps you sound deliberate.",
];

function getStoredHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(stored) ? stored.slice(0, 4) : [];
  } catch {
    return [];
  }
}

function formatHistoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export default function InterviewCoach() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState(getStoredHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!role.trim()) {
      setError("Enter a role to create your tailored question set.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await requestQuestions(role.trim());
      const nextQuestions = res.data.questions || [];
      setQuestions(nextQuestions);

      const nextHistory = [
        { role: role.trim(), questionCount: nextQuestions.length, createdAt: new Date().toISOString() },
        ...history.filter((item) => item.role.toLowerCase() !== role.trim().toLowerCase()),
      ].slice(0, 4);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (requestError) {
      console.error(requestError);
      setQuestions([]);
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "We couldn't generate questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setError("");
  };

  return (
    <PageShell
      title="Interview Coach"
      description="Create focused practice sessions, strengthen your stories, and show up ready."
    >
      <div className="space-y-5 sm:space-y-6">
        <section className="coach-hero relative overflow-hidden rounded-3xl px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_22%,rgba(125,211,252,.24),transparent_28%),radial-gradient(circle_at_20%_100%,rgba(167,139,250,.32),transparent_34%)]" />
          <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                YOUR AI PRACTICE PARTNER
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Practice the questions that move your career forward.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Tell CareerPilot your target role and get a focused set of interview prompts designed to help you think, explain, and stand out.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> Tailored prompts</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> Ready in seconds</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> Practice at your pace</span>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-brand-950/30 backdrop-blur sm:h-32 sm:w-32 lg:mr-6"
              aria-hidden="true"
            >
              <BrainCircuit className="h-14 w-14 text-brand-100 sm:h-16 sm:w-16" strokeWidth={1.35} />
            </motion.div>
          </div>
        </section>

        <section className="dash-card overflow-hidden p-1">
          <div className="rounded-[calc(1rem-4px)] bg-gradient-to-br from-white via-brand-50/45 to-violet-50/60 p-5 dark:from-slate-900 dark:via-brand-950/20 dark:to-violet-950/20 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
                  <WandSparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em]">Build a practice set</span>
                </div>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">What role are you preparing for?</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Be specific for questions aligned to the work you want to do.</p>
              </div>
              <span className="hidden rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm sm:block dark:bg-slate-800">AI curated</span>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="interview-role">Target role</label>
              <div className="relative min-w-0 flex-1">
                <BriefcaseBusiness className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="interview-role"
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value);
                    setError("");
                  }}
                  onKeyDown={(event) => event.key === "Enter" && generateQuestions()}
                  disabled={loading}
                  className="input-ring w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <motion.button
                type="button"
                onClick={generateQuestions}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-500 hover:to-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Creating your set…" : "Generate questions"}
              </motion.button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR_ROLES.map((popularRole) => (
                <button key={popularRole} type="button" onClick={() => selectRole(popularRole)} className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-brand-300">
                  {popularRole}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.section key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dash-card p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10"><LoaderCircle className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-300" /></div>
                <div className="min-w-0 flex-1 space-y-2"><div className="h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><div className="h-3 w-full max-w-md animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" /></div>
              </div>
              <div className="mt-6 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />)}</div>
            </motion.section>
          )}

          {!loading && questions.length > 0 && (
            <motion.section key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/30 sm:px-6">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"><MessageSquareText className="h-5 w-5" /></div><div><h2 className="font-semibold text-slate-900 dark:text-white">Your {role} practice set</h2><p className="text-xs text-slate-500 dark:text-slate-400">{questions.length} questions chosen for focused practice</p></div></div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Ready to practice</span>
              </div>
              <ol className="divide-y divide-slate-100 dark:divide-slate-800">{questions.map((question, index) => <motion.li initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} key={`${question}-${index}`} className="flex gap-4 px-5 py-4 sm:px-6"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{String(index + 1).padStart(2, "0")}</span><p className="pt-0.5 text-sm leading-6 text-slate-700 dark:text-slate-200">{question}</p></motion.li>)}</ol>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="dash-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-brand-600 dark:text-brand-300" /><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Previous interview history</h2></div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your recent AI question sets on this device.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{history.length}</span></div>
            {history.length ? <div className="mt-5 space-y-2">{history.map((item) => <div key={`${item.role}-${item.createdAt}`} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800"><Target className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.role}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.questionCount || "AI"} questions · {formatHistoryDate(item.createdAt)}</p></div><button type="button" onClick={() => selectRole(item.role)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800" aria-label={`Use ${item.role} again`}><ArrowRight className="h-4 w-4" /></button></div>)}</div> : <div className="mt-5 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center dark:border-slate-700 dark:bg-slate-900/30"><PlayCircle className="h-7 w-7 text-slate-300 dark:text-slate-600" /><p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">Your practice history starts here</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Generate a question set to keep it handy for next time.</p></div>}
          </section>

          <section className="dash-card p-5 sm:p-6"><div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Interview prep, made clearer</h2></div><ul className="mt-4 space-y-3">{PREP_TIPS.map((tip, index) => <li key={tip} className="flex gap-3 text-sm leading-5 text-slate-600 dark:text-slate-300"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[11px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">{index + 1}</span>{tip}</li>)}</ul></section>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CATEGORIES.map(({ label, icon: Icon, color }) => <button key={label} type="button" onClick={() => setError("Choose a role above to generate a tailored question set.")} className={`coach-category coach-category-${color} group text-left`}><span className="flex h-10 w-10 items-center justify-center rounded-xl"><Icon className="h-5 w-5" /></span><span className="mt-4 block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs leading-5 opacity-75">Sharpen the answers interviewers remember.</span></button>)}
        </section>

        <section className="dash-card grid overflow-hidden lg:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center bg-gradient-to-br from-brand-600 to-violet-700 p-6 text-white"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><BrainCircuit className="h-7 w-7" /></div></div>
          <div className="p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-900 dark:text-white">More than a list of questions</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use AI-generated prompts to practice your reasoning, shape your stories, and find your strongest examples before the real conversation.</p><div className="mt-4 flex flex-wrap gap-2">{["Role-aware prompts", "Technical and behavioral coverage", "Reusable practice sets"].map((feature) => <span key={feature} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{feature}</span>)}</div></div>
        </section>
      </div>
    </PageShell>
  );
}
