'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  portalName?: string;
}

export function AdminSidebar({ portalName = 'JobFather' }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard',        href: '/admin',              icon: 'dashboard',  fillIcon: true  },
    { name: 'Job Listings',     href: '/admin/jobs',         icon: 'work',       fillIcon: false },
    { name: 'Create Job',       href: '/admin/jobs/create',  icon: 'add_box',    fillIcon: false },
    { name: 'Advertisements',   href: '/admin/ads',          icon: 'campaign',   fillIcon: false },
    { name: 'Email Subscribers',href: '/admin/subscribers',  icon: 'mail',       fillIcon: false },
  ];

  const isItemActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/admin/jobs/create') return pathname === '/admin/jobs/create';
    if (href === '/admin/jobs') return pathname.startsWith('/admin/jobs') && pathname !== '/admin/jobs/create';
    return pathname.startsWith(href);
  };

  const isSettingsActive = pathname === '/admin/settings';

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 z-30 bg-white border-r border-[#c6c5d4] flex flex-col hidden md:flex">
      {/* Header */}
      <div className="px-6 py-6 mb-2 border-b border-[#c6c5d4] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#eeeeee] flex items-center justify-center shrink-0 border border-[#c6c5d4]">
          <span className="material-symbols-outlined text-[#000666]">account_balance</span>
        </div>
        <div>
          <div className="text-base font-bold text-[#000666] uppercase">{portalName} Admin</div>
          
        </div>
      </div>

      {/* Main Menu Links */}
      <ul className="flex flex-col gap-1 flex-1 pt-2">
        {menuItems.map((item) => {
          const isActive = isItemActive(item.href);
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#e0e0ff] text-[#343d96] border-r-4 border-[#000666]'
                    : 'text-[#454652] hover:bg-[#e8e8e8]'
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

      {/* Bottom: Back to Site + Settings */}
      <div className="mt-auto border-t border-[#c6c5d4]">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-[#454652] hover:bg-[#e8e8e8] text-sm font-semibold transition-colors"
        >
          <span className="material-symbols-outlined shrink-0">arrow_back</span>
          <span>Back to Site</span>
        </Link>
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            isSettingsActive
              ? 'bg-[#e0e0ff] text-[#343d96] border-r-4 border-[#000666]'
              : 'text-[#454652] hover:bg-[#e8e8e8]'
          }`}
        >
          <span
            className="material-symbols-outlined shrink-0"
            style={{ fontVariationSettings: `'FILL' ${isSettingsActive ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
          >
            settings
          </span>
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
}
