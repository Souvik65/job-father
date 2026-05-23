'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  portalName?: string;
}

export function Header({ portalName = 'JOBFATHER' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#111c2e]/90 backdrop-blur-md shadow-lg border-b border-white/10 select-none transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand logo - matches the picture (plain bold white uppercase text, no box) */}
        <Link href="/" className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-widest font-sans flex items-center gap-1 hover:scale-105 transition-transform duration-300 cursor-pointer uppercase">
          {portalName}
        </Link>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          {/* Mock Test Button - Orange bg, white text, bold uppercase */}
          <Link
            href="/mock-tests"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f0975ce1] hover:bg-[#e66712] text-white text-xs font-black uppercase rounded-lg tracking-wider transition-colors shadow-sm"
            title="Mock Tests"
          >
            <Image
              src="/mock.svg"
              alt="Mock test"
              width = {16}
              height = {16}
            />
            <span>MOCK TEST</span>
          </Link>
        
          {/* Job Alert Button - Green bg, white text, bold uppercase */}
          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-black uppercase rounded-lg tracking-wider transition-colors shadow-sm"
            title="WhatsApp Group Alert"
          >
            <Image
              src="/whatsapp.svg"
              alt="Job alert"
              width={20}
              height={20}
            />
            <span>JOB ALERT</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
