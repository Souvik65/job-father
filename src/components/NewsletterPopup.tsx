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
    const delay = popupDelay * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [popupDelay]);

  const handleClose = () => {
    setIsOpen(false);
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
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-blue-600 text-3xl">mail</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated!</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter to get the latest job alerts and exam notifications directly in your inbox.
          </p>
          
          {status === 'success' ? (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-center gap-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                className="w-full bg-[#000666] hover:bg-[#1a237e] text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-70"
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
