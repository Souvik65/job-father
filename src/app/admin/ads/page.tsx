import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { AdPosition, AdType } from '@prisma/client';
import { toggleAdStatus, deleteAd } from './actions';
import { formatDate } from '@/lib/utils';

const POSITION_LABELS: Record<AdPosition, { label: string; icon: string }> = {
  HEADER_TOP:       { label: 'Header Top',           icon: 'vertical_align_top' },
  INLINE_AFTER_3RD: { label: 'Inline (After 3rd Job)', icon: 'view_day' },
  SIDEBAR_STICKY:   { label: 'Sidebar Sticky',        icon: 'call_to_action' },
  FOOTER_BANNER:    { label: 'Footer Banner',          icon: 'vertical_align_bottom' },
  JOB_DETAIL_TOP:   { label: 'Job Detail Top',         icon: 'article' },
};

export default async function ManageAdsPage() {
  const [ads, totalActive, aggregates] = await Promise.all([
    prisma.ad.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.ad.count({ where: { isActive: true } }),
    prisma.ad.aggregate({
      _sum: {
        impressions: true,
        clicks: true,
      },
    }),
  ]);

  const totalImpressions = aggregates._sum.impressions ?? 0;
  const totalClicks = aggregates._sum.clicks ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-[#454652] mb-1">
            <span>Admin</span>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            <span className="font-bold text-[#000666]">Advertisements</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-[#1a1c1c] tracking-tight">
            Advertisements Management
          </h1>
          <p className="text-sm text-[#454652] mt-1">
            Manage active campaigns, placement slots, and custom banners.
          </p>
        </div>
        <Link
          href="/admin/ads/create"
          className="bg-[#000666] hover:bg-[#1a237e] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Add New Ad
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#c6c5d4] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-[#454652]">
            <span className="material-symbols-outlined text-[#5aa958]" style={{ fontSize: 20 }}>campaign</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Active Ads</span>
          </div>
          <div className="text-2xl font-bold text-[#1a1c1c]">{totalActive}</div>
        </div>
        <div className="bg-white border border-[#c6c5d4] rounded-xl p-4 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-[#454652]">
            <span className="material-symbols-outlined text-[#343d96]" style={{ fontSize: 20 }}>visibility</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Total Impressions</span>
          </div>
          <div className="text-2xl font-bold text-[#1a1c1c]">{totalImpressions.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-[#c6c5d4] rounded-xl p-4 flex flex-col gap-1 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-[#454652]">
            <span className="material-symbols-outlined text-[#fc820c]" style={{ fontSize: 20 }}>ads_click</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
          </div>
          <div className="text-2xl font-bold text-[#1a1c1c]">{totalClicks.toLocaleString()}</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#c6c5d4] rounded-xl overflow-hidden shadow-sm">
        {/* Table toolbar */}
        <div className="border-b border-[#c6c5d4] bg-[#f3f3f3] px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-[#000666]">
            All Campaigns
            <span className="ml-2 text-xs font-normal text-[#454652]">({ads.length} total)</span>
          </span>
          <Link
            href="/admin/ads/create"
            className="text-xs text-[#343d96] font-semibold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            Add New
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#e8e8e8] bg-[#fafafa]">
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider w-20">
                  Preview
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider">
                  Label / Campaign
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider w-28">
                  Type
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider w-44">
                  Position Slot
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider w-36">
                  Metrics
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider w-28 text-center">
                  Status
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider text-right w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#454652] text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-[#c6c5d4]">
                        campaign
                      </span>
                      <p>No advertisements yet.</p>
                      <Link
                        href="/admin/ads/create"
                        className="text-[#000666] font-semibold underline underline-offset-2 text-sm"
                      >
                        Create your first campaign
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                ads.map((ad) => {
                  const pos = POSITION_LABELS[ad.position];
                  return (
                    <tr key={ad.id} className={`hover:bg-[#f9f9f9] transition-colors group ${!ad.isActive ? 'opacity-60' : ''}`}>
                      {/* Preview thumbnail */}
                      <td className="py-4 px-4">
                        <div className="w-16 h-11 rounded-lg border border-[#c6c5d4] overflow-hidden bg-[#f3f3f3] flex items-center justify-center relative group/thumb">
                          {ad.imageUrl ? (
                            <>
                              <Image
                                src={ad.imageUrl}
                                alt={ad.label}
                                fill
                                className={`object-cover ${!ad.isActive ? 'grayscale' : ''}`}
                                sizes="64px"
                              />
                              <div className="absolute inset-0 bg-[#000666]/70 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer">
                                <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>visibility</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-[#454652]">
                              {ad.type === AdType.GOOGLE ? 'Google' : 'Banner'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Label */}
                      <td className="py-4 px-4">
                        <div className={`font-bold text-sm mb-0.5 ${ad.isActive ? 'text-[#000666]' : 'text-[#454652] line-through'}`}>
                          {ad.label}
                        </div>
                        <div className="text-xs text-[#767683] flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                            {ad.type === AdType.GOOGLE ? 'code' : 'link'}
                          </span>
                          {ad.type === AdType.GOOGLE ? 'AdSense Managed' : (ad.targetUrl ?? 'No target URL')}
                        </div>
                        {ad.notes && (
                          <div className="text-xs text-[#767683] mt-1 italic truncate max-w-[200px]" title={ad.notes}>
                            {ad.notes}
                          </div>
                        )}
                      </td>

                      {/* Type badge */}
                      <td className="py-4 px-4">
                        {ad.type === AdType.GOOGLE ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#ffdcc6] text-[#723600] text-[10px] font-bold border border-[#ffc299] uppercase">
                            Google
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#e0e0ff] text-[#343d96] text-[10px] font-bold border border-[#bdc2ff] uppercase">
                            Custom
                          </span>
                        )}
                      </td>

                      {/* Position */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-[#1a1c1c]">
                          <span className="material-symbols-outlined text-[#767683]" style={{ fontSize: 16 }}>
                            {pos.icon}
                          </span>
                          <span className="text-xs">{pos.label}</span>
                        </div>
                      </td>

                      {/* Metrics */}
                      <td className="py-4 px-4">
                        {ad.type === AdType.GOOGLE ? (
                          <span className="text-xs text-[#454652]">Managed via Google</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between text-xs w-28">
                              <span className="text-[#454652]">Imp:</span>
                              <span className="font-bold text-[#1a1c1c]">{ad.impressions.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs w-28">
                              <span className="text-[#454652]">Clk:</span>
                              <span className="font-bold text-[#000666]">{ad.clicks.toLocaleString()}</span>
                            </div>
                            {ad.impressions > 0 && (
                              <div className="text-[10px] text-[#767683]">
                                CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status toggle */}
                      <td className="py-4 px-4 text-center">
                        <form
                          action={async () => {
                            'use server';
                            await toggleAdStatus(ad.id, !ad.isActive);
                          }}
                        >
                          <button type="submit" className="inline-flex flex-col items-center gap-0.5 cursor-pointer">
                            <span
                              className={`w-9 h-5 flex rounded-full transition-colors duration-200 ${
                                ad.isActive ? 'bg-[#5aa958]' : 'bg-[#c6c5d4]'
                              }`}
                            >
                              <span
                                className={`self-center ml-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                  ad.isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </span>
                            <span className={`text-[10px] font-bold ${ad.isActive ? 'text-[#5aa958]' : 'text-[#454652]'}`}>
                              {ad.isActive ? 'Active' : 'Draft'}
                            </span>
                          </button>
                        </form>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/ads/${ad.id}`}
                            className="p-1.5 rounded-lg text-[#454652] hover:text-[#000666] hover:bg-[#e0e0ff] transition"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined block" style={{ fontSize: 18 }}>edit</span>
                          </Link>
                          <form
                            action={async () => {
                              'use server';
                              await deleteAd(ad.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1.5 rounded-lg text-[#454652] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined block" style={{ fontSize: 18 }}>delete</span>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {ads.length > 0 && (
          <div className="bg-[#f3f3f3] border-t border-[#c6c5d4] px-4 py-3">
            <span className="text-sm text-[#454652]">
              <span className="font-semibold text-[#1a1c1c]">{ads.length}</span> campaign{ads.length !== 1 ? 's' : ''} total ·{' '}
              <span className="font-semibold text-[#5aa958]">{totalActive} active</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
