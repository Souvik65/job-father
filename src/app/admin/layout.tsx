import { auth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminMobileNav } from '@/components/AdminMobileNav';
import { getPortalName } from '@/lib/settings';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!isAdmin(session)) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  const portalName = await getPortalName();

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-slate-950 text-[#1a1c1c] dark:text-slate-100 font-sans antialiased">
      {/* Desktop Sidebar — hidden on mobile */}
      <AdminSidebar portalName={portalName} />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-[#c6c5d4] dark:border-slate-800 flex justify-between items-center h-14 md:h-16 px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {/* Hamburger menu for mobile view */}
            <AdminMobileNav />

            {/* Mobile Title — hidden on desktop */}
            <h2 className="text-base font-extrabold text-[#000666] dark:text-blue-400 uppercase truncate md:hidden">
              {portalName.toUpperCase() === 'JOBFATHER' ? 'JOBFATHER ADMIN' : `${portalName.toUpperCase()} ADMIN`}
            </h2>
            {/* Desktop Title — hidden on mobile */}
            <h2 className="text-lg font-extrabold text-[#000666] dark:text-blue-400 truncate hidden md:block">
              {portalName.toLowerCase() === 'jobfather' ? 'JobFather Admin Portal' : `${portalName} Admin Portal`}
            </h2>
          </div>
          {/* Back to Site Button — visible only on mobile viewports
          <Link
            href="/"
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#c6c5d4] dark:border-slate-800 hover:bg-[#f1f5f9] dark:hover:bg-slate-850 text-[#454652] dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition touch-target"
            title="Back to Public Site"
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16 }}>
              arrow_back
            </span>
            <span>Back to Site</span>
          </Link> */}
        </header>

        {/* Main Content Wrapper */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
