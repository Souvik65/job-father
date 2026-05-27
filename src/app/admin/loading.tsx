export default function AdminLoading() {
  return (
    <div className="space-y-5 sm:space-y-8" aria-busy="true" aria-label="Loading dashboard…">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="space-y-2">
          <div className="h-7 sm:h-8 skeleton-shimmer rounded-md w-52 sm:w-64" />
          <div className="h-4 skeleton-shimmer rounded-md w-40 sm:w-52" />
        </div>
        <div className="h-10 skeleton-shimmer rounded-lg w-28 self-start sm:self-auto" />
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-[#c6c5d4] dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col gap-2 shadow-sm">
            <div className="h-4 skeleton-shimmer rounded-md w-24" />
            <div className="h-8 skeleton-shimmer rounded-md w-12" />
          </div>
        ))}
      </div>

      {/* Pending jobs cards skeleton */}
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-[#c6c5d4] dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex gap-2 mb-3">
              <div className="h-5 skeleton-shimmer rounded-full w-20" />
              <div className="h-5 skeleton-shimmer rounded-full w-16" />
            </div>
            <div className="h-5 skeleton-shimmer rounded-md w-3/4 mb-2" />
            <div className="h-4 skeleton-shimmer rounded-md w-1/2 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="h-4 skeleton-shimmer rounded-md w-full" />
              <div className="h-4 skeleton-shimmer rounded-md w-full" />
              <div className="h-4 skeleton-shimmer rounded-md w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
