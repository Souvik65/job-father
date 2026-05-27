import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { verifyJob, deleteJob } from './actions';
import { formatDate } from '@/lib/utils';
import { PaymentScreenshotViewer } from '@/components/PaymentScreenshotViewer';

export default async function AdminDashboard() {
  // Query actual data from database
  const totalJobsCount = await prisma.job.count();
  const activeJobsCount = await prisma.job.count({ where: { isVerified: true } });
  const totalUsersCount = await prisma.user.count();
  const activeAdsCount = await prisma.ad.count({ where: { isActive: true } });

  // Get pending jobs
  const pendingJobs = await prisma.job.findMany({
    where: { isVerified: false },
    orderBy: { postedAt: 'desc' },
    include: { timeline: true },
  });

  // Get recent verified jobs for the table (limit to 10)
  const recentJobs = await prisma.job.findMany({
    where: { isVerified: true },
    orderBy: { postedAt: 'desc' },
    include: { timeline: true },
    take: 10,
  });

  // Get recent newsletter subscribers for the "Recent Subscribers" table (limit to 5)
  const recentSubscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      email: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000666] tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-[#454652] mt-1">System-wide metrics and recent activity</p>
        </div>
        <Link
          href="/admin/jobs/create"
          className="bg-[#000666] hover:bg-[#1a237e] text-white px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition flex items-center gap-2 self-start sm:self-auto touch-target"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Job
        </Link>
      </div>

      {/* Metrics Grid — 2 cols on mobile, 4 on large */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric Card 1: Total Jobs */}
        <div className="bg-white border border-[#c6c5d4] rounded-xl p-3 sm:p-5 flex flex-col gap-2 shadow-sm min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#454652] min-w-0">
            <span className="material-symbols-outlined text-[#000666] text-lg sm:text-xl shrink-0">work</span>
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Total Jobs</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1a1c1c]">{totalJobsCount.toLocaleString()}</div>
        </div>

        {/* Metric Card 2: Active Jobs */}
        <div className="bg-white border border-[#c6c5d4] rounded-xl p-3 sm:p-5 flex flex-col gap-2 shadow-sm min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#454652] min-w-0">
            <span className="material-symbols-outlined text-[#5aa958] text-lg sm:text-xl shrink-0">check_circle</span>
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Active Jobs</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1a1c1c]">{activeJobsCount.toLocaleString()}</div>
        </div>

        {/* Metric Card 3: Email Subscribers (Registered Users) */}
        <div className="bg-white border border-[#c6c5d4] rounded-xl p-3 sm:p-5 flex flex-col gap-2 shadow-sm min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#454652] min-w-0">
            <span className="material-symbols-outlined text-[#343d96] text-lg sm:text-xl shrink-0">mail</span>
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Subscribers</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1a1c1c]">{totalUsersCount.toLocaleString()}</div>
        </div>

        {/* Metric Card 4: Active Ads */}
        <div className="bg-white border border-[#c6c5d4] rounded-xl p-3 sm:p-5 flex flex-col gap-2 shadow-sm min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#454652] min-w-0">
            <span className="material-symbols-outlined text-[#fc820c] text-lg sm:text-xl shrink-0">campaign</span>
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">Active Ads</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1a1c1c]">{activeAdsCount.toLocaleString()}</div>
        </div>
      </div>

      {/* Pending Reviews Section */}
      {pendingJobs.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 mb-4 border-b border-amber-200 pb-2">
            <span className="material-symbols-outlined text-amber-600">gavel</span>
            <h2 className="text-lg font-bold">Pending Review ({pendingJobs.length})</h2>
          </div>
          <div className="grid gap-4">
            {pendingJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-4 sm:p-6 rounded-lg border border-amber-200 shadow-sm flex flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start w-full">
                  {/* Left Column: Job Details */}
                  <div className="flex-1 space-y-3 min-w-0 w-full">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wide">
                        {job.category}
                      </span>
                      {job.isPrivate && (
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase tracking-wide">
                          Private Post
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-xl text-slate-800 tracking-tight leading-snug">{job.title}</h3>
                      <p className="text-sm font-semibold text-slate-500">{job.organization}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-xs text-slate-600 font-semibold shadow-inner">
                      <div>
                        <span className="text-[10px] text-[#475569] font-black uppercase tracking-wider block mb-0.5">Vacancies</span>
                        <span className="text-[#000666] font-bold text-sm">{job.totalVacancies ?? 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#475569] font-black uppercase tracking-wider block mb-0.5">Category Type</span>
                        <span className="text-[#000666] font-bold text-sm">{job.category}</span>
                      </div>
                      {job.timeline?.applicationStart && (
                        <div>
                          <span className="text-[10px] text-[#475569] font-black uppercase tracking-wider block mb-0.5">Post Start</span>
                          <span className="text-[#000666] font-bold">{formatDate(job.timeline.applicationStart)}</span>
                        </div>
                      )}
                      {job.timeline?.applicationEnd && (
                        <div>
                          <span className="text-[10px] text-[#475569] font-black uppercase tracking-wider block mb-0.5">Post Until (Deadline)</span>
                          <span className="text-rose-600 font-bold">{formatDate(job.timeline.applicationEnd)}</span>
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <div className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-3.5 text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed shadow-sm">
                        <span className="text-[10px] text-[#475569] font-black uppercase tracking-wider block mb-1">Description & Info</span>
                        {job.description}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Screenshot */}
                  {job.paymentScreenshot && (
                    <div className="shrink-0 w-full md:w-80 border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center border-b border-slate-200/80 pb-1.5 mb-1">
                        💳 Payment Verification
                      </span>
                      <PaymentScreenshotViewer
                        src={job.paymentScreenshot}
                        jobId={job.id}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 w-full pt-3 border-t border-slate-100">
                  <form action={verifyJob.bind(null, job.id, !job.isVerified)}>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-xs transition shadow-sm flex items-center gap-1 touch-target cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Approve
                    </button>
                  </form>
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="bg-[#e0e0ff] hover:bg-[#bdc2ff] text-[#343d96] px-4 py-2 rounded-lg font-semibold text-xs transition flex items-center gap-1 touch-target cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </Link>
                  <form action={deleteJob.bind(null, job.id)}>
                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold text-xs transition shadow-sm flex items-center gap-1 touch-target cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs Table (Left column, spanning 2 grid columns) */}
        <div className="bg-white border border-[#c6c5d4] rounded-xl overflow-hidden shadow-sm lg:col-span-2 flex flex-col">
          <div className="p-4 border-b border-[#c6c5d4] bg-[#f3f3f3] flex justify-between items-center">
            <h3 className="font-bold text-base text-[#000666]">Recent Jobs</h3>
            <span className="text-xs text-[#454652] font-medium">{recentJobs.length} active listed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#eeeeee] text-[#454652] text-xs font-semibold border-b border-[#c6c5d4]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Posted Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#c6c5d4]">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-[#454652]">
                      No active jobs listed. Click `&quot;`Create Job`&quot;` to create one.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="py-3 px-4 text-[#1a1c1c] font-medium">{job.title}</td>
                      <td className="py-3 px-4 text-[#454652]">{job.category}</td>
                      <td className="py-3 px-4 text-[#454652]">{formatDate(job.postedAt)}</td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-lg transition"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm block">edit</span>
                        </Link>
                        <form action={deleteJob.bind(null, job.id)}>
                          <button
                            type="submit"
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm block">delete</span>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Subscribers Table (Right column, spanning 1 grid column) */}
        <div className="bg-white border border-[#c6c5d4] rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-[#c6c5d4] bg-[#f3f3f3] flex justify-between items-center">
            <h3 className="font-bold text-base text-[#000666]">Recent Subscribers</h3>
            <span className="text-xs text-[#454652] font-medium">Top 5</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse h-full">
              <thead className="bg-[#eeeeee] text-[#454652] text-xs font-semibold border-b border-[#c6c5d4]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold text-right">Subscribed At</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#c6c5d4]">
                {recentSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 px-4 text-center text-[#454652]">
                      No newsletter subscribers yet.
                    </td>
                  </tr>
                ) : (
                  recentSubscribers.map((subscriber: { email: string; createdAt: Date }) => (
                    <tr key={subscriber.email} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="py-4 px-4 text-[#1a1c1c] font-medium truncate max-w-[140px]" title={subscriber.email}>
                        {subscriber.email}
                      </td>
                      <td className="py-4 px-4 text-[#454652] text-right text-xs">
                        {formatDate(subscriber.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
