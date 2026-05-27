import React from 'react';

export function DateCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 border rounded-lg p-3 ${highlight ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40' : 'bg-[#f3f3f3] dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-bold ${highlight ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-slate-100'}`}>{value}</p>
      </div>
    </div>
  );
}
