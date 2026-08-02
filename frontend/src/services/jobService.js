import api from "./api";
import { getClientId } from "../utils/clientId";

export const searchJobs = (params) =>
  api.post("/jobs/search", params);

export const matchJob = (jobId, resumeText) =>
  api.post("/jobs/match", { jobId, resumeText });

export const saveJob = (job) =>
  api.post("/jobs/saved", { clientId: getClientId(), job });

export const getSavedJobs = () =>
  api.get("/jobs/saved", { params: { clientId: getClientId() } });

export const removeSavedJob = (id) =>
  api.delete(`/jobs/saved/${id}`, { params: { clientId: getClientId() } });

export const getApplications = () =>
  api.get("/applications", { params: { clientId: getClientId() } });

export const trackApplication = (job, status = "applied") =>
  api.post("/applications", { clientId: getClientId(), job, status });

export const updateApplication = (id, data) =>
  api.patch(`/applications/${id}`, data, { params: { clientId: getClientId() } });

export const deleteApplication = (id) =>
  api.delete(`/applications/${id}`, { params: { clientId: getClientId() } });
