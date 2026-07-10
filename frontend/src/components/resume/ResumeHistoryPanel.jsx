import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchWorkspaces,
  createWorkspace,
  renameWorkspace,
  duplicateWorkspace,
  deleteWorkspace,
  fetchVersionHistory,
  deleteVersion
} from "../../services/resumeService";

export default function ResumeHistoryPanel({
  open,
  onClose,
  activeWorkspace,
  onWorkspaceChange,
  onRestoreVersion,
  onPreviewVersion,
  onDownloadVersion,
  onError
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadWorkspacesList = useCallback(async () => {
    setLoadingWorkspaces(true);
    try {
      const res = await fetchWorkspaces();
      setWorkspaces(res.data.workspaces || []);
    } catch (err) {
      console.error(err);
      onError?.(err.response?.data?.message || err.message || "Failed to load workspaces");
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [onError]);

  const loadVersionsList = useCallback(async (wsId) => {
    if (!wsId) return;
    setLoadingVersions(true);
    try {
      const res = await fetchVersionHistory(wsId);
      setVersions(res.data.versions || []);
    } catch (err) {
      console.error(err);
      onError?.(err.response?.data?.message || err.message || "Failed to load version history");
    } finally {
      setLoadingVersions(false);
    }
  }, [onError]);

  useEffect(() => {
    if (!open) return;
    loadWorkspacesList();
  }, [open, loadWorkspacesList]);

  useEffect(() => {
    if (!open || !activeWorkspace?._id) return;
    loadVersionsList(activeWorkspace._id);
  }, [open, activeWorkspace?._id, loadVersionsList]);

  const handleCreateWorkspace = async () => {
    const name = window.prompt("Enter a name for the new resume workspace:", "My Resume");
    if (!name || !name.trim()) return;

    setActionId("create-ws");
    try {
      const res = await createWorkspace({ name: name.trim() });
      await loadWorkspacesList();
      onWorkspaceChange(res.data.workspace);
    } catch (err) {
      console.error(err);
      onError?.(err.response?.data?.message || "Failed to create workspace");
    } finally {
      setActionId(null);
    }
  };

  const handleRenameWorkspace = async (ws) => {
    if (!ws) return;
    const name = window.prompt("Rename workspace:", ws.name);
    if (!name || !name.trim() || name.trim() === ws.name) return;

    setActionId(ws._id);
    try {
      const res = await renameWorkspace(ws._id, name.trim());
      await loadWorkspacesList();
      if (activeWorkspace?._id === ws._id) {
        onWorkspaceChange(res.data.workspace);
      }
    } catch (err) {
      console.error(err);
      onError?.(err.response?.data?.message || "Failed to rename workspace");
    } finally {
      setActionId(null);
    }
  };

  const handleDuplicateWorkspace = async (ws) => {
    if (!ws) return;
    setActionId(`duplicate-${ws._id}`);
    try {
      const res = await duplicateWorkspace(ws._id);
      await loadWorkspacesList();
      onWorkspaceChange(res.data.workspace);
    } catch (err) {
      console.error(err);
      onError?.(err.response?.data?.message || "Failed to duplicate workspace");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteWorkspace = async (ws) => {
    if (!ws) return;
    if (!window.confirm(`Are you sure you want to delete "${ws.name}"?\nThis will permanently delete the draft and all saved versions.`)) return;

    setActionId(`delete-${ws._id}`);
    try {
      await deleteWorkspace(ws._id);
      const updatedList = workspaces.filter((w) => w._id !== ws._id);
      setWorkspaces(updatedList);
      
      if (activeWorkspace?._id === ws._id) {
        if (updatedList.length > 0) {
          onWorkspaceChange(updatedList[0]);
        } else {
          // If no workspaces left, trigger re-load list which will handle creation in main page
          onWorkspaceChange(null);
        }
      }
    } catch (err) {
      console.error(err);
      onError?.(err.response?.data?.message || "Failed to delete workspace");
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (ver) => {
    if (!window.confirm(`Are you sure you want to restore Version ${ver.version} ("${ver.name}")?\nYour current unsaved draft will be overwritten.`)) return;

    setActionId(`restore-${ver._id}`);
    try {
      onRestoreVersion(ver);
      onClose();
    } catch (err) {
      console.error(err);
      onError?.("Failed to restore version");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteVersion = async (ver) => {
    if (!window.confirm(`Are you sure you want to delete Version ${ver.version} ("${ver.name}") permanently?`)) return;

    setActionId(`delete-ver-${ver._id}`);
    try {
      await deleteVersion(activeWorkspace._id, ver._id);
      await loadVersionsList(activeWorkspace._id);
    } catch (err) {
      console.error(err);
      onError?.(err.response?.data?.message || "Failed to delete version");
    } finally {
      setActionId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close history"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Workspace History</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage multiple resumes and historical versions</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Close">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Workspace Selector Section */}
            <div className="border-b border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Resume Workspace
                </label>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={actionId === "create-ws"}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50 dark:text-brand-400"
                >
                  {actionId === "create-ws" ? "Creating..." : "+ New Workspace"}
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <select
                  value={activeWorkspace?._id || ""}
                  onChange={(e) => {
                    const ws = workspaces.find((w) => w._id === e.target.value);
                    if (ws) onWorkspaceChange(ws);
                  }}
                  disabled={loadingWorkspaces}
                  className="flex-1 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {loadingWorkspaces && workspaces.length === 0 ? (
                    <option>Loading workspaces...</option>
                  ) : workspaces.length === 0 ? (
                    <option>No workspaces found</option>
                  ) : (
                    workspaces.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))
                  )}
                </select>

                <button
                  onClick={() => handleRenameWorkspace(activeWorkspace)}
                  disabled={!activeWorkspace || actionId === activeWorkspace._id}
                  className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Rename Workspace"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDuplicateWorkspace(activeWorkspace)}
                  disabled={!activeWorkspace || actionId === `duplicate-${activeWorkspace._id}`}
                  className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Duplicate Workspace"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteWorkspace(activeWorkspace)}
                  disabled={!activeWorkspace || actionId === `delete-${activeWorkspace._id}`}
                  className="rounded-xl border border-slate-200/80 bg-white p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  title="Delete Workspace"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Versions List Section */}
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Version History
              </h3>

              {loadingVersions && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <p className="mt-3 text-xs text-slate-500">Loading versions...</p>
                </div>
              )}

              {!loadingVersions && versions.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-900 dark:text-white">No saved versions yet</p>
                  <p className="mt-1 max-w-[240px] text-[10px] text-slate-500 dark:text-slate-400">
                    Click Save in the toolbar to freeze your current draft as an immutable version.
                  </p>
                </div>
              )}

              <ul className="space-y-3">
                {versions.map((v, i) => (
                  <motion.li
                    key={v._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-brand-200 hover:shadow dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-brand-500/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            V{v.version}
                          </span>
                          <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {v.name || "Unnamed Version"}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {v.jobTitle || "No title"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                        {v.template}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
                      <span className="text-[9px] text-slate-400">
                        {new Date(v.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPreviewVersion(v)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="Preview version"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRestore(v)}
                          disabled={actionId === `restore-${v._id}`}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-brand-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                          title="Restore version to active draft"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6.577M12 7v5l3 3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDownloadVersion(v)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="Download version PDF"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteVersion(v)}
                          disabled={actionId === `delete-ver-${v._id}`}
                          className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                          title="Delete version"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
