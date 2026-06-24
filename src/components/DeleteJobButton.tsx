'use client';

import { useState } from 'react';
import { deleteJob } from '@/app/admin/actions';

export function DeleteJobButton({ jobId, variant = 'default' }: { jobId: string; variant?: 'default' | 'icon' }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    try {
      await deleteJob(jobId);
    } catch (error) {
      console.error('Failed to delete job', error);
      setIsDeleting(false); // Only reset if it fails, otherwise it unmounts
    }
  };

  const buttonContent = (
    <>
      {isDeleting ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <span className="material-symbols-outlined text-sm">delete</span>
      )}
      {variant === 'default' && (isDeleting ? 'Deleting...' : 'Delete')}
    </>
  );

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isDeleting}
          className="p-1.5 rounded-lg text-[#b91c1c] hover:text-[#991b1b] hover:bg-rose-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Delete job"
        >
          {buttonContent}
        </button>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isDeleting}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold text-xs transition shadow-sm flex items-center gap-1 touch-target cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonContent}
        </button>
      )}

      {/* Premium Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Job Listing?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete this job listing? It will be permanently removed from our active database.
            </p>
            
            <div className="flex justify-end gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
