import { auth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!isAdmin(session)) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased">
        {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#c6c5d4] flex justify-between items-center h-16 px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold text-[#000666]">JobFather Admin Portal</h2>
          </div>
          <div className="flex items-center gap-2 text-[#454652]">
            {/* TODO: Implement notifications functionality */}
            <button className="hover:bg-[#eeeeee] rounded-full p-2 transition-transform duration-150 active:scale-95" aria-label="Notifications">
              <span className="material-symbols-outlined block">notifications</span>
            </button>
            {/* TODO: Implement help/support functionality */}
            <button className="hover:bg-[#eeeeee] rounded-full p-2 transition-transform duration-150 active:scale-95" aria-label="Help">
              <span className="material-symbols-outlined block">help_outline</span>
            </button>
            {/* TODO: Implement account management functionality */}
            <button className="hover:bg-[#eeeeee] rounded-full p-2 transition-transform duration-150 active:scale-95" aria-label="Account">
              <span className="material-symbols-outlined block">account_circle</span>
            </button>
          </div>
        </header>

        {/* Main Content Wrapper */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
