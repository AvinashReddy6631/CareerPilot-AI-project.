import api from "./api";

export const generateQuestions = (role) =>
  api.post("/interview/generate-questions", { role });

export const evaluateAnswer = (payload) =>
  api.post("/interview/evaluate", payload);

export const generateFinalReport = (role, transcript) =>
  api.post("/interview/final-report", { role, transcript });

export const saveInterviewHistory = (payload) =>
  api.post("/interview-history/save", payload);
