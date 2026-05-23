import { auth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
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
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased">
        {/* Admin Sidebar */}
      <AdminSidebar portalName={portalName} />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#c6c5d4] flex justify-between items-center h-16 px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold text-[#000666] uppercase">{portalName} Admin Portal</h2>
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
