import { useState, useEffect, useCallback } from "react";
import PageShell from "../../components/dashboard/PageShell";
import ProfileHeader from "../../components/profile/ProfileHeader";
import CareerReadiness from "../../components/profile/CareerReadiness";
import ProfileCompletion from "../../components/profile/ProfileCompletion";
import HistorySection from "../../components/profile/HistorySection";
import EditProfileDrawer from "../../components/profile/EditProfileDrawer";
import Toast from "../../components/resume/Toast";
import { useAuth } from "../../context/AuthContext";
import {
  fetchProfile,
  updateProfile,
  fetchProfileStats,
  fetchProfileHistory,
} from "../../services/profileService";
import { computeProfileCompletion } from "../../utils/profileCompletion";
import { getRoadmapProgressPercent } from "../../utils/roadmapProgressStorage";

const DEFAULT_STATS = {
  atsAverageScore: 0,
  interviewAverageScore: 0,
  roadmapProgress: 0,
  applicationsSent: 0,
};

const EMPTY_HISTORY = {
  resumes: [],
  interviews: [],
  atsScans: [],
  roadmaps: [],
};

export default function Profile() {
  const { updateUser } = useAuth();

  const [user, setUser] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [history, setHistory] = useState(EMPTY_HISTORY);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Load profile ONCE when this Profile page mounts.
  // Do not depend on the local `user` state or auth user state,
  // because updateUser() below updates the auth context.
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchProfile();
      const profileUser = res.data.user;

      setUser(profileUser);
      setMissingFields(res.data.missingFields || []);

      // Sync the profile into AuthContext.
      // This must NOT cause loadProfile itself to run again.
      updateUser(profileUser);
    } catch (err) {
      console.error("Failed to load profile:", err);

      setError(
        err.response?.data?.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  // Load profile history independently.
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const res = await fetchProfileHistory();

      setHistory(res.data.history || EMPTY_HISTORY);
    } catch (err) {
      console.error("Failed to load profile history:", err);

      setHistory(EMPTY_HISTORY);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Profile and history are loaded when the page mounts.
  useEffect(() => {
    loadProfile();
    loadHistory();
  }, [loadProfile, loadHistory]);

  // Load statistics when the target role changes.
  const loadStats = useCallback(async (targetRole) => {
    setStatsLoading(true);

    try {
      const res = await fetchProfileStats();
      const serverStats = res.data.stats || DEFAULT_STATS;

      const localRoadmapProgress =
        getRoadmapProgressPercent(targetRole);

      setStats({
        ...serverStats,
        roadmapProgress: Math.max(
          serverStats.roadmapProgress,
          localRoadmapProgress
        ),
      });
    } catch (err) {
      console.error("Failed to load profile stats:", err);

      setStats({
        ...DEFAULT_STATS,
        roadmapProgress: getRoadmapProgressPercent(targetRole),
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats(user?.targetRole || "");
  }, [user?.targetRole, loadStats]);

  const handleSave = async (formData) => {
    setSaving(true);
    setSaveError("");

    try {
      const res = await updateProfile(formData);
      const updated = res.data.user;

      setUser(updated);
      setMissingFields(res.data.missingFields || []);

      updateUser(updated);

      setDrawerOpen(false);

      showToast("Profile updated successfully");

      // Refresh stats after profile update.
      loadStats(updated.targetRole || "");
    } catch (err) {
      console.error("Failed to update profile:", err);

      setSaveError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const completionPercent =
    user?.profileCompletion ?? computeProfileCompletion(user);

  if (loading && !user) {
    return (
      <PageShell
        title="Profile"
        description="Manage your account and career preferences."
      >
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Profile"
      description="Manage your account, career preferences, and readiness scores."
    >
      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {error}
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <ProfileHeader
          user={user}
          onEdit={() => setDrawerOpen(true)}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <CareerReadiness
              stats={stats}
              loading={statsLoading}
            />
          </div>

          <div>
            <ProfileCompletion
              percent={completionPercent}
              missingFields={missingFields}
              onEdit={() => setDrawerOpen(true)}
            />
          </div>
        </div>

        <HistorySection
          history={history}
          loading={historyLoading}
        />

        <div className="dash-card p-5 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Profile Details
          </h3>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
            {[
              { label: "Full Name", value: user?.name },
              { label: "Email", value: user?.email },
              { label: "Phone", value: user?.phone },
              { label: "College", value: user?.college },
              { label: "Degree", value: user?.degree },
              {
                label: "Graduation Year",
                value: user?.graduationYear,
              },
              {
                label: "Target Role",
                value: user?.targetRole,
              },
              {
                label: "Skills",
                value: user?.skills?.join(", "),
              },
              {
                label: "LinkedIn",
                value: user?.linkedinUrl,
              },
              {
                label: "GitHub",
                value: user?.githubUrl,
              },
              {
                label: "Portfolio",
                value: user?.portfolioUrl,
              },
            ].map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between border-b border-slate-100 py-3.5 last:border-0 dark:border-slate-800 sm:px-3"
              >
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {field.label}
                </span>

                <span className="max-w-[55%] truncate text-right text-sm font-medium text-slate-900 dark:text-white">
                  {field.value || (
                    <span className="text-slate-300 dark:text-slate-600">
                      Not set
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditProfileDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSaveError("");
        }}
        user={user}
        onSave={handleSave}
        saving={saving}
        error={saveError}
      />

      <Toast toast={toast} />
    </PageShell>
  );
}