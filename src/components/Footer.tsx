'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 text-sm border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left">
            © {currentYear} <span className="font-semibold text-white">Jobfather</span>. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <a href="#privacy" className="hover:text-white transition">
              Privacy Policy
            </a>
            <span className="text-gray-600">•</span>
            <a href="#terms" className="hover:text-white transition">
              Terms of Service
            </a>
            <span className="text-gray-600">•</span>
            <a href="#contact" className="hover:text-white transition">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
