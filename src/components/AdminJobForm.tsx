'use client';

import { saveJob } from '@/app/admin/actions';
import { Job } from '@/types/job';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CATEGORIES } from '@/lib/constants';

export function AdminJobForm({ job }: { job?: Job }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await saveJob(formData, job?.id);
      router.push('/admin/jobs');
    } catch (err) {
      console.error(err);
      setError('Failed to save job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const inputClass = "w-full border text-slate-400 bg-slate-50 border-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7315] focus:border-transparent transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Title *</label>
          <input 
            required 
            name="title" 
            placeholder="e.g. TPSC Senior Administrative Officer" 
            defaultValue={job?.title} 
            className={inputClass} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Organization *</label>
          <input 
            required 
            name="organization" 
            placeholder="e.g. Tripura Public Service Commission" 
            defaultValue={job?.organization || ''} 
            className={inputClass} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Category *</label>
          <select 
            required 
            name="category" 
            defaultValue={job?.category} 
            className={inputClass}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Total Vacancies</label>
          <input 
            type="number" 
            name="totalVacancies" 
            placeholder="e.g. 50" 
            defaultValue={job?.totalVacancies || ''} 
            className={inputClass} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Source URL *</label>
          <input 
            required 
            type="url" 
            name="sourceUrl" 
            placeholder="https://tpsc.tripura.gov.in/notifications" 
            defaultValue={job?.sourceUrl || ''} 
            className={inputClass} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Apply URL</label>
          <input 
            type="url" 
            name="applyUrl" 
            placeholder="https://tpsc.tripura.gov.in/apply" 
            defaultValue={job?.applyUrl || ''} 
            className={inputClass} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Syllabus URL</label>
          <input 
            type="url" 
            name="syllabusUrl" 
            placeholder="https://tpsc.tripura.gov.in/syllabus.pdf" 
            defaultValue={job?.syllabusUrl || ''} 
            className={inputClass} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Application Start</label>
          <input 
            type="date" 
            name="applicationStart" 
            defaultValue={formatDate(job?.timeline?.applicationStart)} 
            className={inputClass} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Application End</label>
          <input 
            type="date" 
            name="applicationEnd" 
            defaultValue={formatDate(job?.timeline?.applicationEnd)} 
            className={inputClass} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Exam Date</label>
          <input 
            type="date" 
            name="examDate" 
            defaultValue={formatDate(job?.timeline?.examDate)} 
            className={inputClass} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
        <textarea 
          name="description" 
          placeholder="Write detailed description of the job recruitment here..." 
          defaultValue={job?.description || ''} 
          rows={6} 
          className={inputClass}
        ></textarea>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="isPrivate" 
            defaultChecked={job?.isPrivate} 
            className="rounded border-slate-400 text-[#ff7315] focus:ring-[#ff7315] h-4 w-4"
          />
          <span className="text-sm font-bold text-slate-700">Is Private Job</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="isVerified" 
            defaultChecked={job ? job.isVerified : true} 
            className="rounded border-slate-400 text-[#ff7315] focus:ring-[#ff7315] h-4 w-4"
          />
          <span className="text-sm font-bold text-slate-700">Is Verified (Approved)</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700 transition"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="px-6 py-2 bg-[#ff7315] hover:bg-[#e66712] text-white rounded-lg font-bold disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Saving...' : 'Save Job'}
        </button>
      </div>
    </form>
  );
}
