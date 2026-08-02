import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartsContainer from '../components/ChartsContainer';
import ResumeChecker from '../components/ResumeChecker';
import { Send, FileSearch, HelpCircle, Trophy, Ban, Sparkles, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyApplications, setMonthlyApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/jobs/stats');
      const { defaultStats, monthlyApplications: monthly } = response.data;
      setStats(defaultStats);
      setMonthlyApplications(monthly);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        
        {/* Stats Skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>

        {/* Charts Skeletons */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  // Cards display configuration
  const cardConfigs = [
    {
      title: 'Applied',
      count: stats?.Applied || 0,
      icon: <Send className="h-6 w-6" />,
      colorClass: 'indigo',
    },
    {
      title: 'Assessments (OA)',
      count: stats?.OA || 0,
      icon: <FileSearch className="h-6 w-6" />,
      colorClass: 'sky',
    },
    {
      title: 'Interviews',
      count: stats?.Interview || 0,
      icon: <HelpCircle className="h-6 w-6" />,
      colorClass: 'amber',
    },
    {
      title: 'Offers Secured',
      count: stats?.Offer || 0,
      icon: <Trophy className="h-6 w-6" />,
      colorClass: 'emerald',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title banner */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard Insights</h1>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardConfigs.map((card, i) => (
          <StatCard
            key={i}
            title={card.title}
            count={card.count}
            icon={card.icon}
            colorClass={card.colorClass}
          />
        ))}
      </div>

      {/* AI Resume Checker Section */}
      <ResumeChecker />

      {/* Analytics Charts */}
      {stats && (
        <ChartsContainer
          monthlyData={monthlyApplications}
          statsData={stats}
        />
      )}

      {/* Secondary Quick Metrics / Tips */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Secondary metric details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Extended Stage Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-900">
              <span className="font-semibold text-slate-500">HR Rounds</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{stats?.HR || 0} applications</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-900">
              <span className="font-semibold text-slate-500">Selected / Joined</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">{stats?.Selected || 0} applications</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="font-semibold text-slate-500">Rejected</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{stats?.Rejected || 0} applications</span>
            </div>
          </div>
        </div>

        {/* Motivational / Placement Prep Box */}
        <div className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-white p-6 shadow-sm dark:border-indigo-950 dark:from-indigo-950/10 dark:to-slate-950">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">SWE Career Milestones</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                You have active entries in your application funnel. Keep submitting resumes, complete your dsa challenges, prepare for system design questions, and practice TCS mock interviews.
              </p>
            </div>
          </div>
          <div className="mt-4 text-xxs font-semibold uppercase tracking-wider text-slate-400 text-right">
            Last updated: Today
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
