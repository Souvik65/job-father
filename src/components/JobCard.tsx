'use client';

import { Job } from '@/types/job';
import { formatDate } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onViewClick?: (job: Job) => void;
  onShareClick?: (job: Job) => void;
}

export function JobCard({ job, onViewClick, onShareClick }: JobCardProps) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 select-none overflow-hidden">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base md:text-lg leading-snug line-clamp-2 sm:truncate">
            {job.title}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Category Tag */}
            <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 text-[10px] font-black uppercase tracking-wider rounded">
              {job.category}
            </span>

            {/* Date Tag */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 text-[10px] font-black uppercase tracking-wider rounded">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(job.timeline?.applicationEnd || null)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0 items-center">
          {/* VIEW Button */}
          <button
            onClick={() => onViewClick?.(job)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-[#1e293b] dark:bg-orange-600 hover:bg-[#0f172a] dark:hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-wider rounded-md transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-target"
            aria-label={`View ${job.title}`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>VIEW</span>
          </button>

          {/* SHARE Button */}
          <button
            onClick={() => onShareClick?.(job)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-[10px] font-black uppercase tracking-wider rounded-md transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 touch-target"
            aria-label={`Share ${job.title}`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.263-2.63m0 7.776l-5.263-2.63m1.263-.842a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm7.5-6.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm0 13a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
            </svg>
            <span>SHARE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
