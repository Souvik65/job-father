'use client';

import { Job } from '@/types/job';
import { formatDate, buildShareText, jobUrl } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { AdUnlockButton } from './AdUnlockButton';
import { DateCard } from './DateCard';

interface JobDetailOverlayProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

export function JobDetailOverlay({ job, open, onClose }: JobDetailOverlayProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => {
      setShareOpen(false);
      setCopied(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [open]);

  if (!job && !open) return null;
  if (!job) {
    return (
      <div className={`fixed inset-0 z-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
    );
  }

  const shareText = buildShareText(job);
  const shareUrl = jobUrl(job);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, text: shareText, url: shareUrl });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      setShareOpen((v) => !v);
    }
  };

  const appStart = formatDate(job.timeline?.applicationStart || null);
  const appEnd = formatDate(job.timeline?.applicationEnd || null);
  const examDate = formatDate(job.timeline?.examDate || null);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Job Details"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity ${open ? 'opacity-50' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative h-full flex items-end sm:items-center justify-center sm:p-4">
        <div
          className={`bg-[#f9f9f9] rounded-2xl w-full max-w-4xl flex flex-col max-h-[95dvh] sm:max-h-[90dvh] transform transition ${
            open ? 'translate-y-0' : 'translate-y-full sm:scale-95'
          }`}
        >
          {/* Header bar */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
            <div className="w-8" />
            <span className="text-sm font-bold tracking-widest text-[#000666] uppercase">JOBFATHER</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto scrollbar-hide flex-1">
            <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-start">

              {/* ── Left column ── */}
              <div className="w-full md:w-2/3 flex flex-col gap-4">

                {/* Job Header card */}
                <section className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                  {/* Chips */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-0.5 bg-[#e0e0ff] text-[#000767] text-xs font-semibold rounded-full tracking-wide uppercase">
                      {job.category || 'Govt Job'}
                    </span>
                    {job.isPrivate && (
                      <span className="px-3 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full tracking-wide uppercase">
                        Private
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-[#000666] leading-tight">{job.title}</h1>
                  {job.organization && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {job.organization}
                    </p>
                  )}
                  {job.description && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                  )}
                </section>

                {/* Important Dates card */}
                {(appStart || appEnd || examDate) && (
                  <section className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Important Dates</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {appStart && (
                        <DateCard
                          icon={
                            <svg className="w-5 h-5 text-[#000666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          }
                          label="Application Start"
                          value={appStart}
                        />
                      )}
                      {appEnd && (
                        <DateCard
                          icon={
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          }
                          label="Last Date to Apply"
                          value={appEnd}
                          highlight
                        />
                      )}
                      {examDate && (
                        <DateCard
                          icon={
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          }
                          label="Exam Date"
                          value={examDate}
                        />
                      )}
                    </div>
                  </section>
                )}

                {/* Vacancy / eligibility card — shown when vacancies exist */}
                {job.totalVacancies && (
                  <section className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Vacancy Details</h2>
                    <div className="flex items-center gap-3 bg-[#f3f3f3] border border-gray-200 rounded-lg p-3">
                      <svg className="w-5 h-5 text-[#000666] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Posts</p>
                        <p className="text-sm font-bold text-gray-900">{job.totalVacancies}</p>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* ── Right column / sidebar ── */}
              <div className="w-full md:w-1/3 flex flex-col gap-4 md:sticky md:top-4">

                {/* Action card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="pb-3 border-b border-gray-100 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Application Deadline</span>
                    <span className="text-lg font-bold text-[#000666]">
                      {appEnd || '—'}
                    </span>
                  </div>

                  {/* Open to Unlock button via AdUnlockButton */}
                  <AdUnlockButton job={job} />


                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-2.5 border border-[#000666] text-[#000666] rounded-lg text-xs font-semibold tracking-wide hover:bg-[#e0e0ff] transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Job
                  </button>

                  {/* Share link box */}
                  {shareOpen && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-xs font-mono min-w-0"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition shrink-0 ${
                          copied ? 'bg-green-600 text-white' : 'bg-[#000666] text-white hover:bg-[#1a237e]'
                        }`}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Info notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <svg className="w-5 h-5 text-[#000666] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Always verify details from the official notification before applying. Ensure you meet all eligibility criteria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper sub-component ── */
