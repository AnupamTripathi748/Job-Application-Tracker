import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AreaChart as AreaIcon, BarChart3, PieChart as PieIcon, LineChart as TrendIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        {label && <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>}
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: item.color || item.payload?.fill || '#6366f1' }} 
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.name}:</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ChartsContainer = ({ monthlyData, statsData }) => {
  const [activeChart, setActiveChart] = useState('bar');

  // Prepare status chart data
  const pieData = [
    { name: 'Applied', value: statsData.Applied || 0 },
    { name: 'Assessments (OA)', value: statsData.OA || 0 },
    { name: 'Interviews', value: statsData.Interview || 0 },
    { name: 'HR Rounds', value: statsData.HR || 0 },
    { name: 'Offers', value: statsData.Offer || 0 },
    { name: 'Joined', value: statsData.Selected || 0 },
    { name: 'Rejected', value: statsData.Rejected || 0 },
  ].filter((item) => item.value > 0);

  const COLORS = {
    'Applied': '#6366f1', // Indigo
    'Assessments (OA)': '#0ea5e9', // Sky
    'Interviews': '#f59e0b', // Amber
    'HR Rounds': '#a855f7', // Purple
    'Offers': '#10b981', // Emerald
    'Joined': '#06b6d4', // Cyan
    'Rejected': '#f43f5e', // Rose
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Monthly trends chart (Bar/Area) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:col-span-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Monthly Application Trends</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">History tracker of pipeline submissions</p>
          </div>
          
          <div className="flex self-start rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
            <button
              onClick={() => setActiveChart('bar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeChart === 'bar'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-850 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Bar Chart
            </button>
            <button
              onClick={() => setActiveChart('area')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeChart === 'area'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-850 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <AreaIcon className="h-3.5 w-3.5" />
              Area Chart
            </button>
          </div>
        </div>

        <div className="mt-8 h-80 w-full text-xs">
          {!monthlyData || monthlyData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <TrendIcon className="h-10 w-10 stroke-1" />
              <p className="mt-2 font-medium">No application metrics tracked yet</p>
              <p className="text-xxs">Add your first SWE applications to generate timeline trends.</p>
            </div>
          ) : activeChart === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Applications" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorApplications)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stage distribution chart (Pie) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Pipeline Ratios</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Functional ratio of your pipeline</p>
        </div>

        <div className="relative mt-8 h-64 w-full">
          {pieData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <PieIcon className="h-10 w-10 stroke-1" />
              <p className="mt-2 font-medium">No ratios available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dynamic Legend */}
        {pieData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xxs font-medium text-slate-500 dark:text-slate-400">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[entry.name] }}
                />
                <span className="truncate">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsContainer;
