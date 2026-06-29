import api from "./api";

export const generateRoadmap = (role) =>
  api.post("/roadmap/generate", { role });

export const fetchLatestRoadmap = () =>
  api.get("/roadmap/latest");

export const fetchRoadmapHistory = () =>
  api.get("/roadmap/history");

export const updateRoadmap = (id, data) =>
  api.put(`/roadmap/${id}`, data);
