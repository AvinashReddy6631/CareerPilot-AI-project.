import api from "./api";

export const fetchDashboardAnalytics = () => api.get("/dashboard/analytics");

export const fetchDashboardActivity = () => api.get("/dashboard/activity");
