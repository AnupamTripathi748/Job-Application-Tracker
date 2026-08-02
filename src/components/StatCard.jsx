import React from 'react';
import { motion } from 'motion/react';

const StatCard = ({ title, count, icon, colorClass }) => {
  const colorMaps = {
    indigo: {
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-950',
      accentBg: 'bg-indigo-100/70 dark:bg-indigo-950/60',
    },
    amber: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-950',
      accentBg: 'bg-amber-100/70 dark:bg-amber-950/60',
    },
    emerald: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-950',
      accentBg: 'bg-emerald-100/70 dark:bg-emerald-950/60',
    },
    rose: {
      bg: 'bg-rose-50/50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-950',
      accentBg: 'bg-rose-100/70 dark:bg-rose-950/60',
    },
    sky: {
      bg: 'bg-sky-50/50 dark:bg-sky-950/20',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-100 dark:border-sky-950',
      accentBg: 'bg-sky-100/70 dark:bg-sky-950/60',
    },
    purple: {
      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-950',
      accentBg: 'bg-purple-100/70 dark:bg-purple-950/60',
    },
  };

  const currentColors = colorMaps[colorClass] || colorMaps.indigo;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center justify-between rounded-2xl border ${currentColors.border} ${currentColors.bg} p-6 shadow-sm`}
    >
      <div>
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          {title}
        </p>
        <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          {count}
        </h3>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${currentColors.accentBg} ${currentColors.text}`}>
        {icon}
      </div>
    </motion.div>
  );
};

export default StatCard;
