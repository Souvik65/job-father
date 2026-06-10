import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdType, AdPosition } from '@prisma/client';
import { saveAd } from '../actions';
import { POSITION_DETAILS } from '@/lib/adConstants';

export default function CreateAdPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-[#454652] mb-1">
          <Link href="/admin/ads" className="hover:text-[#000666]">Advertisements</Link>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span className="font-bold text-[#000666]">New Campaign</span>
        </nav>
        <h1 className="text-2xl font-extrabold text-[#1a1c1c]">Add New Advertisement</h1>
      </div>

      <div className="bg-white border border-[#c6c5d4] rounded-xl shadow-sm p-6">
        <form
          action={async (formData: FormData) => {
            'use server';
            try {
              await saveAd(formData);
            } catch (error) {
              console.error('Failed to save ad:', error);
              throw error;
            }
            redirect('/admin/ads');
          }}
          className="space-y-5"
        >
          {/* Label */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1.5">
              Campaign Label *
            </label>
            <input
              name="label"
              type="text"
              required
              placeholder="e.g. UPSC Coaching Partner"
              className="w-full h-10 px-4 rounded-lg border border-[#c6c5d4] text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1.5">
              Ad Type *
            </label>
            <select
              name="type"
              defaultValue={AdType.CUSTOM}
              className="w-full h-10 px-4 rounded-lg border border-[#c6c5d4] text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition"
            >
              <option value={AdType.CUSTOM}>Custom (Direct Banner)</option>
              <option value={AdType.GOOGLE}>Google AdSense</option>
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1.5">
              Position Slot *
            </label>
            <select
              name="position"
              defaultValue={AdPosition.INLINE_AFTER_3RD}
              className="w-full h-10 px-4 rounded-lg border border-[#c6c5d4] text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition"
            >
              {Object.entries(POSITION_DETAILS).map(([val, detail]) => (
                <option key={val} value={val}>{detail.label}</option>
              ))}
            </select>
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1.5">
              Target URL (Click-through)
            </label>
            <input
              name="targetUrl"
              type="url"
              placeholder="https://example.com/landing"
              className="w-full h-10 px-4 rounded-lg border border-[#c6c5d4] text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1.5">
              Banner Image URL
            </label>
            <input
              name="imageUrl"
              type="url"
              placeholder="https://cdn.example.com/banner.jpg"
              className="w-full h-10 px-4 rounded-lg border border-[#c6c5d4] text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1.5">
              Internal Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Optional admin notes..."
              className="w-full px-4 py-2.5 rounded-lg border border-[#c6c5d4] text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-[#c6c5d4] text-[#000666] focus:ring-[#000666]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[#1a1c1c]">
              Active (visible on site)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-[#000666] hover:bg-[#1a237e] text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-md transition"
            >
              Create Campaign
            </button>
            <Link
              href="/admin/ads"
              className="px-6 py-2.5 rounded-lg border border-[#c6c5d4] text-sm font-semibold text-[#454652] hover:bg-[#eeeeee] transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
