'use client';

import { Job } from '@/types/job';
import { JobCard } from './JobCard';
import { AdSlot } from '@/components/AdSlot';
import { Ad } from '@prisma/client';

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  onJobClick?: (job: Job) => void;
  onJobShare?: (job: Job) => void;
  inlineAd?: Ad | null;
}

function JobListHeader({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <div
      className="sticky top-0 z-30 grid border-b-2 border-b-[#f97316]"
      style={{
        background: 'linear-gradient(90deg,#0f172a,#1e293b)',
        height: '44px',
        gridTemplateColumns: '1fr 96px',
        padding: '0 0 0 16px',
      }}
    >
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="h-2.5 bg-white/10 rounded w-28 animate-pulse" />
        ) : (
          <>
            <svg
              className="shrink-0 text-[#64748b] w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
            <span
              className="font-black uppercase text-[#64748b]"
              style={{ fontSize: '10px', letterSpacing: '0.8px' }}
            >
              JOB DESCRIPTION
            </span>
          </>
        )}
      </div>
      <div className="flex items-center justify-center pr-2">
        {isLoading ? (
          <div className="h-2.5 bg-white/10 rounded w-12 animate-pulse" />
        ) : (
          <span
            className="font-black uppercase text-[#64748b]"
            style={{ fontSize: '10px', letterSpacing: '0.8px' }}
          >
            DETAILS
          </span>
        )}
      </div>
    </div>
  );
}

export function JobList({ jobs, loading = false, onJobClick, onJobShare, inlineAd }: JobListProps) {
  /* ── Skeleton (loading) ── */
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-[#111d2e]" aria-hidden="true">
        <JobListHeader isLoading={true} />

        {/* Skeleton rows */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid border-b border-[#e8edf5] dark:border-white/[0.07] animate-pulse"
            style={{ gridTemplateColumns: '1fr 96px', padding: '13px 0 13px 16px' }}
          >
            <div className="pr-2.5 space-y-2">
              <div className="h-3.5 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
              <div className="flex gap-1.25">
                <div className="h-4.5 bg-slate-200 dark:bg-white/10 rounded-full w-12" />
                <div className="h-4.5 bg-slate-200 dark:bg-white/10 rounded-full w-20" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 pr-2.5 pl-1">
              <div className="h-7.5 w-19 bg-slate-200 dark:bg-white/10 rounded-md" />
              <div className="h-6.5 w-19 bg-slate-100 dark:bg-white/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Empty state ── */
  if (jobs.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-[#111d2e]">
        <JobListHeader />

        {/* Empty message */}
        <div className="py-16 px-5 text-center text-[#94a3b8] select-none">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-35" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-[13px] font-bold">No matching jobs found</p>
        </div>
      </div>
    );
  }

  /* ── Job list ── */
  return (
    <div className="w-full bg-white dark:bg-[#111d2e]" role="region" aria-label="Job listings">
      <JobListHeader />

      {/* Rows */}
      {jobs.map((job, index) => (
        <div key={job.id}>
          <JobCard
            job={job}
            onViewClick={onJobClick}
            onShareClick={onJobShare}
          />
          {index === 2 && inlineAd && (
            <div className="border-b border-[#e8edf5] dark:border-white/[0.07] p-4 bg-white dark:bg-[#111d2e]">
              <AdSlot id={`inlineAd-${job.id}`} ad={inlineAd} className="h-20 sm:h-24 w-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
