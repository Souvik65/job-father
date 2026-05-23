'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryNav } from '@/components/CategoryNav';
import { JobList } from '@/components/JobList';
import { JobDetailOverlay } from '@/components/JobDetailOverlay';
import { AdSlot } from '@/components/AdSlot';
import { Toast } from '@/components/Toast';
import { buildShareText } from '@/lib/utils';
import { Job } from '@/types/job';
import { Category } from '@prisma/client';

export type CategoryWithAll = Category | 'ALL';
import { useSearchParams, useRouter } from 'next/navigation';

interface HomeClientProps {
  initialJobs: Job[];
  initialCategories: CategoryWithAll[];
  portalName?: string;
  fabEnabled?: boolean;
}

function HomeClientInner({ initialJobs, initialCategories, portalName, fabEnabled }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryWithAll>('ALL');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check URL for job slug on mount
  useEffect(() => {
    const jobSlug = searchParams.get('job');
    if (jobSlug && initialJobs.length > 0) {
      const job = initialJobs.find((j) => j.slug === jobSlug);
      if (job) {
        // Wrap in setTimeout to avoid synchronous setState inside effect warning
        const timer = setTimeout(() => {
          setSelectedJob(job);
          setOverlayOpen(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, initialJobs]);


  const filteredJobs = activeCategory === 'ALL' 
    ? initialJobs 
    : initialJobs.filter(j => j.category === activeCategory);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setOverlayOpen(true);
    // Optionally update URL to match Next.js pattern: router.push(`/job/${job.slug}`);
  };

  const handleJobShare = async (job: Job) => {
    const text = buildShareText(job);
    const jobUrl = `${window.location.origin}/job/${job.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text,
          url: jobUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(jobUrl);
        setToastMessage('Share URL copied to clipboard!');
        setShowToast(true);
      } catch {
        setToastMessage('Failed to copy URL');
        setShowToast(true);
      }
    }
  };

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    setSelectedJob(null);
    if (searchParams.has('job')) {
      router.replace('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header portalName={portalName} />

      {/* Home Banner Ad */}
      <AdSlot id="homeBannerAd" className="h-24" />

      {/* Category Navigation */}
      <CategoryNav
        categories={initialCategories.filter(c => c !== 'ALL')}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat as CategoryWithAll)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <JobList
          jobs={filteredJobs}
          loading={false}
          onJobClick={handleJobClick}
          onJobShare={handleJobShare}
        />
      </main>

      {/* Footer */}
      <Footer portalName={portalName} />

      {/* Job Detail Overlay */}
      <JobDetailOverlay
        job={selectedJob}
        open={overlayOpen}
        onClose={handleCloseOverlay}
      />

      {/* Post Job Floating Button - matches bottom right in the picture */}
      {fabEnabled && (
        <Link
          href="/post-job"
          className="fixed bottom-6 right-6 px-5 py-3.5 bg-[#ff7315] text-white rounded-2xl shadow-xl hover:bg-[#e66712] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest z-40 select-none border border-[#ff8e3c]/40"
          aria-label="Post a Private Job"
        >
          <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>POST A JOB</span>
        </Link>
      )}

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
