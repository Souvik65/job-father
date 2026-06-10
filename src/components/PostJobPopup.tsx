'use client';

import React, { useState, useEffect } from 'react';

interface PostJobPopupProps {
  open: boolean;
  onClose: () => void;
}

export function PostJobPopup({ open, onClose }: PostJobPopupProps) {
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [qrError, setQrError] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [totalVacancies, setTotalVacancies] = useState('');
  
  const getFormattedDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fromDate, setFromDate] = useState(() => getFormattedDate(new Date()));
  const [untilDate, setUntilDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 8);
    return getFormattedDate(d);
  });

  // Validation States
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Clipboard State
  const [copied, setCopied] = useState(false);

  // Payment reveal state
  const [showPayment, setShowPayment] = useState(false);

  // Screenshot Upload State
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState('');

  // Initializing default dates & device type on mount
  useEffect(() => {
    const checkDevice = () => {
      const mobileWidth = window.innerWidth < 768;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobileWidth || hasTouch);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  // Reset state when closed, and update dates when opened
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!open) {
      timer = setTimeout(() => {
        setStep(1);
        setTitle('');
        setDescription('');
        setContactEmail('');
        setContactPhone('');
        setTotalVacancies('');
        setEmailError('');
        setPhoneError('');
        setIsSubmitting(false);
        setSubmitError('');
        setCopied(false);
        setShowPayment(false);
        setScreenshotName('');
        setScreenshotBase64('');
        setQrError(false);
        setFromDate('');
        setUntilDate('');
      }, 0);
    } else {
      timer = setTimeout(() => {
        const today = new Date();
        const eightDaysLater = new Date();
        eightDaysLater.setDate(today.getDate() + 8);
        setFromDate(getFormattedDate(today));
        setUntilDate(getFormattedDate(eightDaysLater));
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText('jobfather@oksbi');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9+\-\s]/g, '');
    setContactPhone(val);

    const digitsOnly = val.replace(/\D/g, '');
    const indianPhoneRegex = /^(?:91|0)?[6-9]\d{9}$/;
    
    if (val === '') {
      setPhoneError('Phone number is required');
    } else if (digitsOnly.length < 10) {
      setPhoneError('Must be a valid 10-digit number');
    } else if (!indianPhoneRegex.test(digitsOnly)) {
      setPhoneError('Invalid Indian phone number format');
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setContactEmail(val);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val === '') {
      setEmailError('Email address is required');
    } else if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Screenshot file too large (max 5MB)');
        e.target.value = '';
        return;
      }
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.onerror = () => {
        setSubmitError('Failed to read screenshot file');
      };
      reader.readAsDataURL(file);
    }
  };

  const getDurationDays = () => {
    if (!fromDate || !untilDate) return 8;
    const start = new Date(fromDate);
    const end = new Date(untilDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const durationDays = getDurationDays();
  const totalCost = durationDays * 9;

  const isStep1Valid = 
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    contactEmail.trim().length > 0 &&
    emailError === '' &&
    contactPhone.trim().length > 0 &&
    phoneError === '' &&
    fromDate !== '' &&
    untilDate !== '';

  const handleNextStep = () => {
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotBase64) {
      setSubmitError('Please upload a payment verification screenshot.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/jobs/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          title,
          category: 'PRIVATE',
          fromDate,
          untilDate,
          description,
          contactEmail,
          contactPhone,
          totalVacancies: totalVacancies ? parseInt(totalVacancies, 10) : null,
          screenshot: screenshotBase64,
          screenshotName,
        }),
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok && result.success) {
        setStep(3);
      } else {
        throw new Error(result.error || 'Failed to submit the request.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error
        ? (err.name === 'AbortError' ? 'Request timed out. Please try again.' : err.message)
        : 'Something went wrong, please try again.';
      setSubmitError(errorMsg);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none shadow-2xl pointer-events-auto flex flex-col font-sans text-[#0F172A] border border-[#E2E8F0]"
        >
          
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 flex items-center justify-between border-b border-[#F1F5F9] shrink-0">
            <div className="flex items-center">
              <svg 
                className="w-6 h-6 text-[#EA580C] mr-2 shrink-0 transform -rotate-12" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" 
                />
              </svg>
              <h1 id="modal-title" className="text-[#0F172A] font-extrabold tracking-wider text-base uppercase">
                Post a Private Job
              </h1>
            </div>

            <button 
              onClick={onClose}
              className="bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] p-2 rounded-full transition-all flex items-center justify-center cursor-pointer border border-[#E2E8F0] shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <div className="bg-[#132A4B] text-white mx-6 mt-4 rounded-xl p-4 flex gap-3 text-xs leading-relaxed font-semibold shadow-inner border border-[#0B1D33]">
                <svg className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293l-5-5a1 1 0 00-1.414 0l-7 7a1 1 0 000 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414zM9 11a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
                </svg>
                <span>
                  Reach thousands of job seekers in Tripura for just <span className="text-[#F97316] font-black font-mono">₹9/day</span>. Fill in the details, review the bill, then pay via UPI.
                </span>
              </div>

              <div className="px-6 py-5 flex-1 space-y-4">
                <div>
                  <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                    <span>Job Title</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Junior Accountant, Sales Executive"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-black font-semibold placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-[#EA580C] focus:bg-white transition-all text-sm shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                    <span>Job Description</span> <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Eligibility, vacancies, salary, qualifications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-black font-semibold placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-[#EA580C] focus:bg-white transition-all text-sm shadow-sm resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                    <span>Email to Receive CV/Resume</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="youremail@example.com"
                    value={contactEmail}
                    onChange={handleEmailChange}
                    className={`w-full px-4 py-3 bg-[#F8FAFC] border ${
                      emailError ? 'border-red-500 ring-2 ring-red-500/15' : 'border-[#CBD5E1]'
                    } rounded-xl text-black font-semibold placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 ${
                      emailError ? 'focus:ring-red-500/15 focus:border-red-500' : 'focus:ring-orange-500/15 focus:border-[#EA580C]'
                    } focus:bg-white transition-all text-sm shadow-sm`}
                    required
                  />
                  {emailError && (
                    <p className="text-red-500 text-[10px] font-bold tracking-wide uppercase mt-1 flex items-center gap-1 leading-none">
                      ⚠️ {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                    <span>Contact Phone Number</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={contactPhone}
                    onChange={handlePhoneChange}
                    className={`w-full px-4 py-3 bg-[#F8FAFC] border ${
                      phoneError ? 'border-red-500 ring-2 ring-red-500/15' : 'border-[#CBD5E1]'
                    } rounded-xl text-black font-semibold placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 ${
                      phoneError ? 'focus:ring-red-500/15 focus:border-red-500' : 'focus:ring-orange-500/15 focus:border-[#EA580C]'
                    } focus:bg-white transition-all text-sm shadow-sm`}
                    required
                  />
                  {phoneError && (
                    <p className="text-red-500 text-[10px] font-bold tracking-wide uppercase mt-1 flex items-center gap-1 leading-none">
                      ⚠️ {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                    Total Vacancies
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5, 10 (Leave blank if not specified)"
                    value={totalVacancies}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val, 10) >= 0) {
                        setTotalVacancies(val);
                      }
                    }}
                    min="0"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-black font-semibold placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-[#EA580C] focus:bg-white transition-all text-sm shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                      <span>Post From</span> <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      min={getFormattedDate(new Date())}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-black font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-[#EA580C] focus:bg-white transition-all text-sm shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                      <span>Post Until</span> <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={untilDate}
                      onChange={(e) => setUntilDate(e.target.value)}
                      min={fromDate}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-black font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-[#EA580C] focus:bg-white transition-all text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 shrink-0 border-t border-[#F1F5F9] pt-4 mt-auto sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!isStep1Valid}
                  className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    isStep1Valid 
                      ? 'bg-[#EA580C] text-white hover:bg-[#C2410C]' 
                      : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none'
                  }`}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="px-6 py-5 flex-1 space-y-5">
                <div>
                  <div className="bg-[#1E293B] text-white px-4 py-2.5 rounded-t-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>📋</span>
                    <span>Posting Bill</span>
                  </div>
                  <div className="border-x border-[#E2E8F0] bg-white px-4 py-3 flex justify-between text-xs text-[#475569] font-semibold border-b">
                    <span>Duration</span>
                    <span className="font-bold text-[#0F172A]">{durationDays} day(s)</span>
                  </div>
                  <div className="border-x border-[#E2E8F0] bg-white px-4 py-3 flex justify-between text-xs text-[#475569] font-semibold border-b">
                    <span>Rate</span>
                    <span className="font-bold text-[#0F172A]">₹9 / day</span>
                  </div>
                  <div className="bg-[#FFFBEB] border-x border-b border-[#FDE047] rounded-b-xl px-4 py-3 flex justify-between items-center text-[#9A3412] font-black text-sm uppercase tracking-wide">
                    <span>Total Amount</span>
                    <span className="text-xl font-black font-mono">₹{totalCost}</span>
                  </div>
                </div>

                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5 text-center relative overflow-hidden shadow-sm">
                  <span className="text-[#3B82F6] font-extrabold text-[10px] uppercase tracking-widest block mb-3">
                    ⚡ Pay Securely with UPI
                  </span>
                  <p className="text-xs text-[#1E3A8A] font-semibold leading-relaxed mb-4">
                    Complete your payment of{' '}
                    <span className="font-extrabold text-[#2563EB]">₹{totalCost}</span>{' '}
                    via UPI.
                  </p>

                  {!showPayment && (
                    isMobile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowPayment(true);
                          window.location.href = `upi://pay?pa=jobfather@oksbi&pn=Jobfather&am=${totalCost}&cu=INR&tn=Payment`;
                        }}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all shadow-md active:scale-95 cursor-pointer group"
                      >
                        <span>Pay Now</span>
                        <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPayment(true)}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all shadow-md active:scale-95 cursor-pointer group"
                      >
                        <span>Pay Now</span>
                        <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                      </button>
                    )
                  )}

                  {showPayment && !isMobile && (
                    <div className="flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                      <p className="text-[10px] text-[#1E3A8A] font-semibold">
                        Scan with GPay, PhonePe, Paytm or any UPI app
                      </p>
                      <div className="bg-white p-3 rounded-2xl border border-[#BFDBFE] shadow-sm hover:scale-105 transition-transform duration-300 inline-block">
                        {qrError ? (
                          <div className="w-40 h-40 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-[10px] text-gray-500 text-center px-4">
                              QR code unavailable.<br/>Please use the UPI ID below.
                            </p>
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                              `upi://pay?pa=jobfather@oksbi&pn=Jobfather&am=${totalCost}&cu=INR&tn=Payment`
                            )}`}
                            alt="UPI QR Code"
                            width="160"
                            height="160"
                            className="block rounded-lg"
                            onError={() => setQrError(true)}
                          />
                        )}
                      </div>
                      <div className="w-full max-w-xs bg-white border border-[#BFDBFE] rounded-xl p-2 flex items-center justify-between shadow-inner">
                        <div className="text-left pl-1">
                          <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block">UPI ID</span>
                          <span className="text-[11px] font-black text-[#1E293B] font-mono select-all">jobfather@oksbi</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUPI}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm cursor-pointer"
                        >
                          {copied ? '✓ Copied!' : 'Copy ID'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPayment(false)}
                        className="text-[9px] text-[#64748B] hover:text-[#1E3A8A] font-bold uppercase tracking-wider hover:underline bg-transparent border-none cursor-pointer mt-1"
                      >
                        ← Back
                      </button>
                    </div>
                  )}

                  {showPayment && isMobile && (
                    <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
                      <p className="text-[11px] text-[#1E3A8A] font-semibold">
                        Your UPI app should have opened. After paying, upload the screenshot below.
                      </p>
                      <a
                        href={`upi://pay?pa=jobfather@oksbi&pn=Jobfather&am=${totalCost}&cu=INR&tn=Payment`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10px] font-black uppercase rounded-xl tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Reopen UPI App &rarr;
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                    <span>Upload Payment Screenshot</span> <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] hover:border-[#94A3B8] rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 min-h-27.5 relative">
                    <svg className="w-7 h-7 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[#475569] font-bold text-xs uppercase tracking-wider">
                      {screenshotName ? 'Change Screenshot' : 'Choose Screenshot'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] max-w-50 truncate">
                      {screenshotName || 'No file chosen'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="bg-[#FFFDF5] border border-[#FDE047] rounded-xl p-4 text-[#854D0E] text-[11px] leading-relaxed font-semibold flex gap-2.5 items-start">
                  <span className="text-sm mt-0.5">⚠️</span>
                  <span>
                    Your request will be reviewed within 24 hours. The job will go live in the Private section once payment is confirmed.
                  </span>
                </div>

                {submitError && (
                  <p className="text-red-600 text-xs font-bold text-center uppercase tracking-wide bg-red-50 border border-red-200 rounded-lg p-3">
                    ⚠️ {submitError}
                  </p>
                )}
              </div>

              <div className="px-6 pb-6 shrink-0 space-y-3 border-t border-[#F1F5F9] pt-4 mt-auto sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={isSubmitting || !screenshotBase64}
                  className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    screenshotBase64 && !isSubmitting
                      ? 'bg-[#EA580C] text-white hover:bg-[#C2410C]'
                      : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      <span>Submit Request</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="block mx-auto text-xs text-[#64748B] font-extrabold uppercase tracking-widest hover:text-slate-800 transition cursor-pointer hover:underline py-1"
                >
                  &larr; Edit Details
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-10 space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-500/20 text-green-500 scale-100 animate-[bounce_1s_ease-in-out_infinite_alternate]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-[#0F172A] font-extrabold text-xl leading-snug">
                  Job listing submitted successfully!
                </h2>
                <p className="text-[#475569] text-sm leading-relaxed font-semibold">
                  It will appear online after manual review.
                </p>
              </div>

              <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex justify-between text-xs font-semibold text-[#64748B]">
                  <span>Job Title:</span>
                  <span className="text-[#0F172A] font-bold truncate max-w-50">{title}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-[#64748B]">
                  <span>Duration:</span>
                  <span className="text-[#0F172A] font-bold">{durationDays} days</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-[#64748B]">
                  <span>Status:</span>
                  <span className="text-orange-600 font-bold bg-orange-50 border border-orange-200/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    Pending Review
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] leading-relaxed font-medium">
                The job post has been sent to our administrator for verification. Once verified, it will be immediately live in the Private section of our website.
              </p>

              <button
                onClick={onClose}
                className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl uppercase text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Got it, thanks!
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
