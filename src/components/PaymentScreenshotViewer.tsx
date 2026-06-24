'use client';

import { useState, useEffect, useRef } from 'react';

interface PaymentScreenshotViewerProps {
  src: string;
  jobId: string;
}

export function PaymentScreenshotViewer({ src, jobId }: PaymentScreenshotViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const displayUrl = src && src.startsWith('data:') ? (blobUrl || src) : src;

  // Convert large base64 strings to Blob URLs to avoid browser URL length limits
  useEffect(() => {
    if (!src || !src.startsWith('data:')) {
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    try {
      const arr = src.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      objectUrl = URL.createObjectURL(blob);
      
      const finalUrl = objectUrl;
      // Defer state update to ensure it does not run synchronously in the effect's compile/run phase.
      setTimeout(() => {
        if (active) {
          setBlobUrl(finalUrl);
        }
      }, 0);
    } catch (e) {
      console.error('Failed to create blob from base64', e);
    }

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setTimeout(() => {
        setBlobUrl(null);
      }, 0);
    };
  }, [src]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };
    
    firstElement?.focus();
    
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return (
    <>
      {/* Thumbnail + Buttons */}
      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 block max-w-full sm:inline-block">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            receipt_long
          </span>
          Payment Screenshot:
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl || undefined}
          alt="Payment Screenshot"
          className="h-28 w-auto max-w-full object-contain rounded-md border border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer hover:opacity-90 transition"
          onClick={() => setIsOpen(true)}
          onError={() => setImageError(true)}
        />
        {imageError && (
          <p className="text-xs text-red-600 mt-1">Failed to load image</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {/* View — opens lightbox */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 bg-white dark:bg-slate-850 border border-[#c6c5d4] dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#454652] dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm touch-target"
          >
            <span className="material-symbols-outlined block" style={{ fontSize: 14 }}>
              visibility
            </span>
            View
          </button>

          {/* Download */}
          <a
            href={displayUrl || undefined}
            download={`payment_${jobId}.png`}
            className="px-3 py-1.5 bg-[#000666] dark:bg-blue-600 hover:bg-[#1a237e] dark:hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm touch-target"
          >
            <span className="material-symbols-outlined block" style={{ fontSize: 14 }}>
              download
            </span>
            Download
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal card — stop propagation so clicking the image doesn't close */}
          <div
            ref={modalRef}
            className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] dark:border-slate-800">
              <div className="flex items-center gap-2 text-[#000666] dark:text-blue-400">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  receipt_long
                </span>
                <span className="font-bold text-sm">Payment Screenshot</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={displayUrl || undefined}
                  download={`payment_${jobId}.png`}
                  className="px-3 py-1.5 bg-[#000666] dark:bg-blue-600 hover:bg-[#1a237e] dark:hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    download
                  </span>
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#f3f3f3] dark:hover:bg-slate-800 text-[#454652] dark:text-slate-300 transition"
                  title="Close"
                >
                  <span className="material-symbols-outlined block" style={{ fontSize: 20 }}>
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#f9f9f9] dark:bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl || undefined}
                alt="Payment Screenshot Full View"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                onError={() => setImageError(true)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
