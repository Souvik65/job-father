'use client';

import Link from 'next/link';
import { Job } from '@/types/job';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface JobCardProps {
  job: Job;
  onViewClick?: (job: Job) => void;
  onShareClick?: (job: Job) => void;
}

export function JobCard({ job, onViewClick, onShareClick }: JobCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg hover:shadow-md transition bg-white overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate">
            {job.title}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {job.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(job.timeline?.applicationEnd || null)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0 items-center">
          <button
            onClick={() => onViewClick?.(job)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            aria-label={`View ${job.title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View
          </button>
          <button
            onClick={() => onShareClick?.(job)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition shrink-0 flex items-center justify-center"
            aria-label={`Share ${job.title}`}
          >
            <Image
              src="/share.svg"
              alt="Share job"
              width={18}
              height={18}
            />          
          </button>
        </div>
      </div>
    </div>
  );
}
