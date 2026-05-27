import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PostJobLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 animate-pulse" aria-label="Loading post job form…" aria-busy="true">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto flex flex-col gap-6">
          <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-48"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-72 mt-2"></div>
          </div>

          {/* Form field skeletons */}
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-24 mb-2"></div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-32 mb-2"></div>
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-28 mb-2"></div>
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-28 mb-2"></div>
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
