import api from "./api";

// Legacy ResumeBuilder APIs (Backward Compatibility)
export const saveResume = (data) => api.post("/resume-builder/create", data);
export const generateSummary = (data) => api.post("/resume-builder/generate-summary", data);
export const fetchResumeHistory = () => api.get("/resume-builder/history");
export const fetchLatestResume = () => api.get("/resume-builder/latest");
export const fetchResumeById = (id) => api.get(`/resume-builder/${id}`);
export const updateResume = (id, data) => api.put(`/resume-builder/${id}`, data);
export const deleteResume = (id) => api.delete(`/resume-builder/${id}`);

// ATS Upload API
export const analyzeResumeAts = (formData) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Workspaces APIs
export const fetchWorkspaces = () => api.get("/resume-builder/workspaces");
export const createWorkspace = (data) => api.post("/resume-builder/workspaces", data);
export const fetchWorkspaceById = (id) => api.get(`/resume-builder/workspaces/${id}`);
export const renameWorkspace = (id, name) => api.put(`/resume-builder/workspaces/${id}/rename`, { name });
export const duplicateWorkspace = (id) => api.post(`/resume-builder/workspaces/${id}/duplicate`);
export const deleteWorkspace = (id) => api.delete(`/resume-builder/workspaces/${id}`);

// Drafts APIs
export const fetchDraft = (workspaceId) => api.get(`/resume-builder/workspaces/${workspaceId}/draft`);
export const saveDraft = (workspaceId, content) => api.put(`/resume-builder/workspaces/${workspaceId}/draft`, { content });

// Versions APIs
export const saveVersion = (workspaceId, name, content) => api.post(`/resume-builder/workspaces/${workspaceId}/versions`, { name, content });
export const fetchVersionHistory = (workspaceId) => api.get(`/resume-builder/workspaces/${workspaceId}/versions`);
export const fetchVersionById = (workspaceId, versionId) => api.get(`/resume-builder/workspaces/${workspaceId}/versions/${versionId}`);
export const restoreVersion = (workspaceId, versionId) => api.post(`/resume-builder/workspaces/${workspaceId}/versions/${versionId}/restore`);
export const deleteVersion = (workspaceId, versionId) => api.delete(`/resume-builder/workspaces/${workspaceId}/versions/${versionId}`);

