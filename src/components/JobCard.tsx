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
    <div className="border border-slate-200 shadow-xl rounded-xl bg-white hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300 select-none overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-slate-800 text-base md:text-lg truncate">
            {job.title}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {/* Category Tag - Warm Orange pill */}
            <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200/60 text-[10px] font-black uppercase tracking-wider rounded">
              {job.category}
            </span>
            
            {/* Date Tag - Crimson Red pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200/60 text-[10px] font-black uppercase tracking-wider rounded">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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

        {/* Actions - matching the bold dark theme VIEW / border SHARE layout */}
        <div className="flex gap-2 shrink-0 items-center">
          {/* VIEW Button - Navy bg, bold all caps, eye icon */}
          <button
            onClick={() => onViewClick?.(job)}
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-wider rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            aria-label={`View ${job.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>VIEW</span>
          </button>
          
          {/* SHARE Button - White bg, gray border, bold all caps, share icon */}
          <button
            onClick={() => onShareClick?.(job)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            aria-label={`Share ${job.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.263-2.63m0 7.776l-5.263-2.63m1.263-.842a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm7.5-6.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm0 13a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
            </svg>
            <span>SHARE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
