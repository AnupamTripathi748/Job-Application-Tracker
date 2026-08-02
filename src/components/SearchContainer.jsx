import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

const SearchContainer = ({ onSearchChange, isLoading }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [jobType, setJobType] = useState('all');
  const [workMode, setWorkMode] = useState('all');
  const [sort, setSort] = useState('latest');

  // Propagate changes on state update
  useEffect(() => {
    onSearchChange({ search, status, jobType, workMode, sort });
  }, [search, status, jobType, workMode, sort]);

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setJobType('all');
    setWorkMode('all');
    setSort('latest');
  };

  const statusOptions = ['all', 'Applied', 'OA', 'Interview', 'HR', 'Offer', 'Rejected', 'Selected'];
  const jobTypeOptions = ['all', 'full-time', 'part-time', 'internship', 'contract'];
  const workModeOptions = ['all', 'remote', 'on-site', 'hybrid'];
  const sortOptions = [
    { value: 'latest', label: 'Latest Added' },
    { value: 'oldest', label: 'Oldest Added' },
    { value: 'a-z', label: 'Alphabetical (A-Z)' },
    { value: 'z-a', label: 'Alphabetical (Z-A)' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {/* Title block */}
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-900">
        <div className="flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Search Filters</h2>
        </div>
        
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50 dark:text-rose-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>

      {/* Search Grid inputs */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Search Text */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="search" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Search Positions</label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="e.g. TCS, Google..."
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
            />
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Application Stage</label>
          <select
            id="status"
            value={status || 'all'}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'All Stages' : opt}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="jobType" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Type</label>
          <select
            id="jobType"
            value={jobType || 'all'}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
          >
            {jobTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'All Types' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Work Mode */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="workMode" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Work Mode</label>
          <select
            id="workMode"
            value={workMode || 'all'}
            onChange={(e) => setWorkMode(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
          >
            {workModeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'All Modes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sort" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort By</label>
          <div className="flex gap-2">
            <select
              id="sort"
              value={sort || 'latest'}
              onChange={(e) => setSort(e.target.value)}
              className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchContainer;
