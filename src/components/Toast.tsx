'use client';

import { useEffect, useRef } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  duration?: number;
  onHide?: () => void;
}

export function Toast({ message, show, duration = 2400, onHide }: ToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onHide?.();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, duration, onHide]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      } pointer-events-none`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
