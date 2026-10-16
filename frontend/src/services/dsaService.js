import api from "./api";

export const fetchDsaModule = () => api.get("/dsa");

export const updateDsaProgress = (topicId, completed) =>
  api.put(`/dsa/progress/${encodeURIComponent(topicId)}`, { completed });
