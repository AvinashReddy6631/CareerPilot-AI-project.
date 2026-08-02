import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://careerpilot-ai-project.onrender.com";
const api = axios.create({
  baseURL: `${API_URL}/api`,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("careerpilot:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
