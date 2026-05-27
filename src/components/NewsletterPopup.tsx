'use client';

import { useState, useEffect } from 'react';
import { subscribeNewsletter } from '@/app/actions';

interface NewsletterPopupProps {
  popupDelay?: number;
}

export function NewsletterPopup({ popupDelay = 5 }: NewsletterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if the popup was already shown or completed in this session
    try {
      const wasShown = sessionStorage.getItem('newsletter-popup-shown');
      if (wasShown === 'true') return;
    } catch (e) {
      // sessionStorage not available, continue to show popup
    }

    const delay = popupDelay * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Mark as shown for the current session
      try {
        sessionStorage.setItem('newsletter-popup-shown', 'true');
      } catch (e) {
        // sessionStorage not available
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [popupDelay]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('newsletter-popup-shown', 'true');
    } catch (e) {
      // Ignore sessionStorage errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    const result = await subscribeNewsletter(email);
    
    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage('Successfully subscribed!');
      try {
        sessionStorage.setItem('newsletter-popup-shown', 'true');
      } catch (e) {
        // Ignore sessionStorage errors
      }
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100 dark:border-slate-800">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-slate-450 dark:hover:text-slate-200 transition"
          aria-label="Close subscription popup"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">mail</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Stay Updated!</h2>
          <p className="text-gray-600 dark:text-slate-450 mb-6 text-sm leading-relaxed">
            Subscribe to our newsletter to get the latest job alerts and exam notifications directly in your inbox.
          </p>
          
          {status === 'success' ? (
            <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center justify-center gap-2 border border-green-100 dark:border-green-900/40">
              <span className="material-symbols-outlined">check_circle</span>
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-750 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-slate-100 placeholder-slate-400 transition"
                  required
                  disabled={status === 'loading'}
                />
                {status === 'error' && (
                  <p className="text-red-500 text-sm mt-1 text-left">{message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#000666] dark:bg-orange-600 hover:bg-[#1a237e] dark:hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-70 active:scale-98 touch-target cursor-pointer shadow-sm"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
