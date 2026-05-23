import { AdminJobForm } from '@/components/AdminJobForm';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { timeline: true },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs" className="text-slate-500 hover:text-slate-800 font-bold">
          ← Back
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-800">Edit Job: {job.title}</h1>
      </div>
      <AdminJobForm job={job} />
    </div>
  );
}
