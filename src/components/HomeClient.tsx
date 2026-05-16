'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryNav } from '@/components/CategoryNav';
import { JobList } from '@/components/JobList';
import { JobDetailOverlay } from '@/components/JobDetailOverlay';
import { PostJobPopup } from '@/components/PostJobPopup';
import { AdSlot } from '@/components/AdSlot';
import { Toast } from '@/components/Toast';
import { buildShareText } from '@/lib/utils';
import { Job } from '@/types/job';
import { useSearchParams, useRouter } from 'next/navigation';

interface HomeClientProps {
  initialJobs: Job[];
  initialCategories: string[];
}

function HomeClientInner({ initialJobs, initialCategories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
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
      <Header />

      {/* Home Banner Ad */}
      <AdSlot id="homeBannerAd" className="h-24" />

      {/* Category Navigation */}
      <CategoryNav
        categories={initialCategories.filter(c => c !== 'ALL')}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
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
      <Footer />

      {/* Job Detail Overlay */}
      <JobDetailOverlay
        job={selectedJob}
        open={overlayOpen}
        onClose={handleCloseOverlay}
      />

      {/* Post Job Popup */}
      <PostJobPopup open={popupOpen} onClose={() => setPopupOpen(false)} />

      {/* Post Job Floating Button */}
      <button
        onClick={() => setPopupOpen(true)}
        className="fixed bottom-6 right-6 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium z-40"
        aria-label="Post a Private Job"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        <span className="hidden sm:inline">POST A JOB</span>
      </button>

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
