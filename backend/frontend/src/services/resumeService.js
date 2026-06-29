import api from "./api";

export const saveResume = (data) => api.post("/resume-builder/create", data);

export const generateSummary = (data) =>
  api.post("/resume-builder/generate-summary", data);

export const fetchResumeHistory = () => api.get("/resume-builder/history");

export const fetchResumeById = (id) => api.get(`/resume-builder/${id}`);

export const analyzeResumeAts = (formData) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
