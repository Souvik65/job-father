'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const menuItems: NavItem[] = [
  { name: 'Dash',       href: '/admin',             icon: 'dashboard'  },
  { name: 'Jobs',       href: '/admin/jobs',         icon: 'work'       },
  { name: 'New',        href: '/admin/jobs/create',  icon: 'add_box'    },
  { name: 'Ads',        href: '/admin/ads',          icon: 'campaign'   },
  { name: 'Subscribers', href: '/admin/subscribers', icon: 'mail'       },
  { name: 'Settings',   href: '/admin/settings',     icon: 'settings'   },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  if (href === '/admin/jobs/create') return pathname === '/admin/jobs/create';
  if (href === '/admin/jobs')
    return pathname.startsWith('/admin/jobs') && pathname !== '/admin/jobs/create';
  return pathname.startsWith(href);
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 md:hidden">
      <nav
        aria-label="Admin mobile navigation"
        className="bg-white dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around h-16 w-full max-w-lg mx-auto"
      >
        <ul className="flex items-center justify-between w-full h-full gap-1">
          {menuItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="flex-1 flex justify-center h-full">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 rounded-[16px] select-none ${
                    active
                      ? 'bg-[#e0e0ff] dark:bg-slate-800 text-[#343d96] dark:text-blue-300 font-bold px-1 py-1'
                      : 'text-[#8e90a6] dark:text-slate-400 hover:text-[#343d96] dark:hover:text-blue-300 font-medium'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Material Symbol Icon */}
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: active ? '21px' : '22px',
                      fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' ${active ? 600 : 400}, 'GRAD' 0, 'opsz' 24`,
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span className="text-[10px] leading-none mt-0.5 whitespace-nowrap tracking-tight">
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
