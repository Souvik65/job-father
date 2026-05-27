export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-50 bg-[#111c2e] border-b border-white/10 select-none">
        <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="h-6 skeleton-shimmer rounded-md w-28 sm:w-32" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-8 skeleton-shimmer rounded-lg w-20 sm:w-28" />
            <div className="h-8 skeleton-shimmer rounded-lg w-20 sm:w-28" />
          </div>
        </div>
      </header>

      {/* Skeleton Banner Ad */}
      <div className="w-full bg-slate-100 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-center h-20 sm:h-24 shrink-0 select-none">
        <div className="h-4 skeleton-shimmer rounded-md w-32 sm:w-40" />
      </div>

      {/* Skeleton Category Nav */}
      <div className="bg-[#ff7315]/80 w-full h-12 flex items-center px-3 sm:px-4 gap-3 sm:gap-4 overflow-hidden">
        <div className="h-6 skeleton-shimmer rounded-md w-20 sm:w-24 shrink-0 opacity-40" />
        <div className="h-6 skeleton-shimmer rounded-md w-14 sm:w-16 shrink-0 opacity-40" />
        <div className="h-6 skeleton-shimmer rounded-md w-14 sm:w-16 shrink-0 opacity-40" />
        <div className="h-6 skeleton-shimmer rounded-md w-14 sm:w-16 shrink-0 opacity-40" />
      </div>

      {/* Skeleton Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6" aria-label="Loading jobs…" aria-busy="true">
        <div className="space-y-2.5 sm:space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 select-none overflow-hidden"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Job info skeleton */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-5 skeleton-shimmer rounded-md w-4/5 sm:w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-5 skeleton-shimmer rounded-md w-16" />
                    <div className="h-5 skeleton-shimmer rounded-md w-24" />
                  </div>
                </div>
                {/* Action buttons skeleton */}
                <div className="flex gap-2 shrink-0">
                  <div className="h-9 sm:h-8 skeleton-shimmer rounded-md flex-1 sm:flex-none sm:w-16" />
                  <div className="h-9 sm:h-8 skeleton-shimmer rounded-md flex-1 sm:flex-none sm:w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
