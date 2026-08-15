import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { resumeToApi, resumeFromApi, getCompletionPercent, EMPTY_RESUME } from "../../utils/resumeDefaults";
import { loadDraft, saveDraft, mergeWithDefaults } from "../../utils/resumeDraft";
import { enhanceToBullets, delay } from "../../utils/bulletEnhancer";
import { saveResume, generateSummary, fetchLatestResume } from "../../services/resumeService";
import ResumeForm from "../../components/resume/ResumeForm";
import ResumePreview from "../../components/resume/ResumePreview";
import ResumeHistoryPanel from "../../components/resume/ResumeHistoryPanel";
import Toast from "../../components/resume/Toast";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || null;
  const [data, setData] = useState(EMPTY_RESUME);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletField, setBulletField] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [draftStatus, setDraftStatus] = useState("saved");
  const previewRef = useRef(null);
  const saveTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const initializedRef = useRef(false);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    let cancelled = false;
    initializedRef.current = false;

    const loadLatestResume = async () => {
      if (!userId) {
        setData(EMPTY_RESUME);
        initializedRef.current = true;
        return;
      }

      try {
        const res = await fetchLatestResume();
        if (cancelled) return;

        if (res.data.resume) {
          const apiResume = resumeFromApi(res.data.resume);
          const localProfiles = loadDraft(userId)?.personal || {};
          setData({
            ...apiResume,
            personal: {
              ...apiResume.personal,
              github: localProfiles.github || "",
              portfolio: localProfiles.portfolio || "",
              leetcode: localProfiles.leetcode || "",
              hackerrank: localProfiles.hackerrank || "",
              codechef: localProfiles.codechef || "",
            },
          });
        } else {
          setData(EMPTY_RESUME);
        }
      } catch (error) {
        console.error(error);
        if (cancelled) return;
        const draft = loadDraft(userId);
        setData(mergeWithDefaults(draft));
        showToast(error.response?.data?.message || error.message || "Failed to load latest resume", "error");
      } finally {
        if (!cancelled) initializedRef.current = true;
      }
    };

    loadLatestResume();

    return () => {
      cancelled = true;
    };
  }, [userId, showToast]);

  useEffect(() => {
    if (!initializedRef.current || !userId) return;

    setDraftStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const ok = saveDraft(data, userId);
      setDraftStatus(ok ? "saved" : "error");
    }, 1200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, userId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: value },
    }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (template) => {
    setData((prev) => ({ ...prev, template }));
  };

  const handleGenerateSummary = async () => {
    if (!data.skills?.trim() && !data.experience?.trim()) {
      showToast("Add skills or experience first", "error");
      return;
    }

    setSummaryLoading(true);
    try {
      const res = await generateSummary({
        name: data.personal.name,
        jobTitle: data.personal.jobTitle,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        achievements: data.achievements,
        template: data.template,
      });
      setData((prev) => ({ ...prev, summary: res.data.summary }));
      showToast(
        res.data.fallback ? "Summary generated (offline template)" : "AI summary ready",
        res.data.fallback ? "info" : "success"
      );
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || error.message || "Failed to generate summary", "error");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateBullets = async (fieldName) => {
    const text = data[fieldName];
    if (!text?.trim()) {
      showToast(`Add content to ${fieldName} first`, "error");
      return;
    }

    setBulletLoading(true);
    setBulletField(fieldName);
    try {
      await delay(600);
      const enhanced = enhanceToBullets(text);
      setData((prev) => ({ ...prev, [fieldName]: enhanced }));
      showToast("Bullet points enhanced with action verbs");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to enhance bullets", "error");
    } finally {
      setBulletLoading(false);
      setBulletField(null);
    }
  };

  const handleSave = async () => {
    if (saveLoading) return;

    if (!data.personal.name?.trim() || !data.personal.email?.trim()) {
      showToast("Name and email are required to save", "error");
      return;
    }

    setSaveLoading(true);
    try {
      await saveResume(resumeToApi(data));
      showToast("Resume saved to history");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save resume", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (exportLoading) return;

    if (!data.personal.name?.trim() && !data.personal.email?.trim()) {
      showToast("Add at least your name or email before downloading", "error");
      return;
    }

    setExportLoading(format);
    try {
      const name = data.personal.name || "Resume";
      if (format === "pdf") {
        const { exportResumePdf } = await import("../../utils/exportResumePdf");
        await exportResumePdf(data, name);
      } else {
        const { exportResumeDocx } = await import("../../utils/exportResumeDocx");
        await exportResumeDocx(data, name);
      }
      showToast(`${format.toUpperCase()} downloaded successfully`);
    } catch (error) {
      console.error(error);
      showToast(error.message || `${format.toUpperCase()} export failed`, "error");
    } finally {
      setExportLoading(null);
    }
  };

  const handleLoadResume = (loaded) => {
    setData(loaded);
    showToast("Resume loaded from history");
  };

  const completion = getCompletionPercent(data);

  return (
    <div className="flex min-h-full min-w-0 flex-col bg-slate-50/50 dark:bg-slate-950 lg:h-[calc(100vh-3.5rem)] lg:min-h-0">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Resume Builder
            </h1>
            <span className="hidden rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600 sm:inline dark:bg-brand-500/10 dark:text-brand-400">
              Pro
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ATS-optimized · Live preview
            </p>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {completion}% complete
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span
              className={`text-xs font-medium ${
                draftStatus === "saved"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : draftStatus === "saving"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600"
              }`}
            >
              {draftStatus === "saved" && "Draft saved"}
              {draftStatus === "saving" && "Saving draft…"}
              {draftStatus === "error" && "Draft save failed"}
            </span>
          </div>
          <div className="mt-2 h-1 w-48 max-w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <ToolbarButton onClick={() => setHistoryOpen(true)} icon="history">
            History
          </ToolbarButton>
          <ToolbarButton onClick={handleSave} loading={saveLoading} icon="save">
            Save
          </ToolbarButton>
          <ExportButton format="pdf" loading={exportLoading} onClick={handleExport} />
          <ExportButton format="docx" loading={exportLoading} onClick={handleExport} />
        </div>
      </motion.div>

      {/* Split layout */}
      <div className="grid min-w-0 grid-cols-1 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
        <div className="min-w-0 overflow-visible border-slate-200/80 p-4 sm:p-5 lg:overflow-y-auto lg:border-r lg:p-6">
          <ResumeForm
            data={data}
            onPersonalChange={handlePersonalChange}
            onFieldChange={handleFieldChange}
            onTemplateChange={handleTemplateChange}
            onGenerateSummary={handleGenerateSummary}
            onGenerateBullets={handleGenerateBullets}
            summaryLoading={summaryLoading}
            bulletLoading={bulletLoading}
            bulletField={bulletField}
          />
        </div>

        <div className="min-w-0 overflow-visible border-t border-slate-200/80 bg-white/40 p-4 dark:border-slate-800 dark:bg-slate-900/20 sm:p-5 lg:overflow-y-auto lg:border-t-0 lg:p-6">
          <div className="lg:sticky lg:top-0 lg:min-h-[calc(100vh-8rem)]">
            <ResumePreview
              data={data}
              previewRef={previewRef}
              onTemplateChange={handleTemplateChange}
              scale={0.48}
            />
          </div>
        </div>
      </div>

      <ResumeHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadResume}
        onError={(msg) => showToast(msg, "error")}
      />

      <Toast toast={toast} />
    </div>
  );
}

function ExportButton({ format, loading, onClick }) {
  const active = loading === format;
  const Icon = format === "pdf" ? Download : FileText;

  return (
    <motion.button
      type="button"
      onClick={() => onClick(format)}
      disabled={Boolean(loading)}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-lg transition-opacity disabled:opacity-60 ${
        format === "pdf"
          ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-brand-500/20 hover:opacity-95"
          : "border border-slate-200 bg-white text-slate-800 shadow-slate-900/5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
      }`}
    >
      {active ? <Spinner light={format === "pdf"} /> : <Icon className="h-4 w-4" strokeWidth={1.8} />}
      Download {format.toUpperCase()}
    </motion.button>
  );
}

function Spinner({ light }) {
  return (
    <span
      className={`h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent ${
        light ? "border-white/30 border-t-white" : "border-slate-300 border-t-slate-600"
      }`}
    />
  );
}

function ToolbarButton({ children, onClick, loading, icon }) {
  const icons = {
    history: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
      </svg>
    ),
    save: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h10l3 3v9H4V4z" strokeLinejoin="round" />
        <path d="M7 4v4h6V4" />
      </svg>
    ),
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {loading ? <Spinner /> : icons[icon]}
      {children}
    </motion.button>
  );
}
