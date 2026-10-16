import { useEffect, useState } from "react";
import {
  fetchDashboardActivity,
  fetchDashboardAnalytics,
} from "../../services/dashboardService";
import PageShell from "../../components/dashboard/PageShell";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import PerformanceCharts from "../../components/dashboard/PerformanceCharts";
import StreakCard from "../../components/dashboard/StreakCard";
import { useAuth } from "../../context/AuthContext";
import {
  IconResume,
  IconATS,
  IconMock,
  IconInterview,
  IconApplications,
} from "../../components/dashboard/NavIcons";

const DEFAULT_STATS = {
  resumesBuilt: 0,
  atsAverageScore: 0,
  interviewsTaken: 0,
  bestScore: 0,
  applicationsSent: 0,
};

export default function Dashboard() {
  const { streak, streakError } = useAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState("30d");
  const [analyticsRetry, setAnalyticsRetry] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        setAnalyticsError("");
        setLoading(true);
        const res = await fetchDashboardAnalytics(analyticsRange);
        if (cancelled) return;
        setStats({
          resumesBuilt: res.data.resumesBuilt ?? 0,
          atsAverageScore: res.data.atsAverageScore ?? 0,
          interviewsTaken: res.data.interviewsTaken ?? 0,
          bestScore: res.data.bestScore ?? 0,
          applicationsSent: res.data.applicationsSent ?? 0,
        });
        setAnalytics(res.data?.charts || null);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setStats(DEFAULT_STATS);
          setAnalytics(null);
          setAnalyticsError(
            error.response?.data?.message ||
              error.message ||
              "Could not load dashboard analytics"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [analyticsRange, analyticsRetry]);

  useEffect(() => {
    let cancelled = false;

    const fetchActivity = async () => {
      try {
        setActivityError("");
        const res = await fetchDashboardActivity();
        if (cancelled) return;
        setActivities(res.data.activities || []);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setActivityError(
            error.response?.data?.message ||
              error.message ||
              "Could not load activity"
          );
          setActivities([]);
        }
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    };

    fetchActivity();
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageShell
      title={`${greeting()}, welcome back`}
      description="Here's an overview of your career progress and recent activity."
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          label="Resumes Built"
          value={stats.resumesBuilt}
          loading={loading}
          icon={IconResume}
          accent="indigo"
        />
        <StatCard
          label="ATS Average Score"
          value={stats.atsAverageScore}
          loading={loading}
          suffix="%"
          icon={IconATS}
          accent="violet"
        />
        <StatCard
          label="Interviews Taken"
          value={stats.interviewsTaken}
          loading={loading}
          icon={IconMock}
          accent="cyan"
        />
        <StatCard
          label="Best Interview Score"
          value={stats.bestScore}
          loading={loading}
          suffix="/10"
          icon={IconInterview}
          accent="emerald"
        />
        <StatCard
          label="Applications Sent"
          value={stats.applicationsSent}
          loading={loading}
          icon={IconApplications}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceCharts
            analytics={analytics}
            loading={loading}
            error={analyticsError}
            range={analyticsRange}
            onRangeChange={setAnalyticsRange}
            onRetry={() => setAnalyticsRetry((value) => value + 1)}
          />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <div className="mt-4">
        <StreakCard
          streak={streak}
          loading={!streak && !streakError}
          error={streakError}
        />
      </div>

      <div className="mt-4">
        <ActivityFeed
          activities={activities}
          loading={activityLoading}
          error={activityError}
        />
      </div>
    </PageShell>
  );
}
