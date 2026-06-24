'use client';

import Link from 'next/link';

interface FooterProps {
  portalName?: string;
}

const footerLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

export function Footer({ portalName = 'JOBFATHER' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d1b2a] text-white/50 text-xs py-2 border-t border-white/5 select-none">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="font-black tracking-widest uppercase text-white/40 text-[10px]">
          NOT AFFILIATED WITH ANY GOVT.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {footerLinks.map((link) => (
            <span key={link.href} className="flex items-center">
              <Link
                href={link.href}
                className="text-white/50 hover:text-white/90 transition-colors text-[10px] font-semibold tracking-wide"
              >
                {link.label}
              </Link>
              <span className="text-white/20 ml-3">•</span>
            </span>
          ))}
          <span className="font-bold tracking-wider uppercase text-white/60 text-[9px]">
            © {currentYear} {portalName}
          </span>
        </nav>
      </div>
    </footer>
  );
}
