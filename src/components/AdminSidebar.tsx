'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: 'dashboard',
      fillIcon: true,
    },
    {
      name: 'Job Listings',
      href: '/admin/jobs',
      icon: 'work',
      fillIcon: false,
    },
    {
      name: 'Create Job',
      href: '/admin/jobs/create',
      icon: 'add_box',
      fillIcon: false,
    },
    {
      name: 'Advertisements',
      href: '/admin/ads',
      icon: 'campaign',
      fillIcon: false,
    },
  ];

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 z-30 bg-white border-r border-[#c6c5d4] flex flex-col py-6 hidden md:flex">
      {/* Header */}
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-[#000666]">JobFather Admin</h1>
        <p className="text-xs text-[#454652]">Institutional Command</p>
      </div>

      {/* Main Menu Links */}
      <ul className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          // "Create Job" is exact-match only; "Job Listings" matches all /admin/jobs/*
          // except /admin/jobs/create; Dashboard is always exact-match.
          let isActive = false;
          if (item.href === '/admin') {
            isActive = pathname === '/admin';
          } else if (item.href === '/admin/jobs/create') {
            isActive = pathname === '/admin/jobs/create';
          } else if (item.href === '/admin/jobs') {
            isActive =
              pathname.startsWith('/admin/jobs') &&
              pathname !== '/admin/jobs/create';
          } else if (item.href === '/admin/ads') {
            isActive = pathname.startsWith('/admin/ads');
          } else {
            isActive = pathname === item.href;
          }

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#e0e0ff] text-[#343d96] border-r-4 border-[#000666]'
                    : 'text-[#454652] hover:bg-[#e8e8e8] text-sm'
                }`}
              >
                <span
                  className="material-symbols-outlined shrink-0"
                  style={{
                    fontVariationSettings: `'FILL' ${isActive || item.fillIcon ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Bottom Links (Back to Site & Settings) */}
      <div className="mt-auto px-2 flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-[#454652] hover:bg-[#e8e8e8] rounded-lg transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined shrink-0">arrow_back</span>
          <span>Back to Site</span>
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-4 py-2.5 text-[#454652] hover:bg-[#e8e8e8] rounded-lg transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined shrink-0">settings</span>
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
}
