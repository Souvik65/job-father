import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { verifyJob, deleteJob } from '../actions';
import { formatDate } from '@/lib/utils';
import { Category } from '@prisma/client';
import { CategoryFilter } from '@/components/CategoryFilter';

const PAGE_SIZE = 15;

const CATEGORY_LABELS: Record<Category, string> = {
  TPSC: 'TPSC',
  SSC: 'SSC',
  UPSC: 'UPSC',
  RAILWAY: 'Railways',
  BANKING: 'Banking',
  TEACHING: 'Teaching',
  POLICE: 'Police',
  DEFENCE: 'Defence',
  STATE_PSC: 'State PSC',
  PRIVATE: 'Private',
  OTHER: 'Other',
};

function getJobStatus(job: {
  isVerified: boolean;
  timeline: { applicationEnd: Date | null } | null;
}): 'Active' | 'Closed' | 'Draft' {
  if (!job.isVerified) return 'Draft';
  const endDate = job.timeline?.applicationEnd;
  if (endDate && endDate < new Date()) return 'Closed';
  return 'Active';
}

function StatusBadge({ status }: { status: 'Active' | 'Closed' | 'Draft' }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#a3f69c] text-[#002204] text-[10px] font-bold uppercase tracking-wider">
        Active
      </span>
    );
  }
  if (status === 'Closed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#e8e8e8] text-[#454652] text-[10px] font-bold uppercase tracking-wider">
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ffdcc6] text-[#723600] text-[10px] font-bold uppercase tracking-wider">
      Draft
    </span>
  );
}

