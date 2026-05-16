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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-600 text-lg">No jobs found</p>
        <p className="text-gray-500 text-sm">Try a different category or check back later</p>
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
