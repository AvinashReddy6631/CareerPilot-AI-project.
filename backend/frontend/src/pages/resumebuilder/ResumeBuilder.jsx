import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { resumeToApi, getCompletionPercent } from "../../utils/resumeDefaults";
import { loadDraft, saveDraft, mergeWithDefaults } from "../../utils/resumeDraft";
import { enhanceToBullets, delay } from "../../utils/bulletEnhancer";
import { exportResumePdf } from "../../utils/exportResumePdf";
import { saveResume, generateSummary } from "../../services/resumeService";
import ResumeForm from "../../components/resume/ResumeForm";
import ResumePreview from "../../components/resume/ResumePreview";
import ResumeHistoryPanel from "../../components/resume/ResumeHistoryPanel";
import Toast from "../../components/resume/Toast";

export default function ResumeBuilder() {
  const [data, setData] = useState(() => mergeWithDefaults(loadDraft()));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletField, setBulletField] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [draftStatus, setDraftStatus] = useState("saved");
  const previewRef = useRef(null);
  const saveTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    setDraftStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const ok = saveDraft(data);
      setDraftStatus(ok ? "saved" : "error");
    }, 1200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data]);

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
    } catch {
      showToast("Failed to generate summary", "error");
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
    } catch {
      showToast("Failed to enhance bullets", "error");
    } finally {
      setBulletLoading(false);
      setBulletField(null);
    }
  };

  const handleSave = async () => {
    if (!data.personal.name?.trim() || !data.personal.email?.trim()) {
      showToast("Name and email are required to save", "error");
      return;
    }

    setSaveLoading(true);
    try {
      await saveResume(resumeToApi(data));
      showToast("Resume saved to history");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save resume", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) {
      showToast("Add content to preview before downloading", "error");
      return;
    }

    setPdfLoading(true);
    try {
      const name = data.personal.name || "Resume";
      await exportResumePdf(previewRef.current, name);
      showToast("PDF downloaded successfully");
    } catch {
      showToast("PDF export failed", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleLoadResume = (loaded) => {
    setData(loaded);
    showToast("Resume loaded from history");
  };

  const completion = getCompletionPercent(data);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-slate-50/50 dark:bg-slate-950">
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

        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton onClick={() => setHistoryOpen(true)} icon="history">
            History
          </ToolbarButton>
          <ToolbarButton onClick={handleSave} loading={saveLoading} icon="save">
            Save
          </ToolbarButton>
          <motion.button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            whileHover={{ scale: pdfLoading ? 1 : 1.02 }}
            whileTap={{ scale: pdfLoading ? 1 : 0.98 }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {pdfLoading ? (
              <Spinner light />
            ) : (
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17h12" strokeLinecap="round" />
              </svg>
            )}
            Download PDF
          </motion.button>
        </div>
      </motion.div>

      {/* Split layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="overflow-y-auto border-slate-200/80 p-4 sm:p-5 lg:border-r lg:p-6">
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

        <div className="overflow-y-auto border-t border-slate-200/80 bg-white/40 p-4 dark:border-slate-800 dark:bg-slate-900/20 sm:p-5 lg:border-t-0 lg:p-6">
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
