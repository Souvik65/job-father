'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  fillIcon?: boolean;
}

const menuItems: NavItem[] = [
  { name: 'Dashboard',        href: '/admin',              icon: 'dashboard',  fillIcon: true  },
  { name: 'Job Listings',     href: '/admin/jobs',         icon: 'work',       fillIcon: false },
  { name: 'Create Job',       href: '/admin/jobs/create',  icon: 'add_box',    fillIcon: false },
  { name: 'Advertisements',   href: '/admin/ads',          icon: 'campaign',   fillIcon: false },
  { name: 'Students',         href: '/admin/students',     icon: 'school',     fillIcon: false },
  { name: 'Email Subscribers',href: '/admin/subscribers',  icon: 'mail',       fillIcon: false },
  { name: 'Mock Test Manager',href: '/admin/mock-test-manager', icon: 'quiz',   fillIcon: false },
  { name: 'Settings',         href: '/admin/settings',     icon: 'settings',   fillIcon: false },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  if (href === '/admin/jobs/create') return pathname === '/admin/jobs/create';
  if (href === '/admin/jobs')
    return pathname.startsWith('/admin/jobs') && pathname !== '/admin/jobs/create';
  if (href === '/admin/students') return pathname.startsWith('/admin/students');
  return pathname.startsWith(href);
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the drawer and reset loading when route changes by adjusting state during render
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setIsLoading(false);
  }

  // Prevent scroll when the menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        className="flex items-center justify-center p-2 rounded-xl text-[#000666] dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          menu
        </span>
      </button>

      {/* Backdrop Blur Overlay (Handles smooth fade-in/fade-out) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer Panel (Handles smooth slide-in/slide-out) */}
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Navigation drawer"
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#c6c5d4] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#eeeeee] dark:bg-slate-800 flex items-center justify-center border border-[#c6c5d4] dark:border-slate-700">
              <span className="material-symbols-outlined text-[#000666] dark:text-blue-400" style={{ fontSize: 18 }}>
                account_balance
              </span>
            </div>
            <span className="text-sm font-bold text-[#000666] dark:text-blue-400 uppercase tracking-wide">
              Admin Menu
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#454652] dark:text-slate-400 transition"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              close
            </span>
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (pathname === item.href) {
                        setIsOpen(false);
                      } else {
                        setIsLoading(true);
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-xl ${
                      active
                        ? 'bg-[#e0e0ff] dark:bg-slate-800 text-[#343d96] dark:text-blue-300 border-l-4 border-[#000666] dark:border-blue-400'
                        : 'text-[#454652] dark:text-slate-350 hover:bg-[#e8e8e8] dark:hover:bg-slate-800'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className="material-symbols-outlined shrink-0"
                      style={{
                        fontVariationSettings: `'FILL' ${active || item.fillIcon ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
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
        </nav>

        {/* Drawer Footer */}
        <div className="border-t border-[#c6c5d4] dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
          <Link
            href="/"
            onClick={() => {
              if (pathname === '/') {
                setIsOpen(false);
              } else {
                setIsLoading(true);
                setIsOpen(false);
              }
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[#c6c5d4] dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#454652] dark:text-slate-300 text-sm font-bold transition duration-200"
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 18 }}>
              arrow_back
            </span>
            <span>Back to Public Site</span>
          </Link>
        </div>
      </div>

      {/* Full-screen loading screen overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#343d96] dark:border-blue-400 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs font-bold text-[#000666] dark:text-blue-400 uppercase tracking-widest animate-pulse">
              Loading page...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


