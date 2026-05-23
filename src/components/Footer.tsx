'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-500 text-xs py-6 border-t border-slate-200 select-none">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="font-black tracking-widest uppercase text-slate-400 text-[10px]">
          NOT AFFILIATED WITH ANY GOVT.
        </p>
        <p className="font-bold tracking-wider uppercase text-slate-500 text-[9px]">
          © {currentYear} JOBFATHER
        </p>
      </div>
    </footer>
  );
}
