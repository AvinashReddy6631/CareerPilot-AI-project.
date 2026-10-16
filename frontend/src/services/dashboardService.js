import api from "./api";

export const fetchDashboardAnalytics = (range = "30d") =>
  api.get("/dashboard/analytics", { params: { range } });

export const fetchDashboardActivity = () => api.get("/dashboard/activity");
