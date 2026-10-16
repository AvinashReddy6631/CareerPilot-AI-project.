import api from "./api";

export const recordDailyActivity = () => api.post("/streak/activity");
