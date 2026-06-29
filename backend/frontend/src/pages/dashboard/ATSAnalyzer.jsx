import { useState } from "react";
import PageShell from "../../components/dashboard/PageShell";
import CircularScore from "../../components/ats/CircularScore";
import MatchProgressBar from "../../components/ats/MatchProgressBar";
import AnalyticsMetricCard from "../../components/ats/AnalyticsMetricCard";
import InsightPanel from "../../components/ats/InsightPanel";
import ResumeUploadZone from "../../components/ats/ResumeUploadZone";
import { analyzeResumeAts } from "../../services/resumeService";

const IconSkill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" strokeLinejoin="round" />
  </svg>
);

const IconKeyword = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <path d="M7 7h10v10H7z" strokeLinejoin="round" />
    <path d="M7 11h6M7 15h4" strokeLinecap="round" />
  </svg>
);

const IconExperience = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <rect x="3" y="6" width="18" height="14" rx="2" />
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const IconMatch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export default function ATSAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");

    if (!file) {
      setError("Please upload a resume PDF.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await analyzeResumeAts(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setError("");
  };

  return (
    <PageShell
      title="ATS Resume Analyzer"
      description="Evaluate resume-to-job fit with skill, keyword, and experience matching — built for recruiters and candidates."
      action={
        result && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            New analysis
          </button>
        )
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input panel */}
        <div className="lg:col-span-4">
          <div className="dash-card sticky top-20 overflow-hidden">
            <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Analysis Input
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Upload resume and paste the target job description
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Resume Upload
                </label>
                <ResumeUploadZone
                  file={file}
                  onFileChange={setFile}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="jd"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Job Description
                </label>
                <textarea
                  id="jd"
                  rows={10}
                  placeholder="Paste the full job description including required skills, qualifications, and responsibilities…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                  className="input-ring w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {jobDescription.length.toLocaleString()} characters
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 dark:from-brand-600 dark:to-violet-700"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing resume…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" strokeLinecap="round" />
                    </svg>
                    Run ATS Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-8">
          {!result && !loading && (
            <div className="dash-card flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6M9 16h4" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                Ready for analysis
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Upload a resume and paste a job description to receive an ATS compatibility report with
                skill, keyword, and experience breakdowns.
              </p>
            </div>
          )}

          {loading && (
            <div className="dash-card flex flex-col items-center justify-center px-6 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
              <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                Parsing resume and matching against job requirements…
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Score hero */}
              <div className="dash-card overflow-hidden">
                <div className="grid grid-cols-1 items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
                  <CircularScore score={result.atsScore} grade={result.grade} size={168} />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        ATS Compatibility Report
                      </h2>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {result.fileName}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Composite score weighted across skill match (40%), keyword density (35%), and
                      experience alignment (25%).
                    </p>

                    <div className="mt-6 space-y-4">
                      <MatchProgressBar
                        label="Skill Match"
                        score={result.skillMatch.score}
                        matched={result.skillMatch.matchedCount}
                        total={result.skillMatch.total}
                        accent="brand"
                      />
                      <MatchProgressBar
                        label="Keyword Match"
                        score={result.keywordMatch.score}
                        matched={result.keywordMatch.matchedCount}
                        total={result.keywordMatch.total}
                        accent="violet"
                      />
                      <MatchProgressBar
                        label="Experience Match"
                        score={result.experienceMatch.score}
                        accent="cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <AnalyticsMetricCard
                  label="Skills Matched"
                  value={`${result.skillMatch.matchedCount}/${result.skillMatch.total || "—"}`}
                  sublabel={result.skillMatch.total ? `${result.skillMatch.score}% coverage` : "No skills detected in JD"}
                  icon={IconSkill}
                  accent="brand"
                />
                <AnalyticsMetricCard
                  label="Keywords Matched"
                  value={`${result.keywordMatch.matchedCount}/${result.keywordMatch.total || "—"}`}
                  sublabel={`${result.keywordMatch.score}% density`}
                  icon={IconKeyword}
                  accent="emerald"
                />
                <AnalyticsMetricCard
                  label="Role Requirement"
                  value={result.experienceMatch.requirement}
                  sublabel={`Resume: ${result.experienceMatch.detected}`}
                  icon={IconExperience}
                  accent="amber"
                />
                <AnalyticsMetricCard
                  label="Missing Terms"
                  value={result.missingKeywords.length}
                  sublabel="Skills + keywords to add"
                  icon={IconMatch}
                  accent={result.missingKeywords.length > 5 ? "red" : "slate"}
                />
              </div>

              {/* Matched skills tags */}
              {result.skillMatch.matched.length > 0 && (
                <div className="dash-card p-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Matched Skills
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.skillMatch.matched.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
                          <path d="M10 3L5 8.5 2 5.5l.7-.7L5 7.1l4.3-4.3.7.7z" />
                        </svg>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insight panels */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InsightPanel variant="strengths" items={result.strengths} />
                <InsightPanel variant="weaknesses" items={result.weaknesses} />
              </div>

              {result.missingKeywords.length > 0 && (
                <InsightPanel variant="keywords" items={result.missingKeywords} />
              )}

              <InsightPanel variant="recommendations" items={result.recommendations} />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
