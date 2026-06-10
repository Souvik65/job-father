"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Clock, ArrowLeft, CreditCard, ReceiptText, Eye, Download } from "lucide-react";

type UpgradeRequest = {
  id: string;
  userId: string;
  planId: string;
  screenshotUrl: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    mockTestPlan: string;
  };
};

function isSafeImageUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return true;
    }
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [modalImageFailed, setModalImageFailed] = useState(false);

  const handleSelectImage = (imgUrl: string | null) => {
    setSelectedImage(imgUrl);
    setModalImageFailed(false);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setError(null);
        const res = await fetch("/api/admin/upgrade-requests?status=PENDING");
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (data.requests) {
          setRequests(data.requests);
        } else {
          setRequests([]);
        }
      } catch (err) {
        console.error(err);
        const errMsg = err instanceof Error ? err.message : "Failed to load upgrade requests.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSelectImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedImage]);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/upgrade-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setError(null);
      } else {
        setError("Failed to process request. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while processing the request.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Premium Upgrade Requests</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm font-semibold flex items-center gap-2">
          <span>✗</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-slate-200">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No pending upgrade requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-600 rounded-md">
                    {req.planId.toUpperCase()} PLAN
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 truncate">{req.user.name || "Unknown User"}</h3>
                <p className="text-sm text-slate-500 truncate">{req.user.email}</p>
                <p className="text-xs text-slate-400 mt-1">Current plan: {req.user.mockTestPlan}</p>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-center mb-4 gap-3">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[11px] font-bold text-[#475569] tracking-widest flex items-center gap-1.5 uppercase">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                    Payment Verification
                  </span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 mb-4 shadow-sm flex flex-col items-start">
                  <p className="text-sm font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                    <ReceiptText className="w-4 h-4 text-slate-600" />
                    Payment Screenshot:
                  </p>
                  
                  <div className="w-[100px] h-[150px] bg-slate-100 border border-slate-200 rounded-md overflow-hidden mb-4 shadow-sm relative flex items-center justify-center">
                    {failedImages[req.id] ? (
                      <div className="text-center p-2 flex flex-col items-center justify-center gap-1">
                        <ReceiptText className="w-6 h-6 text-slate-400" />
                        <span className="text-[9px] text-slate-400 font-bold leading-tight">No Preview</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={isSafeImageUrl(req.screenshotUrl) ? req.screenshotUrl : ""}
                        alt="Payment Screenshot"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => {
                          setFailedImages((prev) => ({ ...prev, [req.id]: true }));
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => handleSelectImage(req.screenshotUrl)}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      View
                    </button>
                    <a
                      href={isSafeImageUrl(req.screenshotUrl) ? req.screenshotUrl : "#"}
                      download={`Payment_Screenshot_${(req.user.name || "User").replace(/[^a-zA-Z0-9_-]/g, "_")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#00004d] text-white hover:bg-blue-950 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleAction(req.id, "REJECT")}
                    disabled={processing === req.id}
                    className="flex-1 py-2 px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "APPROVE")}
                    disabled={processing === req.id}
                    className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Payment screenshot preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => handleSelectImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => handleSelectImage(null)}
              aria-label="Close preview"
              className="absolute -top-10 right-0 md:-right-10 p-2 text-white/80 hover:text-white transition-colors bg-slate-900/50 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            {modalImageFailed ? (
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center flex flex-col items-center justify-center gap-3 relative z-20">
                <ReceiptText className="w-12 h-12 text-slate-500" />
                <p className="text-sm font-semibold text-slate-300">Unable to load payment screenshot preview.</p>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={isSafeImageUrl(selectedImage) ? selectedImage : ""}
                alt="Payment Screenshot Preview"
                className="max-w-full max-h-full object-contain rounded-xl"
                onError={() => setModalImageFailed(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
