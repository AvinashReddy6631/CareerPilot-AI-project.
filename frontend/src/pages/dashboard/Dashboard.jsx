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
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetchDashboardAnalytics();
        setStats({
          resumesBuilt: res.data.resumesBuilt ?? 0,
          atsAverageScore: res.data.atsAverageScore ?? 0,
          interviewsTaken: res.data.interviewsTaken ?? 0,
          bestScore: res.data.bestScore ?? 0,
          applicationsSent: res.data.applicationsSent ?? 0,
        });
      } catch (error) {
        console.error(error);
        setStats(DEFAULT_STATS);
      } finally {
        setLoading(false);
      }
    };

    const fetchActivity = async () => {
      try {
        setActivityError("");
        const res = await fetchDashboardActivity();
        setActivities(res.data.activities || []);
      } catch (error) {
        console.error(error);
        setActivityError(
          error.response?.data?.message ||
            error.message ||
            "Could not load activity"
        );
        setActivities([]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchAnalytics();
    fetchActivity();
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Resumes Built"
          value={stats.resumesBuilt}
          loading={loading}
          icon={IconResume}
          accent="indigo"
          trend="12%"
          trendUp
        />
        <StatCard
          label="ATS Average Score"
          value={stats.atsAverageScore}
          loading={loading}
          suffix="%"
          icon={IconATS}
          accent="violet"
          trend="8%"
          trendUp
        />
        <StatCard
          label="Interviews Taken"
          value={stats.interviewsTaken}
          loading={loading}
          icon={IconMock}
          accent="cyan"
          trend="3"
          trendUp
        />
        <StatCard
          label="Best Interview Score"
          value={stats.bestScore}
          loading={loading}
          suffix="/10"
          icon={IconInterview}
          accent="emerald"
          trend="0.6"
          trendUp
        />
        <StatCard
          label="Applications Sent"
          value={stats.applicationsSent}
          loading={loading}
          icon={IconApplications}
          accent="amber"
          trend="2"
          trendUp
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceCharts />
        </div>
        <div>
          <QuickActions />
        </div>
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
