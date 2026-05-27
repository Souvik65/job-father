import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function JobDetailLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950">
      <Header />

      <main
        className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8"
        aria-label="Loading job details…"
        aria-busy="true"
      >
        {/* Back navigation skeleton */}
        <div className="mb-4 sm:mb-6">
          <div className="h-4 skeleton-shimmer rounded-md w-28 sm:w-32" />
        </div>

        <div className="w-full flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
          {/* Left column */}
          <div className="w-full md:w-2/3 flex flex-col gap-4 sm:gap-6">
            {/* Header card skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 shadow-sm">
              <div className="flex gap-2">
                <div className="h-5 skeleton-shimmer rounded-full w-20" />
                <div className="h-5 skeleton-shimmer rounded-full w-16" />
              </div>
              <div className="h-6 sm:h-7 skeleton-shimmer rounded-md w-full sm:w-11/12" />
              <div className="h-4 skeleton-shimmer rounded-md w-2/5 sm:w-1/3" />
              <div className="space-y-2 border-t border-gray-100 dark:border-slate-800 pt-3 sm:pt-4 mt-1 sm:mt-2">
                <div className="h-4 skeleton-shimmer rounded-md w-full" />
                <div className="h-4 skeleton-shimmer rounded-md w-5/6" />
                <div className="h-4 skeleton-shimmer rounded-md w-4/5" />
                <div className="h-4 skeleton-shimmer rounded-md w-3/4" />
              </div>
            </div>

            {/* Dates card skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 shadow-sm">
              <div className="h-5 skeleton-shimmer rounded-md w-32" />
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="h-14 sm:h-16 skeleton-shimmer rounded-xl w-full" />
                <div className="h-14 sm:h-16 skeleton-shimmer rounded-xl w-full" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm">
              <div className="space-y-2 pb-3 sm:pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="h-3 skeleton-shimmer rounded-md w-28" />
                <div className="h-6 skeleton-shimmer rounded-md w-36" />
              </div>
              <div className="h-11 sm:h-12 skeleton-shimmer rounded-xl w-full" />
              <div className="h-10 skeleton-shimmer rounded-xl w-full" />
            </div>
            <div className="h-20 skeleton-shimmer rounded-2xl w-full" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
