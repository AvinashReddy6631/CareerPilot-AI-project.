import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <div
        className="min-h-screen bg-slate-950"
        aria-label="Restoring your session"
      />
    );
  }

  return children;
}