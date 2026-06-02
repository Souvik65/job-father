"use client";

import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  portalName?: string;
}

export function Header({ portalName = "JOBFATHER" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#111c2e]/90 backdrop-blur-md border-b border-white/10 select-none transition-all duration-300 pt-safe">
      <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand logo */}
        <Link
          href="/"
          className="font-extrabold text-lg sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-widest font-sans flex items-center gap-1 hover:scale-105 transition-transform duration-300 cursor-pointer uppercase shrink-0"
        >
          {portalName}
        </Link>

        {/* Right buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mock Test Button */}
          <Link
            href="/mock-tests"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 bg-[#ee6f14] hover:bg-[#d5580e] text-white text-[9px] sm:text-xs font-black uppercase rounded-lg tracking-wider transition-colors shadow-sm min-h-[38px] sm:min-h-[40px]"
            title="Mock Tests"
          >
            <Image
              src="/mock.svg"
              alt=""
              aria-hidden="true"
              width={14}
              height={14}
              className="shrink-0"
            />
            <span className="hidden sm:inline">MOCK TEST</span>
            <span className="sm:hidden">TEST</span>
          </Link>

          {/* Job Alert Button */}
          {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
            <Link
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Job Alert"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-[9px] sm:text-xs font-black uppercase rounded-lg tracking-wider transition-colors shadow-sm min-h-[38px] sm:min-h-[40px]"
              title="WhatsApp Group Alert"
            >
              <Image
                src="/whatsapp.svg"
                alt=""
                aria-hidden="true"
                width={15}
                height={15}
                className="shrink-0 sm:w-5 sm:h-5"
              />
              <span className="hidden sm:inline">JOB ALERT</span>
              <span className="sm:hidden">ALERT</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
