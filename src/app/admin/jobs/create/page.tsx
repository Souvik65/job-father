import { AdminJobForm } from '@/components/AdminJobForm';
import Link from 'next/link';

export default function CreateJobPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs" className="text-slate-500 hover:text-slate-800 font-bold">
          ← Back
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-800">Create New Job</h1>
      </div>
      <AdminJobForm />
    </div>
  );
}
