'use client';

import { useState } from 'react';
import { PostJobFormData } from '@/types/job';
import { addDays, isoToday } from '@/lib/utils';

const RATE_PER_DAY = 9; // ₹9 per day

interface PostJobPopupProps {
  open: boolean;
  onClose: () => void;
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function PostJobPopup({ open, onClose }: PostJobPopupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PostJobFormData>({
    title: '',
    category: '',
    fromDate: isoToday(),
    untilDate: addDays(isoToday(), 10),
    description: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [totalDays, setTotalDays] = useState(10);

  const calculateDays = () => {
    const from = new Date(formData.fromDate + 'T00:00:00').getTime();
    const until = new Date(formData.untilDate + 'T00:00:00').getTime();
    if (until >= from) {
      const days = Math.ceil((until - from) / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(Math.max(1, days));
    }
  };

  const totalCost = totalDays * RATE_PER_DAY;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'fromDate' || name === 'untilDate') {
      // Recalculate after state update
      setTimeout(calculateDays, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission to API
    console.log('Form submitted:', formData);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Popup */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Post a Private Job</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Developer"
                      className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="IT">IT/Software</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Job description, requirements, and details..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.title || !formData.category}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next: Pricing
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">From Date *</label>
                      <input
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Until Date *</label>
                      <input
                        type="date"
                        name="untilDate"
                        value={formData.untilDate}
                        onChange={handleInputChange}
                        min={formData.fromDate}
                        className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="bg-gray-50 border border-gray-500 rounded-lg p-4 text-black">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{totalDays} days</span>
                        <span className="font-medium">₹{totalCost}</span>
                      </div>                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate per day</span>
                        <span className="font-medium">₹{RATE_PER_DAY}</span>
                      </div>
                      <div className="border-t border-gray-500 pt-2 flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-blue-600">₹{totalCost}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Email *</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-black ${
                        formData.contactEmail && !isValidEmail(formData.contactEmail)
                          ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
                          : 'border-gray-500 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {formData.contactEmail && !isValidEmail(formData.contactEmail) && (
                      <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.contactEmail || !isValidEmail(formData.contactEmail) || !formData.contactPhone}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Pay ₹{totalCost}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
