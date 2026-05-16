'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">JF</span>
          </div>
          <Link href="/" className="font-bold text-xl text-gray-900">
            JOBFATHER
          </Link>
        </div>

        {/* Right buttons */}
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/mock-tests"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            title="Mock Tests"
          >
            <Image
              src="/mock.svg"
              alt="Mock test"
              width = {16}
              height = {16}
            />
            <span className="font-semibold text-sm">Mock Test</span>
          </Link>
        
          <Link
            href="https://wa.me/919401234567"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
            title="Chat on WhatsApp"
          >
            <Image
              src="/whatsapp.svg"
              alt="WhatsApp"
              width={16}
              height={16}
            />
            <span className="font-semibold text-sm">JOIN GROUP</span>          </Link>
        </div>
      </div>
    </header>
  );
}
