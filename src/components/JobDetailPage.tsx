"use client";

import { Job } from "@/types/job";
import { formatDate, buildShareText, jobUrl } from "@/lib/utils";
import { useState } from "react";
import { AdUnlockButton } from "./AdUnlockButton";
import { DateCard } from "./DateCard";
import { Header } from "./Header";
import { Footer } from "./Footer";
import Link from "next/link";

interface JobDetailPageProps {
  job: Job;
  portalName?: string;
}

export function JobDetailPage({
  job,
  portalName = "Jobfather",
}: JobDetailPageProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText(job);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/job/${job.slug}`
      : jobUrl(job);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
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
        console.error("Share failed:", err);
      }
    } else {
      setShareOpen((v) => !v);
    }
  };

  const appStart = formatDate(job.timeline?.applicationStart || null);
  const appEnd = formatDate(job.timeline?.applicationEnd || null);
  const examDate = formatDate(job.timeline?.examDate || null);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Header portalName={portalName} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {/* Back navigation row */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-[#ee6f14] dark:text-slate-400 dark:hover:text-[#ee6f14] transition-colors cursor-pointer select-none"
          >
            <svg
              className="w-4 h-4 stroke-current"
              fill="none"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span>Back to All Jobs</span>
          </Link>
        </div>

        <div className="w-full flex flex-col-reverse md:flex-row gap-4 sm:gap-6 items-start">
          {/* ── Left column ── */}
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            {/* Job Header card */}
            <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-3 shadow-sm">
              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#e0e0ff] dark:bg-indigo-950/40 text-[#000767] dark:text-indigo-300 text-xs font-semibold rounded-full tracking-wide uppercase">
                  {job.category || "Govt Job"}
                </span>
                {job.isPrivate && (
                  <span className="px-3 py-1 bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs font-semibold rounded-full tracking-wide uppercase">
                    Private
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#000666] dark:text-indigo-400 leading-tight">
                {job.title}
              </h1>
              {job.organization && (
                <p className="text-sm text-gray-500 dark:text-slate-450 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-slate-300">
                    {job.organization}
                  </span>
                </p>
              )}
              {job.description && (
                <p className="text-sm text-gray-600 dark:text-slate-350 whitespace-pre-wrap leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-4 mt-2">
                  {job.description}
                </p>
              )}
            </section>

            {/* Important Dates card */}
            {(appStart || appEnd || examDate) && (
              <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-800 pb-3">
                  Important Dates
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {appStart && (
                    <DateCard
                      icon={
                        <svg
                          className="w-5 h-5 text-[#000666] dark:text-indigo-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      }
                      label="Application Start"
                      value={appStart}
                    />
                  )}
                  {appEnd && (
                    <DateCard
                      icon={
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
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
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      }
                      label="Exam Date"
                      value={examDate}
                    />
                  )}
                </div>
              </section>
            )}

            {/* Vacancy / eligibility card */}
            {job.totalVacancies && (
              <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-800 pb-3">
                  Vacancy Details
                </h2>
                <div className="flex items-center gap-4 bg-[#f3f3f3] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                  <svg
                    className="w-6 h-6 text-[#000666] dark:text-indigo-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-black text-gray-400 dark:text-slate-450 uppercase tracking-widest">
                      Total Posts
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-slate-100">
                      {job.totalVacancies}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Right column / sidebar ── */}
          <div className="w-full md:w-1/3 flex flex-col gap-6 md:sticky md:top-24">
            {/* Action card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="pb-4 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-1">
                <span className="text-xs font-black text-gray-400 dark:text-slate-450 uppercase tracking-widest">
                  Application Deadline
                </span>
                <span className="text-xl font-black text-[#000666] dark:text-indigo-400">
                  {appEnd || "—"}
                </span>
              </div>

              {/* Open to Unlock button */}
              <AdUnlockButton job={job} />

              {/* Share button */}
              <button
                onClick={handleShare}
                className="w-full px-5 py-3 border border-[#000666] dark:border-indigo-400 text-[#000666] dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#e0e0ff] dark:hover:bg-indigo-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 touch-target"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>Share Job</span>
              </button>

              {/* Share link box */}
              {shareOpen && (
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 flex gap-2 animate-[fadeIn_0.2s_ease-out]">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-2 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono min-w-0 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-[#000666] text-white hover:bg-[#1a237e]"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            {/* Info notice */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5 flex gap-3 shadow-inner">
              <svg
                className="w-5 h-5 text-[#000666] dark:text-indigo-400 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed font-semibold">
                Always verify details from the official notification before
                applying. Ensure you meet all eligibility criteria.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer portalName={portalName} />
    </div>
  );
}
