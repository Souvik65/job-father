'use client';

import { useState, useEffect, useRef } from 'react';
import { Job } from '@/types/job';

const AD_URL = 'https://omg10.com/4/10835370';
const COUNTDOWN_SECONDS = 5;

interface AdUnlockButtonProps {
  job: Job;
  onUnlock?: () => void;
}

export function AdUnlockButton({ job, onUnlock }: AdUnlockButtonProps) {
  const [state, setState] = useState<'locked' | 'counting' | 'unlocked'>('locked');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleLockClick = () => {
    try {
      window.open(AD_URL, '_blank', 'noopener,noreferrer');
    } catch (e) {
      // Handle error silently
    }

    setState('counting');
    setCountdown(COUNTDOWN_SECONDS);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setState('unlocked');
          onUnlock?.();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  if (!job.sourceUrl) {
    return (
      <button
        disabled
        className="w-full px-4 py-3 bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1C6.48 1 2 5.48 2 11v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-5.52-4.48-10-10-10zm0 2c4.42 0 8 3.58 8 8v7H4v-7c0-4.42 3.58-8 8-8z" />
        </svg>
        NOT AVAILABLE
      </button>
    );
  }

  if (state === 'locked') {
    return (
      <button
        onClick={handleLockClick}
        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        OPEN TO UNLOCK
      </button>
    );
  }

  if (state === 'counting') {
    return (
      <button
        disabled
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <span className="inline-flex items-center justify-center">
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ strokeDasharray: '50.27', strokeDashoffset: `${50.27 * (1 - countdown / COUNTDOWN_SECONDS)}` }}
            />
          </svg>
          <span className="ml-1 font-bold">{countdown}</span>
        </span>
        UNLOCKING
      </button>
    );
  }

  // Unlocked state
  const isPrivate = !!job.isPrivate;
  const href = isPrivate ? (job.applyUrl ? `mailto:${job.applyUrl}` : null) : job.sourceUrl;

  if (!href) {
    return (
      <button
        disabled
        className="w-full px-4 py-3 bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        LINK NOT AVAILABLE
      </button>
    );
  }

  return (
    <a
      href={href}
      target={isPrivate ? undefined : '_blank'}
      rel={isPrivate ? undefined : 'noopener noreferrer'}
      className="flex w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium text-center hover:bg-green-700 transition items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isPrivate ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        )}
      </svg>
      {isPrivate ? 'SEND CV / RESUME' : 'APPLY ON WEBSITE'}
    </a>
  );
}
