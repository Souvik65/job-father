"use client";

import { useState, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/CategoryNav";
import { JobList } from "@/components/JobList";
import { AdSlot } from "@/components/AdSlot";
import { Toast } from "@/components/Toast";
import { PostJobPopup } from "@/components/PostJobPopup";

import { buildShareText } from "@/lib/utils";
import { Job } from "@/types/job";
import { Category, Ad } from "@prisma/client";

export type CategoryWithAll = Category | "ALL";
import { useRouter } from "next/navigation";

interface HomeClientProps {
  initialJobs: Job[];
  initialCategories: CategoryWithAll[];
  portalName?: string;
  fabEnabled?: boolean;
  headerAd?: Ad | null;
  inlineAd?: Ad | null;
}

function HomeClientInner({
  initialJobs,
  initialCategories,
  portalName,
  fabEnabled,
  headerAd,
  inlineAd,
}: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryWithAll>("ALL");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  const router = useRouter();

  const filteredJobs =
    activeCategory === "ALL"
      ? initialJobs
      : initialJobs.filter((j) => j.category === activeCategory);

  const handleJobClick = (job: Job) => {
    router.push(`/job/${job.slug}`);
  };

  const handleJobShare = async (job: Job) => {
    const text = buildShareText(job);
    const jobUrl = `${window.location.origin}/job/${job.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, text, url: jobUrl });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(jobUrl);
        setToastMessage("Share URL copied to clipboard!");
        setShowToast(true);
      } catch {
        setToastMessage("Failed to copy URL");
        setShowToast(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f0f4ff] dark:bg-[#0a1628] transition-colors duration-200">
      {/* Sticky top bar: header + ad + categories */}
      <div className="sticky top-0 z-30 flex flex-col w-full shadow-md">
        <Header portalName={portalName} />
        {headerAd && (
          <AdSlot id="homeBannerAd" ad={headerAd} className="h-20 sm:h-24 w-full" />
        )}
        <CategoryNav
          categories={initialCategories.filter((c) => c !== "ALL")}
          activeCategory={activeCategory}
          onCategoryChange={(cat) => setActiveCategory(cat as CategoryWithAll)}
        />
      </div>

      {/* Job area — flex-1, independently scrollable */}
      <main className="flex-1 overflow-y-auto w-full bg-[#f0f4ff] dark:bg-[#0a1628]" style={{ minHeight: 0 }}>
        <JobList
          jobs={filteredJobs}
          loading={false}
          onJobClick={handleJobClick}
          onJobShare={handleJobShare}
          inlineAd={inlineAd}
        />
      </main>

      {/* Footer */}
      <Footer portalName={portalName} />

      {/* Post Job FAB — bottom right, safe area aware */}
      {fabEnabled && (
        <button
          onClick={() => setIsPostJobOpen(true)}
          className="fixed right-4 sm:right-6 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#ee6f14] text-white rounded-2xl shadow-xl hover:bg-[#d5580e] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest z-40 select-none border border-[#ff8e3c]/40 cursor-pointer"
          style={{
            bottom:
              "max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))",
          }}
          aria-label="Post a Private Job"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current"
            fill="none"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>POST A JOB</span>
        </button>
      )}

      <PostJobPopup open={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} />

      {/* Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}

export function HomeClient(props: HomeClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClientInner {...props} />
    </Suspense>
  );
}
