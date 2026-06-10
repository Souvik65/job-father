'use client';

interface FooterProps {
  portalName?: string;
}

export function Footer({ portalName = 'JOBFATHER' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d1b2a] text-white/50 text-xs py-2 border-t border-white/5 select-none">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="font-black tracking-widest uppercase text-white/40 text-[10px]">
          NOT AFFILIATED WITH ANY GOVT.
        </p>
        <p className="font-bold tracking-wider uppercase text-white/60 text-[9px]">
          © {currentYear} {portalName}
        </p>
      </div>
    </footer>
  );
}
