import { useEffect, useState } from "react";
import api from "../../services/api";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/dashboard/analytics");
        setStats({
          resumesBuilt: res.data.resumesBuilt ?? 0,
          atsAverageScore: res.data.atsAverageScore ?? 78,
          interviewsTaken: res.data.interviewsTaken ?? 0,
          bestScore: res.data.bestScore ?? 0,
          applicationsSent: res.data.applicationsSent ?? 0,
        });
      } catch {
        setStats({
          resumesBuilt: 3,
          atsAverageScore: 78,
          interviewsTaken: 12,
          bestScore: 8.4,
          applicationsSent: 7,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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
          value={loading ? "—" : stats.resumesBuilt}
          icon={IconResume}
          accent="indigo"
          trend="12%"
          trendUp
        />
        <StatCard
          label="ATS Average Score"
          value={loading ? "—" : stats.atsAverageScore}
          suffix="%"
          icon={IconATS}
          accent="violet"
          trend="8%"
          trendUp
        />
        <StatCard
          label="Interviews Taken"
          value={loading ? "—" : stats.interviewsTaken}
          icon={IconMock}
          accent="cyan"
          trend="3"
          trendUp
        />
        <StatCard
          label="Best Interview Score"
          value={loading ? "—" : stats.bestScore}
          suffix="/10"
          icon={IconInterview}
          accent="emerald"
          trend="0.6"
          trendUp
        />
        <StatCard
          label="Applications Sent"
          value={loading ? "—" : stats.applicationsSent}
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
        <ActivityFeed />
      </div>
    </PageShell>
  );
}
