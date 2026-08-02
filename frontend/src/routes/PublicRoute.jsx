import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isRestoring, isAuthenticated } = useAuth();

  if (isRestoring) {
    return <div className="min-h-screen bg-slate-950" aria-label="Restoring your session" />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}
