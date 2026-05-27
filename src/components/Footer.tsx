'use client';

interface FooterProps {
  portalName?: string;
}

export function Footer({ portalName = 'JOBFATHER' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs py-6 border-t border-slate-200 dark:border-slate-800 select-none">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 text-[10px]">
          NOT AFFILIATED WITH ANY GOVT.
        </p>
        <p className="font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 text-[9px]">
          © {currentYear} {portalName}
        </p>
      </div>
    </footer>
  );
}
