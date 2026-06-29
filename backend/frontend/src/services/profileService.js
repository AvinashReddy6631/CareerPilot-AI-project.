import api from "./api";
import { getClientId } from "../utils/clientId";

export const fetchProfile = () => api.get("/profile");

export const updateProfile = (data) => api.put("/profile", data);

export const fetchProfileStats = () =>
  api.get("/profile/stats", { params: { clientId: getClientId() } });

export const fetchProfileHistory = () => api.get("/profile/history");
