import React from 'react';
import { MapPin, Calendar, DollarSign, Briefcase, Sparkles, Trash2, Edit } from 'lucide-react';
import { motion } from 'motion/react';

const JobCard = ({ job, onEdit, onDelete }) => {
  const {
    _id,
    company,
    position,
    location,
    salary,
    jobType,
    workMode,
    applicationDate,
    status,
    notes,
  } = job;

  // Format applicationDate nicely
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Dynamic colors for the job status badges
  const statusColors = {
    Applied: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900',
    OA: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-100 dark:border-sky-900',
    Interview: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900',
    HR: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100 dark:border-purple-900',
    Offer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
    Rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900',
    Selected: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900',
  };

  // Capitalize tags (e.g. full-time -> Full-Time)
  const formatTag = (str) => {
    return str
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <div>
        {/* Header (Avatar and Status) */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo placeholder */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-base font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{position}</h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{company}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              statusColors[status] || statusColors.Applied
            }`}
          >
            {status}
          </span>
        </div>

        {/* Info Grid */}
        <div className="mt-5 grid grid-cols-2 gap-x-2 gap-y-3 border-t border-slate-50 pt-4 text-xs font-medium text-slate-600 dark:border-slate-900 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{formatDate(applicationDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span>{salary || 'Not specified'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <span>{formatTag(jobType)} / {formatTag(workMode)}</span>
          </div>
        </div>

        {/* Notes preview */}
        {notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900/50">
            <p className="text-xxs font-semibold uppercase tracking-wider text-slate-400">Notes</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
              {notes}
            </p>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-900">
        <button
          onClick={() => onEdit(job)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(_id)}
          className="flex items-center gap-1.5 rounded-lg border border-transparent bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;
