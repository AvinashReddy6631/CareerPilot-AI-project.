import { useState } from "react";
import api from "../../services/api";
import PageShell from "../../components/dashboard/PageShell";

const INTERVIEW_TIPS = [
  "Make eye contact and speak clearly",
  "Listen carefully to the full question before answering",
  "Use the STAR method for behavioural questions",
  "Ask clarifying questions if needed",
  "Keep answers concise (1-2 minutes per question)",
];

export default function InterviewCoach() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateQuestions = async () => {
    setError("");

    if (!role.trim()) {
      setError("Please enter a career role");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/interview/generate-questions", { role });
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRole("");
    setQuestions([]);
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && role.trim()) {
      handleGenerateQuestions();
    }
  };

  return (
    <PageShell
      title="Interview Coach"
      description="Generate role-specific interview questions and practice your responses before the real thing."
      action={
        questions.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        )
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Panel */}
        <div className="lg:col-span-4">
          <div className="dash-card sticky top-20 overflow-hidden">
            <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Practice Setup
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Generate questions for any role and practice your responses
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Target Role
                </label>
                <input
                  id="role"
                  type="text"
                  placeholder="e.g. Frontend Developer, AI Engineer, Product Manager..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="input-ring w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={loading || !role.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Generate Questions
                  </>
                )}
              </button>

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Interview Tips
                </h3>
                <ul className="space-y-2">
                  {INTERVIEW_TIPS.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500 dark:bg-brand-400" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Panel */}
        <div className="lg:col-span-8">
          {!questions.length && !loading && (
            <div className="dash-card flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M8 9l4-4 4 4M8 15l4 4 4-4M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                Ready to practice
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Enter your target role above to generate personalized interview questions. Perfect for preparing before real interviews.
              </p>
            </div>
          )}

          {loading && (
            <div className="dash-card flex flex-col items-center justify-center px-6 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
              <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                Generating interview questions for {role}…
              </p>
            </div>
          )}

          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="dash-card p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/10">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Interview Questions for {role}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {questions.length} questions • Practice aloud for best results
                    </p>
                  </div>
                </div>
              </div>

              {questions.map((question, index) => (
                <div key={index} className="dash-card overflow-hidden">
                  <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/50 px-5 py-3 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{question}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <textarea
                      placeholder="Type your answer here... Don't worry about perfection, focus on clarity and confidence."
                      rows={4}
                      className="input-ring w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-2 5v6l5 3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Record Answer
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Get Feedback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
