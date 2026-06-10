"use client";

import { FilePenLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  portalName?: string;
}

export function Header({ portalName = "JOBFATHER" }: HeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-50 select-none shrink-0
        bg-[#0d1b2a]
        border-b-[2.5px] border-orange-500
        px-4 sm:px-6
        h-[58px]
        flex items-center justify-between gap-4
        shadow-lg
        pt-safe
      "
    >
      {/* Brand logo */}
      <Link
        href="/"
        className="flex items-center gap-2 hover:scale-[1.02] transition-transform duration-200"
      >
        <span className="font-extrabold text-[18px] sm:text-[24px] tracking-wider text-white leading-none uppercase">
          {portalName}
        </span>
      </Link>

      {/* Right buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mock Test button */}
        <Link
          href="/mock-tests"
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#ee6f14] hover:bg-[#d5580e] text-white text-[10px] sm:text-xs font-bold uppercase rounded-md tracking-wider transition-colors shadow-sm min-h-7 sm:min-h-8"
          title="Mock Tests"
        >
          <FilePenLine className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">MOCK TEST</span>
          <span className="sm:hidden">TEST</span>
        </Link>

        {/* Job Alert button */}
        {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Job Alert"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#10b981] hover:bg-[#059669] text-white text-[10px] sm:text-xs font-bold uppercase rounded-md tracking-wider transition-colors shadow-sm min-h-7 sm:min-h-8"
            title="WhatsApp Group Alert"
          >
            <Image
              src="/whatsapp.svg"
              alt=""
              aria-hidden="true"
              width={14}
              height={14}
              className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4"
            />
            <span className="hidden sm:inline">JOB ALERT</span>
            <span className="sm:hidden">ALERT</span>
          </Link>
        )}
      </div>
    </header>
  );
}
