import api from "./api";

export const getInterviewErrorMessage = (
  error,
  fallback = "The interview request failed. Please try again."
) => {
  if (!error.response) {
    return "Unable to reach the server. Please try again shortly.";
  }

  return error.response.data?.message || fallback;
};

export const generateQuestions = (role) =>
  api.post("/interview/generate-questions", { role });

export const evaluateAnswer = (payload) =>
  api.post("/interview/evaluate", payload);

export const generateFinalReport = (role, transcript) =>
  api.post("/interview/final-report", { role, transcript });

export const saveInterviewHistory = (payload) =>
  api.post("/interview-history/save", payload);
