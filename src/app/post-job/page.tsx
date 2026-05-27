'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [qrError, setQrError] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [totalVacancies, setTotalVacancies] = useState('');
  
  // Date default computation (today & 8 days later)
  const getFormattedDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fromDate, setFromDate] = useState('');
  const [untilDate, setUntilDate] = useState('');

  // Initializing default dates & device type on mount
  useEffect(() => {
    const today = new Date();
    const eightDaysLater = new Date();
    eightDaysLater.setDate(today.getDate() + 8);
    
    // Wrap in setTimeout to avoid synchronous setState inside effect warning
    const timer = setTimeout(() => {
      setFromDate(getFormattedDate(today));
      setUntilDate(getFormattedDate(eightDaysLater));
    }, 0);

    const checkDevice = () => {
      const mobileWidth = window.innerWidth < 768;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobileWidth || hasTouch);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  // Validation States
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Clipboard State
  const [copied, setCopied] = useState(false);

  // Payment reveal state (desktop QR code panel)
  const [showPayment, setShowPayment] = useState(false);

  // Screenshot Upload State
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState('');

  // Copy UPI Function
  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText('jobfather@oksbi');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Helper to sanitize & validate Indian mobile format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, +, -, and spaces
    const val = e.target.value.replace(/[^0-9+\-\s]/g, '');
    setContactPhone(val);

    // Sanitize to verify numbers-only matching standard 10 digit Indian code
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

  // Email format validation
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

  // Screenshot handler
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

  // Date diff computation
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

  // Step 1 Validation Gate
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotBase64) {
      setSubmitError('Please upload a payment verification screenshot.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/jobs/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      const result = await response.json();

      if (response.ok && result.success) {
        setStep(3);
      } else {
        throw new Error(result.error || 'Failed to submit the request.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong, please try again.';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F1F5F9] min-h-screen py-6 px-4 flex flex-col font-sans antialiased text-[#0F172A]">
      {/* Dynamic responsive grid layout to fit full window beautifully and provide spaces for ads */}
      <div className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4">
        
        {/* Left Ad Sidebar - Sticky on desktop */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-6 h-[calc(100vh-6rem)]">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center flex-1 border-dashed relative">
            {/* Elegant visual badge */}
            <div className="absolute top-4 left-4 bg-slate-100 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest border border-slate-200">
              AD SPACE
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mb-4 text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <span className="text-[#475569] font-black text-xs uppercase tracking-wider block mb-2">
              PROMOTE YOUR BRAND
            </span>
            <p className="text-[11px] text-[#64748B] font-semibold leading-relaxed max-w-[180px]">
              Reach thousands of employers and job hunters daily in Tripura. Contact ad manager.
            </p>
          </div>
        </div>

        {/* Central main form card - spans 6 columns on desktop, centered & fits the space cleanly */}
        <div className="lg:col-span-6 w-full flex flex-col">
          {/* Top Horizontal Banner for Mobile/Tablet */}
          <div className="lg:hidden w-full bg-white border border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center mb-4 relative shadow-sm">
            <span className="absolute top-2 left-2 bg-slate-100 text-slate-500 text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest">
              AD SPACE
            </span>
            <span className="text-slate-400 font-black text-[9px] uppercase tracking-wider block">
              Advertise Here • Contact Support
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl w-full border border-[#E2E8F0] overflow-hidden flex flex-col">
            {/* Top Header Decal */}
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto my-3 shrink-0"></div>

            {/* Modal-Style Main Header */}
            <div className="px-6 pb-4 pt-1 flex items-center justify-between border-b border-[#F1F5F9] shrink-0">
              <div className="flex items-center">
                {/* Elegant megaphone icon */}
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
                <h1 className="text-[#0F172A] font-extrabold tracking-wider text-base uppercase">
                  Post a Private Job
                </h1>
              </div>

              {/* Close back-to-home button */}
              <Link 
                href="/" 
                className="bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] p-2 rounded-full transition-all flex items-center justify-center cursor-pointer border border-[#E2E8F0] shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>

            {/* Step 1: Details Form */}
            {step === 1 && (
              <div className="flex-1 flex flex-col">
                {/* Navy Blue Promo Banner */}
                <div className="bg-[#132A4B] text-white mx-6 mt-4 rounded-xl p-4 flex gap-3 text-xs leading-relaxed font-semibold shadow-inner border border-[#0B1D33]">
                  <svg className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293l-5-5a1 1 0 00-1.414 0l-7 7a1 1 0 000 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414zM9 11a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Reach thousands of job seekers in Tripura for just <span className="text-[#F97316] font-black font-mono">₹9/day</span>. Fill in the details, review the bill, then pay via UPI.
                  </span>
                </div>

                {/* Inputs Container */}
                <div className="px-6 py-5 flex-1 space-y-4">
                  {/* Job Title */}
                  <div>
                    <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                      Job Title *
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

                  {/* Job Description */}
                  <div>
                    <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                      Job Description *
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

                  {/* Email */}
                  <div>
                    <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                      Email to Receive CV/Resume *
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

                  {/* Phone Number */}
                  <div>
                    <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                      Contact Phone Number *
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

                  {/* Total Vacancies */}
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

                  {/* Date Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                        Post From *
                      </label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-black font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-[#EA580C] focus:bg-white transition-all text-sm shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                        Post Until *
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

                {/* Next Button Section */}
                <div className="px-6 pb-6 shrink-0">
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

            {/* Step 2: Payment Review Form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="px-6 py-5 flex-1 space-y-5">
                  {/* Posting Bill */}
                  <div>
                    {/* Header */}
                    <div className="bg-[#1E293B] text-white px-4 py-2.5 rounded-t-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>📋</span>
                      <span>Posting Bill</span>
                    </div>
                    {/* Itemized Rows */}
                    <div className="border-x border-[#E2E8F0] bg-white px-4 py-3 flex justify-between text-xs text-[#475569] font-semibold border-b">
                      <span>Duration</span>
                      <span className="font-bold text-[#0F172A]">{durationDays} day(s)</span>
                    </div>
                    <div className="border-x border-[#E2E8F0] bg-white px-4 py-3 flex justify-between text-xs text-[#475569] font-semibold border-b">
                      <span>Rate</span>
                      <span className="font-bold text-[#0F172A]">₹9 / day</span>
                    </div>
                    {/* Total */}
                    <div className="bg-[#FFFBEB] border-x border-b border-[#FDE047] rounded-b-xl px-4 py-3 flex justify-between items-center text-[#9A3412] font-black text-sm uppercase tracking-wide">
                      <span>Total Amount</span>
                      <span className="text-xl font-black font-mono">₹{totalCost}</span>
                    </div>
                  </div>

                  {/* Pay Via UPI Card - Single Button, Smart On-Click Reveal */}
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5 text-center relative overflow-hidden shadow-sm">
                    <span className="text-[#3B82F6] font-extrabold text-[10px] uppercase tracking-widest block mb-3">
                      ⚡ Pay Securely with UPI
                    </span>

                    {/* Amount display */}
                    <p className="text-xs text-[#1E3A8A] font-semibold leading-relaxed mb-4">
                      Complete your payment of{' '}
                      <span className="font-extrabold text-[#2563EB]">₹{totalCost}</span>{' '}
                      via UPI.
                    </p>

                    {/* Single Pay Now button — action depends on device */}
                    {!showPayment && (
                      isMobile ? (
                        <a
                          href={`upi://pay?pa=jobfather@oksbi&pn=Jobfather&am=${totalCost}&cu=INR&tn=Payment`}
                          onClick={() => setShowPayment(true)}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all shadow-md active:scale-95 cursor-pointer group"
                        >
                          <span>Pay Now</span>
                          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                        </a>
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

                    {/* Desktop: QR Code panel revealed after clicking Pay Now */}
                    {showPayment && !isMobile && (
                      <div className="flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                        <p className="text-[10px] text-[#1E3A8A] font-semibold">
                          Scan with GPay, PhonePe, Paytm or any UPI app
                        </p>
                        {/* QR Code */}
                        <div className="bg-white p-3 rounded-2xl border border-[#BFDBFE] shadow-sm hover:scale-105 transition-transform duration-300 inline-block">
                          {qrError ? (
                            <div className="w-[160px] h-[160px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
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
                        {/* UPI ID Copy row */}
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

                    {/* Mobile: after deep link launched, show a confirmation nudge */}
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

                  {/* Upload payment screenshot */}
                  <div>
                    <label className="font-bold text-[10px] text-[#475569] tracking-widest mb-1.5 uppercase block">
                      Upload Payment Screenshot *
                    </label>
                    <div className="border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] hover:border-[#94A3B8] rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 min-h-[110px] relative">
                      <svg className="w-7 h-7 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[#475569] font-bold text-xs uppercase tracking-wider">
                        {screenshotName ? 'Change Screenshot' : 'Choose Screenshot'}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] max-w-[200px] truncate">
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

                  {/* Yellow Warnings Info Box */}
                  <div className="bg-[#FFFDF5] border border-[#FDE047] rounded-xl p-4 text-[#854D0E] text-[11px] leading-relaxed font-semibold flex gap-2.5 items-start">
                    <span className="text-sm mt-0.5">⚠️</span>
                    <span>
                      Your request will be reviewed within 24 hours. The job will go live in the Private section once payment is confirmed.
                    </span>
                  </div>

                  {/* Submit Error */}
                  {submitError && (
                    <p className="text-red-600 text-xs font-bold text-center uppercase tracking-wide bg-red-50 border border-red-200 rounded-lg p-3">
                      ⚠️ {submitError}
                    </p>
                  )}
                </div>

                {/* Back Link & Submit Button */}
                <div className="px-6 pb-6 shrink-0 space-y-3">
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

            {/* Step 3: Success State */}
            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-10 space-y-6">
                {/* Animated custom green circle with big checkmark */}
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

                {/* Posting Summary Details card */}
                <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-left space-y-2.5">
                  <div className="flex justify-between text-xs font-semibold text-[#64748B]">
                    <span>Job Title:</span>
                    <span className="text-[#0F172A] font-bold truncate max-w-[200px]">{title}</span>
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

                {/* Explanatory text */}
                <p className="text-[11px] text-[#64748B] leading-relaxed font-medium">
                  The job post has been sent to our administrator for verification. Once verified, it will be immediately live in the Private section of our website.
                </p>

                {/* Action button */}
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl uppercase text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Got it, thanks!
                </button>
              </div>
            )}
          </div>

          {/* Bottom Horizontal Banner for Mobile/Tablet */}
          <div className="lg:hidden w-full bg-white border border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center mt-4 relative shadow-sm">
            <span className="absolute top-2 left-2 bg-slate-100 text-slate-500 text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest">
              AD SPACE
            </span>
            <span className="text-slate-400 font-black text-[9px] uppercase tracking-wider block">
              Advertise Here • Contact Support
            </span>
          </div>
        </div>

        {/* Right Ad Sidebar - Sticky on desktop */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-6 h-[calc(100vh-6rem)]">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center flex-1 border-dashed relative">
            <div className="absolute top-4 left-4 bg-slate-100 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest border border-slate-200">
              AD SPACE
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[#475569] font-black text-xs uppercase tracking-wider block mb-2">
              TARGET LOCAL AUDIENCE
            </span>
            <p className="text-[11px] text-[#64748B] font-semibold leading-relaxed max-w-[180px]">
              Supercharge your agency&apos;s hiring speed. Placement banner rates start from ₹99/week.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
