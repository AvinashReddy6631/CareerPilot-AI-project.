import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { resumeToApi, resumeFromApi, getCompletionPercent, EMPTY_RESUME } from "../../utils/resumeDefaults";
import { enhanceToBullets, delay } from "../../utils/bulletEnhancer";
import { exportResumePdf } from "../../utils/exportResumePdf";
import {
  generateSummary,
  fetchWorkspaces,
  createWorkspace,
  fetchDraft,
  saveDraft as apiSaveDraft,
  saveVersion,
  fetchVersionHistory,
  restoreVersion,
  fetchResumeHistory
} from "../../services/resumeService";
import ResumeForm from "../../components/resume/ResumeForm";
import ResumePreview from "../../components/resume/ResumePreview";
import ResumeHistoryPanel from "../../components/resume/ResumeHistoryPanel";
import Toast from "../../components/resume/Toast";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || null;

  // Workspace and version states
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [data, setData] = useState(EMPTY_RESUME);
  const [previewVersion, setPreviewVersion] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState("");

  // Loading/action states
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletField, setBulletField] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [draftStatus, setDraftStatus] = useState("saved");

  // Off-screen PDF export state
  const [exportData, setExportData] = useState(null);

  const previewRef = useRef(null);
  const exportRef = useRef(null);
  const saveTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const initialLoadRef = useRef(false);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // Main loader: Workspaces -> Drafts -> Migration
  const initializeWorkspaces = useCallback(async () => {
    if (!userId) {
      setData(EMPTY_RESUME);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWorkspaces();
      const list = res.data.workspaces || [];
      
      if (list.length > 0) {
        setWorkspaces(list);
        // Load the first (most recently updated) workspace
        await handleWorkspaceSelect(list[0]);
      } else {
        // No workspaces found. Check for legacy resumes to migrate
        setMigrationStatus("Checking for existing resumes...");
        const legacyRes = await fetchResumeHistory();
        const legacyList = legacyRes.data.resumes || [];

        if (legacyList.length > 0) {
          setMigrationStatus(`Migrating ${legacyList.length} resume(s)...`);
          const migratedList = [];
          for (let i = 0; i < legacyList.length; i++) {
            const legacy = legacyList[i];
            
            // 1. Create Workspace
            const wsRes = await createWorkspace({
              name: legacy.name || `Resume ${i + 1}`,
              jobTitle: legacy.jobTitle || "",
              template: legacy.template || "ATS Standard"
            });
            const newWs = wsRes.data.workspace;
            
            // 2. Save Draft content
            const content = resumeFromApi(legacy);
            await apiSaveDraft(newWs._id, content);
            
            // 3. Save Version 1
            await saveVersion(newWs._id, "Migrated Legacy Resume", content);
            migratedList.push(newWs);
          }
          setWorkspaces(migratedList);
          await handleWorkspaceSelect(migratedList[0]);
        } else {
          // Clean slate: Create default workspace
          setMigrationStatus("Creating your workspace...");
          const defaultWsRes = await createWorkspace({
            name: "My Resume",
            jobTitle: "",
            template: "ATS Standard"
          });
          const newWs = defaultWsRes.data.workspace;
          setWorkspaces([newWs]);
          await handleWorkspaceSelect(newWs);
        }
      }
    } catch (error) {
      console.error(error);
      showToast("Error initializing workspaces. Using empty slate.", "error");
      setData(EMPTY_RESUME);
    } finally {
      setLoading(false);
      setMigrationStatus("");
    }
  }, [userId, showToast]);

  const handleWorkspaceSelect = async (ws) => {
    if (!ws) {
      setActiveWorkspace(null);
      setData(EMPTY_RESUME);
      return;
    }
    
    // Stop any pending auto-saves before swapping workspace
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    
    setActiveWorkspace(ws);
    setPreviewVersion(null);
    initialLoadRef.current = false;

    try {
      const res = await fetchDraft(ws._id);
      if (res.data.draft) {
        setData(res.data.draft.content);
      } else {
        setData(EMPTY_RESUME);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load workspace draft", "error");
      setData(EMPTY_RESUME);
    } finally {
      // Allow autosaving after loading content
      setTimeout(() => {
        initialLoadRef.current = true;
      }, 200);
    }
  };

  useEffect(() => {
    initializeWorkspaces();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [userId, initializeWorkspaces]);

  // Debounced Autosave (Draft only)
  useEffect(() => {
    if (!initialLoadRef.current || !activeWorkspace?._id || previewVersion) return;

    setDraftStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await apiSaveDraft(activeWorkspace._id, data);
        setDraftStatus("saved");
      } catch (err) {
        console.error(err);
        setDraftStatus("error");
      }
    }, 1200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, activeWorkspace?._id, previewVersion]);

  // If user edits when previewing a version, automatically exit preview and return to draft
  const exitPreviewIfActive = () => {
    if (previewVersion) {
      setPreviewVersion(null);
      showToast("Returned to live draft", "info");
    }
  };

  const handlePersonalChange = (e) => {
    exitPreviewIfActive();
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: value },
    }));
  };

  const handleFieldChange = (e) => {
    exitPreviewIfActive();
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (template) => {
    exitPreviewIfActive();
    setData((prev) => ({ ...prev, template }));
  };

  const handleGenerateSummary = async () => {
    exitPreviewIfActive();
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
    exitPreviewIfActive();
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

  // Manual Version Save
  const handleSave = async () => {
    if (saveLoading || !activeWorkspace) return;

    if (!data.personal.name?.trim() || !data.personal.email?.trim()) {
      showToast("Name and email are required to save", "error");
      return;
    }

    setSaveLoading(true);
    try {
      // 1. Fetch version history to check duplicate changes
      const versionsRes = await fetchVersionHistory(activeWorkspace._id);
      const versionHistory = versionsRes.data.versions || [];
      
      if (versionHistory.length > 0) {
        const latest = versionHistory[0]; // Newest first
        // Simple string comparison
        if (JSON.stringify(data) === JSON.stringify(latest.content)) {
          showToast("No changes detected since the last saved version", "info");
          setSaveLoading(false);
          return;
        }
      }

      // 2. Prompt version name
      const defaultName = `v${versionHistory.length + 1} Save`;
      const versionName = window.prompt("Enter version description / tag:", defaultName);
      if (versionName === null) {
        setSaveLoading(false);
        return; // User cancelled prompt
      }

      // 3. Trigger manual version freeze API
      const res = await saveVersion(activeWorkspace._id, versionName.trim() || defaultName, data);
      
      // Update local latest version indicator
      setActiveWorkspace(prev => ({
        ...prev,
        latestVersion: res.data.version.version
      }));

      showToast(`Version ${res.data.version.version} saved successfully`);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save version", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Download PDF of current view
  const handleDownloadPdf = async () => {
    if (pdfLoading) return;

    const elementToExport = previewRef.current;
    if (!elementToExport) {
      showToast("Add content to preview before downloading", "error");
      return;
    }

    setPdfLoading(true);
    try {
      const name = (previewVersion ? previewVersion.content : data).personal?.name || "Resume";
      await exportResumePdf(elementToExport, name);
      showToast("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF Export Error:", error);
      showToast(error.message || "PDF export failed", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  // Callback when a version is loaded/restored from history
  const handleRestoreVersion = async (ver) => {
    try {
      await restoreVersion(activeWorkspace._id, ver._id);
      setData(ver.content);
      setPreviewVersion(null);
      showToast(`Restored Version ${ver.version} successfully`);
    } catch (err) {
      console.error(err);
      showToast("Failed to restore version", "error");
    }
  };

  // Download PDF from a specific historical version off-screen
  const handleDownloadVersionPdf = (ver) => {
    setExportData(ver.content);
  };

  // Off-screen rendering side-effect for version download
  useEffect(() => {
    if (!exportData || !exportRef.current) return;
    
    const runExport = async () => {
      try {
        const name = exportData.personal?.name || "Resume";
        await exportResumePdf(exportRef.current, name);
        showToast("PDF downloaded successfully");
      } catch (err) {
        console.error(err);
        showToast("PDF export failed: " + err.message, "error");
      } finally {
        setExportData(null);
      }
    };

    const timer = setTimeout(runExport, 350);
    return () => clearTimeout(timer);
  }, [exportData, showToast]);

  const handleWorkspaceChange = async (ws) => {
    if (ws) {
      await handleWorkspaceSelect(ws);
    } else {
      // Re-initialize lists (creates default workspace if none left)
      await initializeWorkspaces();
    }
  };

  const completion = getCompletionPercent(previewVersion ? previewVersion.content : data);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          {migrationStatus || "Loading Resume Workspace..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-slate-50/50 dark:bg-slate-950">
      {/* Version Preview Banner */}
      {previewVersion && (
        <div className="flex items-center justify-between gap-4 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-700 border-b border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/10 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-amber-800 dark:text-amber-300">
              Preview Mode
            </span>
            <span>
              Viewing V{previewVersion.version} ("{previewVersion.name}") saved on {new Date(previewVersion.createdAt).toLocaleDateString()}. Changes are disabled.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRestoreVersion(previewVersion)}
              className="rounded bg-amber-600 px-2.5 py-1 text-white hover:bg-amber-700 transition"
            >
              Restore to Live Editor
            </button>
            <button
              onClick={() => setPreviewVersion(null)}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
              {activeWorkspace?.name || "Resume Builder"}
            </h1>
            <span className="hidden rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600 sm:inline dark:bg-brand-500/10 dark:text-brand-400">
              Workspace
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
            {!previewVersion ? (
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
            ) : (
              <span className="text-xs font-medium text-amber-600">
                Viewing V{previewVersion.version}
              </span>
            )}
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
          <ToolbarButton onClick={handleSave} loading={saveLoading} icon="save" disabled={!!previewVersion}>
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
              data={previewVersion ? previewVersion.content : data}
              previewRef={previewRef}
              onTemplateChange={handleTemplateChange}
              scale={0.48}
            />
          </div>
        </div>
      </div>

      {/* Off-screen rendering wrapper for clean version PDF generation */}
      {exportData && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <ResumePreview
            data={exportData}
            previewRef={exportRef}
            scale={1.0}
            onTemplateChange={() => {}}
          />
        </div>
      )}

      {/* Sidebar history & workspace manager drawer */}
      <ResumeHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
        onRestoreVersion={handleRestoreVersion}
        onPreviewVersion={(ver) => {
          setPreviewVersion(ver);
          setHistoryOpen(false);
          showToast(`Previewing V${ver.version}: "${ver.name}"`, "info");
        }}
        onDownloadVersion={handleDownloadVersionPdf}
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

function ToolbarButton({ children, onClick, loading, icon, disabled }) {
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
      disabled={loading || disabled}
      whileHover={{ scale: (loading || disabled) ? 1 : 1.02 }}
      whileTap={{ scale: (loading || disabled) ? 1 : 0.98 }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {loading ? <Spinner /> : icons[icon]}
      {children}
    </motion.button>
  );
}
