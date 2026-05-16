'use client';

import { Job } from '@/types/job';
import { formatDate, buildShareText, jobUrl } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { AdUnlockButton } from './AdUnlockButton';

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
    // Cleanup runs when overlay is closed
    const timer = setTimeout(() => {
      setShareOpen(false);
      setCopied(false);
    }, 300); // delay matches transition duration
    return () => clearTimeout(timer);
  }, [open]);

  if (!job && !open) return null;
  if (!job) {
    // Render empty overlay during close transition
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
        await navigator.share({
          title: job.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      setShareOpen(true);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Job Details"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity ${
          open ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative min-h-full flex items-end sm:items-center justify-center p-4">
        <div
          className={`bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition ${
            open ? 'translate-y-0' : 'translate-y-full sm:scale-95'
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">JOBFATHER</h2>
            <div className="w-10" />
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Title and meta */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{job.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {job.category}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
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

            {/* Description */}
            {job.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            {/* Ad unlock button or action */}
            <div>
              <AdUnlockButton job={job} />
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share Job
            </button>

            {/* Share link box */}
            {shareOpen && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded font-medium text-sm transition ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Info notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-sm text-blue-800">
                This is a sample notification. Always verify official links before applying.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
