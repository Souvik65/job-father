'use client';

import { Job } from '@/types/job';
import { formatDate } from '@/lib/utils';
import { Eye, Share2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onViewClick?: (job: Job) => void;
  onShareClick?: (job: Job) => void;
}

export function JobCard({ job, onViewClick, onShareClick }: JobCardProps) {
  return (
    <div
      className="
        grid border-b border-[#e8edf5] dark:border-white/[0.07]
        border-l-[3px] border-l-transparent
        hover:bg-[#fff7ed] dark:hover:bg-orange-500/4
        hover:border-l-[#f97316]
        transition-colors duration-150
        bg-white dark:bg-[#111d2e]
        select-none
        py-3 sm:py-3
      "
      style={{ gridTemplateColumns: '1fr 96px' }}
    >
      {/* Left — job info */}
      <div className="py-3.25 pl-4 pr-2.5 min-w-0">
        <h3
          className="font-bold text-[#1e293b] dark:text-slate-100 leading-[1.35] mb-1.5 truncate"
          style={{ fontSize: '14px' }}
        >
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.25">
          {/* Category pill */}
          <span
            className="inline-flex items-center font-black uppercase text-[#c2410c] dark:text-orange-400 bg-[#fff7ed] dark:bg-orange-950/30 border border-[#fed7aa] dark:border-orange-800/40 rounded-[20px]"
            style={{ fontSize: '9px', letterSpacing: '0.5px', padding: '2px 8px' }}
          >
            {job.category}
          </span>

          {/* Date pill */}
          <span
            className="inline-flex items-center gap-1 font-bold uppercase text-[#dc2626] dark:text-red-400 bg-[#fff0f0] dark:bg-red-950/30 border border-[#fecaca] dark:border-red-800/40 rounded-[20px]"
            style={{ fontSize: '9.5px', letterSpacing: '0.4px', padding: '2px 8px' }}
          >
            {/* Calendar icon */}
            <svg
              className="shrink-0"
              style={{ width: '9px', height: '9px' }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(job.timeline?.applicationEnd || null)}
          </span>
        </div>
      </div>

      {/* Right — details cell */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ gap: '6px', padding: '0 10px 0 4px' }}
      >
        {/* VIEW button */}
        <button
          onClick={() => onViewClick?.(job)}
          className="
            inline-flex items-center justify-center gap-1.25
            bg-[#1e293b] hover:bg-[#0f172a]
            dark:bg-[#1e293b] dark:hover:bg-[#0f172a]
            text-white
            border border-[#1e293b]
            rounded-md
            font-bold uppercase tracking-[0.6px]
            cursor-pointer
            shadow-[0_1px_3px_rgba(0,0,0,0.18)]
            active:translate-y-px active:shadow-inner
            transition-transform duration-100
          "
          style={{ height: '30px', width: '76px', fontSize: '9.5px' }}
          aria-label={`View ${job.title}`}
        >
          {/* Eye icon */}
          <Eye size={12} strokeWidth={2} aria-hidden="true" />
          VIEW
        </button>

        {/* SHARE button */}
        <button
          onClick={() => onShareClick?.(job)}
          className="
            inline-flex items-center justify-center gap-1.25
            bg-transparent hover:bg-slate-50
            dark:hover:bg-white/5
            text-[#64748b] dark:text-slate-400
            border border-[#cbd5e1] dark:border-white/15
            rounded-md
            font-bold uppercase tracking-[0.5px]
            cursor-pointer
            active:translate-y-px
            transition-transform duration-100
          "
          style={{ height: '26px', width: '76px', fontSize: '9px' }}
          aria-label={`Share ${job.title}`}
        >
          {/* Share icon */}
          <Share2 size={12} strokeWidth={2} aria-hidden="true" />
          SHARE
        </button>
      </div>
    </div>
  );
}
