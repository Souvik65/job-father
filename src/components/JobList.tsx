'use client';

import { Job } from '@/types/job';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  onJobClick?: (job: Job) => void;
  onJobShare?: (job: Job) => void;
}

export function JobList({ jobs, loading = false, onJobClick, onJobShare }: JobListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 select-none">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#ff7315]"></div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16  select-none text-center px-4">
        <svg
          className="w-12 h-12 text-slate-500 mb-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
          />
        </svg>
        <h4 className="text-slate-800 font-extrabold text-3xl uppercase tracking-wider ">No matching jobs found</h4>
        <p className="text-slate-400 text-md mt-1">Try selecting another category or search filter above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="region" aria-label="Job listings">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onViewClick={onJobClick}
          onShareClick={onJobShare}
        />
      ))}
    </div>
  );
}
