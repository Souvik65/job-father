"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Check,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Award,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type PlanId = "3m" | "6m" | "12m";
type Screen = "plans" | "payment";

const PLAN_META: Record<
  PlanId,
  { dur: string; price: string; perMo: string; months: number }
> = {
  "3m": { dur: "3 Months (Pro)", price: "75", perMo: "25", months: 3 },
  "6m": { dur: "6 Months (Pro +)", price: "120", perMo: "20", months: 6 },
  "12m": { dur: "12 Months (Ultra)", price: "180", perMo: "15", months: 12 },
};

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("plans");
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    if (session?.user?.id) {
      const p2 = (n: number) => String(n).padStart(2, "0");
      const today = `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}-${p2(new Date().getDate())}`;
      fetch(`/api/user/mock-test-stats?clientDate=${today}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setUserPlan(data.plan || "free");
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyUPI = () => {
    if (typeof window === "undefined" || !navigator.clipboard) {
      showToast("UPI ID: jobfather@upi");
      return;
    }
    navigator.clipboard
      .writeText("jobfather@upi")
      .then(() => showToast("UPI ID copied!"))
      .catch(() => showToast("UPI ID: jobfather@upi"));
  };

  const goToPayment = (planId: PlanId) => {
    setSelectedPlan(planId);
    setScreenshotFile(null);
    setShowQR(false);
    setScreen("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBackToPlans = () => {
    setScreen("plans");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitPayment = async () => {
    if (!screenshotFile) {
      showToast("Please select your payment screenshot image");
      return;
    }
    const email = session?.user?.email || "";
    if (!email) {
      showToast("Error: You must be logged in to upgrade");
      return;
    }
    if (!selectedPlan) {
      showToast("Error: Please select a plan first");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", screenshotFile);
      formData.append("planId", selectedPlan);
      const res = await fetch("/api/mock-tests/upgrade", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit request");
      setScreenshotFile(null);
      setShowConfirmation(true);
    } catch {
      showToast("Error submitting request. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    router.push("/mock-tests");
  };

  const plans: { id: PlanId; best?: boolean }[] = [
    { id: "3m" },
    { id: "12m", best: true },
    { id: "6m" },
  ];

  const meta = selectedPlan ? PLAN_META[selectedPlan] : null;
  const amount = meta?.price ?? "0";

  // Hierarchy for disabling lower plans
  const planWeights: Record<string, number> = {
    free: 0,
    "3m": 1,
    "6m": 2,
    "12m": 3,
    premium: 3,
  };
  const currentWeight = planWeights[userPlan] || 0;

  if (currentWeight >= 3 && screen === "plans") {
    return (
      <div className="animate-fadeUp flex flex-col items-center justify-center p-10 mt-10">
        <div className="bg-[#0d1b2a] rounded-3xl p-10 flex flex-col items-center text-center shadow-xl border border-orange-500/20 max-w-md w-full">
          <Award className="w-16 h-16 text-orange-500 mb-6" />
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
            Maximum Power
          </h2>
          <p className="text-slate-400 font-medium mb-6">
            You are currently on the highest tier (12 Months) Premium plan. You
            have full access to all mock tests, books, and analytics.
          </p>
          <a
            href="/mock-tests"
            className="bg-orange-500 text-white font-black uppercase tracking-wider text-xs px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  /* ─── SCREEN: PLAN SELECTION ─── */
  if (screen === "plans") {
    return (
      <div className="animate-fadeUp flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2 w-full">
            Upgrade to Premium Plan
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map(({ id, best }) => {
            const p = PLAN_META[id];
            const isSelected = selectedPlan === id;
            const itemWeight = planWeights[id] || 0;
            const isDisabled = itemWeight <= currentWeight;

            return (
              <div
                key={id}
                onClick={() => !isDisabled && setSelectedPlan(id)}
                className={`bg-white dark:bg-[#111d2e] rounded-2xl p-5 border-2 transition-all flex flex-col gap-4 relative overflow-hidden
                  ${
                    isDisabled
                      ? "border-slate-200 dark:border-slate-800 opacity-60 grayscale cursor-not-allowed"
                      : isSelected
                        ? "border-orange-500 shadow-lg scale-[1.02] cursor-pointer"
                        : best
                          ? "border-orange-300 dark:border-orange-700 shadow-md hover:border-orange-500 cursor-pointer"
                          : "border-slate-200 dark:border-slate-800 hover:border-orange-400 cursor-pointer"
                  }`}
              >
                {best && !isDisabled && (
                  <div className="absolute top-3.5 -right-6 bg-orange-500 text-white text-[7.5px] font-black uppercase tracking-wider py-1 px-7 rotate-45 shadow shadow-orange-500/20">
                    Best Value
                  </div>
                )}
                {userPlan === id && (
                  <div className="absolute top-3.5 -right-6 bg-slate-500 text-white text-[7.5px] font-black uppercase tracking-wider py-1 px-7 rotate-45 shadow shadow-slate-500/20">
                    Active
                  </div>
                )}
                <div>
                  <span
                    className={`block text-[10.5px] font-black uppercase tracking-wider ${best && !isDisabled ? "text-orange-500" : "text-slate-400"}`}
                  >
                    {p.dur}
                  </span>
                  <div
                    className={`font-extrabold text-4xl tracking-tight leading-none mt-2 ${isDisabled ? "text-slate-400" : "text-slate-800 dark:text-white"}`}
                  >
                    <span className="text-lg font-bold align-super">Rs</span>
                    {p.price}
                  </div>
                  <span
                    className={`block text-[9px] font-semibold mt-1 ${isDisabled ? "text-slate-400" : "text-green-500"}`}
                  >
                    = Rs {p.perMo} / month
                  </span>
                </div>
                <ul
                  className={`flex flex-col gap-1.5 text-[11.5px] font-semibold leading-normal ${isDisabled ? "text-slate-400" : "text-slate-500"}`}
                >
                  {[
                    "Full subject lists",
                    "Weak subject books",
                    "Unlimited attempts",
                    "Full history lists",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5">
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${isDisabled ? "text-slate-400" : "text-green-500"}`}
                      />{" "}
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) goToPayment(id);
                  }}
                  className={`w-full py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all mt-auto flex items-center justify-center gap-1.5
                    ${
                      isDisabled
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        : isSelected
                          ? "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
                          : best
                            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-300 dark:border-orange-700 hover:bg-orange-500 hover:text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                >
                  {isDisabled
                    ? "Current Plan"
                    : isSelected
                      ? "Proceed to Pay"
                      : "Choose Plan"}
                  {!isDisabled && <ChevronRight className="w-3 h-3" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Hint */}
        {!selectedPlan && (
          <p className="text-center text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
            👆 Select a plan above to continue
          </p>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-18.5 sm:bottom-6 left-1/2 -translate-x-1/2 bg-[#0d1b2a] border border-white/8 text-white text-xs font-black tracking-wide uppercase px-5 py-2.5 rounded-full shadow-lg z-50 animate-fadeUp">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  /* ─── SCREEN: PAYMENT ─── */
  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBackToPlans}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Plans
        </button>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">
          {meta?.dur} — Rs {amount}
        </span>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-black uppercase tracking-wider">
        <span className="text-green-500 flex items-center gap-1">
          <Check className="w-3 h-3" /> Plan Selected
        </span>
        <span className="h-px w-5 bg-slate-300 dark:bg-slate-700" />
        <span className="text-orange-500">2. Pay via UPI</span>
        <span className="h-px w-5 bg-slate-300 dark:bg-slate-700" />
        <span className="text-slate-400">3. Upload Proof</span>
      </div>

      {/* UPI Payment Box */}
      <div className="bg-[#eff6ff] dark:bg-[#eff6ff]/5 border border-[#bfdbfe] dark:border-[#bfdbfe]/20 rounded-2xl p-5 text-center flex flex-col items-center gap-4">
        <div>
          <span className="block text-[10px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
            ⚡ Pay Securely with UPI
          </span>
          <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Complete your payment of{" "}
            <span className="font-black text-blue-600 dark:text-blue-400">
              ₹{amount}
            </span>{" "}
            via UPI
          </span>
        </div>

        {/* Desktop: Pay Now button → reveals QR + UPI details */}
        <div className="hidden sm:flex flex-col items-center gap-3 w-full">
          {!showQR ? (
            <button
              onClick={() => setShowQR(true)}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[10px] font-black tracking-widest uppercase px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              Pay Now →
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3 animate-fadeUp w-full">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=jobfather@upi&pn=Jobfather&am=${amount}&cu=INR`)}`}
                alt="UPI QR Code"
                className="rounded-xl border-4 border-white shadow-md"
                width={160}
                height={160}
                unoptimized
              />
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                Scan with your UPI app to pay
              </span>
              <span className="font-black text-2xl text-blue-600 dark:text-blue-400 leading-none tracking-tight">
                jobfather@upi
              </span>
              <button
                onClick={copyUPI}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-[9.5px] font-black tracking-widest uppercase px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                Copy UPI ID
              </button>
            </div>
          )}
        </div>

        {/* Mobile: always show Pay Now link + UPI ID + Copy */}
        <div className="flex sm:hidden flex-col items-center gap-3 w-full">
          <span className="font-black text-2xl text-blue-600 dark:text-blue-400 leading-none tracking-tight">
            jobfather@upi
          </span>
          <div className="flex gap-2 flex-wrap justify-center">
            <a
              href={`upi://pay?pa=jobfather@upi&pn=Jobfather&am=${amount}&cu=INR`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[9.5px] font-black tracking-widest uppercase px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              Pay Now →
            </a>
            <button
              onClick={copyUPI}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-[9.5px] font-black tracking-widest uppercase px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              Copy UPI ID
            </button>
          </div>
        </div>
      </div>

      {/* Upload Screenshot */}
      <div className="bg-white dark:bg-[#111d2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="proof"
            className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider"
          >
            Upload Payment Screenshot *
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors relative cursor-pointer">
            <input
              id="proof"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
                  if (file.size > MAX_SIZE) {
                    showToast("✗ File size exceeds 5MB limit.");
                    e.target.value = "";
                    setScreenshotFile(null);
                    return;
                  }
                  const ALLOWED_TYPES = [
                    "image/png",
                    "image/jpeg",
                    "image/jpg",
                    "image/webp",
                  ];
                  if (!ALLOWED_TYPES.includes(file.type)) {
                    showToast(
                      "✗ Only PNG, JPG, JPEG, and WEBP formats are supported.",
                    );
                    e.target.value = "";
                    setScreenshotFile(null);
                    return;
                  }
                }
                setScreenshotFile(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {screenshotFile ? (
              <div className="text-xs font-semibold text-green-600 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> {screenshotFile.name}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-2xl">📸</span>
                <span className="text-xs font-semibold text-slate-500">
                  Click to browse or drag and drop
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG, WEBP accepted
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={submitPayment}
          disabled={!screenshotFile || isSubmitting}
          className={`text-[10px] font-black tracking-widest uppercase py-3.5 rounded-xl shadow-sm transition-all ${
            !screenshotFile || isSubmitting
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 active:scale-98 text-white shadow-green-500/20"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Upgrade Request"}
        </button>

        <div className="bg-amber-500/5 border border-amber-500/25 rounded-xl p-3 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 leading-normal">
            Your request will be reviewed within 24 hours. Once verified, your
            account will automatically upgrade to Premium.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-18.5 sm:bottom-6 left-1/2 -translate-x-1/2 bg-[#0d1b2a] border border-white/8 text-white text-xs font-black tracking-wide uppercase px-5 py-2.5 rounded-full shadow-lg z-50 animate-fadeUp">
          {toastMessage}
        </div>
      )}

      {/* ✅ Confirmation Modal */}
      {showConfirmation && meta && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 sm:pb-0 animate-fadeUp">
          <div className="bg-white dark:bg-[#111d2e] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                🏆 Upgrade Request
              </span>
              <button
                onClick={handleConfirmationClose}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors text-sm font-black"
              >
                ✕
              </button>
            </div>

            {/* Success Icon */}
            <div className="flex flex-col items-center px-6 pt-6 pb-4 gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
              </div>
              <div className="text-center">
                <h2 className="text-[17px] font-black text-slate-800 dark:text-white leading-snug">
                  Request Submitted!
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Your payment is under review by admin.
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="mx-5 mb-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs font-semibold">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Plan</span>
                <span className="text-slate-800 dark:text-white font-black">
                  {meta.dur}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Amount Paid
                </span>
                <span className="text-slate-800 dark:text-white font-black">
                  ₹{meta.price}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-slate-500 dark:text-slate-400">
                  Status
                </span>
                <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-full uppercase tracking-wide">
                  Pending Review
                </span>
              </div>
            </div>

            <p className="px-5 pb-4 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              Once the admin verifies your payment, your account will
              automatically upgrade to{" "}
              <span className="font-black text-orange-500">Premium</span>.
            </p>

            {/* CTA Button */}
            <div className="px-5 pb-5">
              <button
                onClick={handleConfirmationClose}
                className="w-full bg-[#0d1b2a] dark:bg-slate-800 hover:bg-[#1a2e42] dark:hover:bg-slate-700 text-white text-[10.5px] font-black tracking-widest uppercase py-3.5 rounded-xl transition-all active:scale-98"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