export default async function AdminJobListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? '';
  const categoryParam = params.category ?? '';
  const category = Object.values(Category).includes(categoryParam as Category)
    ? (categoryParam as Category)
    : ('' as const);
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { organization: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
  };

  const [totalCount, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      include: { timeline: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount);

  function buildUrl(updates: Record<string, string | number>) {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (category) p.set('category', category);
    p.set('page', String(page));
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '') p.delete(k);
      else p.set(k, String(v));
    });
    return `/admin/jobs?${p.toString()}`;
  }

  // Smart pagination: show first, last, and up to 2 pages around current
  const pageNumbers: (number | 'ellipsis')[] = [];
  const pagesArr = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  );
  pagesArr.forEach((p, idx) => {
    if (idx > 0 && p - (pagesArr[idx - 1]) > 1) {
      pageNumbers.push('ellipsis');
    }
    pageNumbers.push(p);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#000666] tracking-tight">Job Listings</h1>
          <p className="text-sm text-[#454652] mt-1">
            Manage, edit, and publish government job opportunities.
          </p>
        </div>
        <Link
          href="/admin/jobs/create"
          className="bg-[#000666] hover:bg-[#1a237e] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            add
          </span>
          Add New Job
        </Link>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search form */}
        <form method="GET" action="/admin/jobs" className="flex-1 min-w-0 flex items-center gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <input type="hidden" name="page" value="1" />
          <div className="relative flex-1">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767683] pointer-events-none"
              style={{ fontSize: 20 }}
            >
              search
            </span>
            <input
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Search jobs or conducting body..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#c6c5d4] bg-white text-sm text-[#1a1c1c] placeholder-[#767683] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-4 bg-[#000666] text-white rounded-lg text-sm font-semibold hover:bg-[#1a237e] transition shrink-0"
          >
            Search
          </button>
        </form>

        {/* Category dropdown — client component to handle onChange navigation */}
        <CategoryFilter currentCategory={category} currentSearch={search} />

        {/* Clear filters */}
        {(search || category) && (
          <Link
            href="/admin/jobs"
            className="h-10 px-4 flex items-center gap-1 rounded-lg border border-[#c6c5d4] bg-white text-sm text-[#454652] hover:bg-[#eeeeee] transition shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              close
            </span>
            Clear
          </Link>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#c6c5d4] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f3f3] border-b border-[#c6c5d4]">
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider">
                  Title
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider">
                  Category
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider hidden lg:table-cell">
                  Conducting Body
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider hidden md:table-cell">
                  Last Date
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-[10px] font-semibold text-[#454652] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#454652] text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-[#c6c5d4]">
                        work_off
                      </span>
                      <p>
                        {search || category
                          ? 'No jobs match your search criteria.'
                          : 'No job listings yet.'}
                      </p>
                      {!search && !category && (
                        <Link
                          href="/admin/jobs/create"
                          className="text-[#000666] font-semibold underline underline-offset-2 text-sm"
                        >
                          Create the first job listing
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const status = getJobStatus(job);
                  const lastDate = job.timeline?.applicationEnd;

                  return (
                    <tr key={job.id} className="hover:bg-[#f9f9f9] transition-colors group">
                      {/* Title */}
                      <td className="py-4 px-4">
                        <div
                          className="font-semibold text-sm text-[#000666] leading-snug max-w-xs truncate"
                          title={job.title}
                        >
                          {job.title}
                        </div>
                        <div className="text-xs text-[#454652] mt-0.5">
                          {job.totalVacancies
                            ? `${job.totalVacancies.toLocaleString()} vacancies`
                            : 'Vacancies N/A'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-sm text-[#1a1c1c]">
                        {CATEGORY_LABELS[job.category]}
                      </td>

                      {/* Conducting Body */}
                      <td className="py-4 px-4 text-sm text-[#1a1c1c] hidden lg:table-cell max-w-[200px]">
                        <span className="truncate block" title={job.organization}>
                          {job.organization}
                        </span>
                      </td>

                      {/* Last Date */}
                      <td className="py-4 px-4 text-sm text-[#454652] hidden md:table-cell">
                        {lastDate ? formatDate(lastDate) : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <Link
                            href={`/admin/jobs/${job.id}`}
                            className="p-1.5 rounded-lg text-[#454652] hover:text-[#000666] hover:bg-[#e0e0ff] transition"
                            title="Edit job"
                          >
                            <span
                              className="material-symbols-outlined block"
                              style={{ fontSize: 18 }}
                            >
                              edit
                            </span>
                          </Link>

                          {/* Delete */}
                          <form action={deleteJob.bind(null, job.id)}>
                            <button
                              type="submit"
                              className="p-1.5 rounded-lg text-[#454652] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition"
                              title="Delete job"
                            >
                              <span
                                className="material-symbols-outlined block"
                                style={{ fontSize: 18 }}
                              >
                                delete
                              </span>
                            </button>
                          </form>

                          {/* Publish / Unpublish Toggle */}
                          <form action={verifyJob.bind(null, job.id, !job.isVerified)}>
                            <button
                              type="submit"
                              title={job.isVerified ? 'Unpublish job' : 'Publish job'}
                              className="relative inline-flex items-center cursor-pointer ml-1"
                            >
                              <span className="sr-only">
                                {job.isVerified ? 'Unpublish' : 'Publish'}
                              </span>
                              <span
                                className={`w-9 h-5 flex rounded-full transition-colors duration-200 ${
                                  job.isVerified ? 'bg-[#000666]' : 'bg-[#c6c5d4]'
                                }`}
                              >
                                <span
                                  className={`self-center ml-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                    job.isVerified ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </span>
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

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="bg-[#f3f3f3] border-t border-[#c6c5d4] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-[#454652]">
              Showing{' '}
              <span className="font-semibold text-[#1a1c1c]">{rangeStart}</span> to{' '}
              <span className="font-semibold text-[#1a1c1c]">{rangeEnd}</span> of{' '}
              <span className="font-semibold text-[#1a1c1c]">{totalCount}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
              {/* Previous */}
              {page > 1 ? (
                <Link
                  href={buildUrl({ page: page - 1 })}
                  className="h-8 px-3 rounded-lg border border-[#c6c5d4] bg-white hover:bg-[#e8e8e8] text-[#1a1c1c] text-sm font-medium transition"
                >
                  Previous
                </Link>
              ) : (
                <span className="h-8 px-3 rounded-lg border border-[#c6c5d4] bg-[#f3f3f3] text-[#c6c5d4] text-sm font-medium cursor-not-allowed select-none flex items-center">
                  Previous
                </span>
              )}

              {/* Page numbers */}
              {pageNumbers.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="h-8 w-8 flex items-center justify-center text-[#454652] text-sm select-none"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={`page-${item}`}
                    href={buildUrl({ page: item })}
                    className={`h-8 w-8 rounded-lg border text-sm font-medium flex items-center justify-center transition ${
                      item === page
                        ? 'border-[#000666] bg-[#e0e0ff] text-[#343d96]'
                        : 'border-[#c6c5d4] bg-white text-[#1a1c1c] hover:bg-[#e8e8e8]'
                    }`}
                  >
                    {item}
                  </Link>
                )
              )}

              {/* Next */}
              {page < totalPages ? (
                <Link
                  href={buildUrl({ page: page + 1 })}
                  className="h-8 px-3 rounded-lg border border-[#c6c5d4] bg-white hover:bg-[#e8e8e8] text-[#1a1c1c] text-sm font-medium transition"
                >
                  Next
                </Link>
              ) : (
                <span className="h-8 px-3 rounded-lg border border-[#c6c5d4] bg-[#f3f3f3] text-[#c6c5d4] text-sm font-medium cursor-not-allowed select-none flex items-center">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
