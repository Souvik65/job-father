'use client';

import { useState, useMemo } from 'react';
import { formatDate } from '@/lib/utils';
import { deleteStudent } from './actions';

type Student = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string | Date;
  mockTestPlan: string;
  mockTestsTaken: number;
  mockTestAvgScore: number;
};

interface Props {
  initialStudents: Student[];
}

export default function StudentsClient({ initialStudents }: Props) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter students
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchName = s.name?.toLowerCase().includes(q) || false;
      return matchEmail || matchName;
    });
  }, [students, searchQuery]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const displayed = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to page 1
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, email: string) => {
    setDeleteConfirm({ id, email });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setIsDeleting(true);

    try {
      // Server action
      await deleteStudent(id);
      // Actual UI update
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Plan', 'Tests Taken', 'Avg Score', 'Registered Date'];
    const rows = filtered.map((s) => [
      `"${s.name || ''}"`,
      `"${s.email}"`,
      `"${s.mockTestPlan}"`,
      s.mockTestsTaken.toString(),
      s.mockTestAvgScore.toString(),
      `"${formatDate(s.createdAt)}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'jobfather_students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#c6c5d4] rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Action Bar */}
      <div className="p-4 sm:p-5 border-b border-[#c6c5d4] bg-[#f3f3f3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a6] pointer-events-none" style={{ fontSize: 20 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#c6c5d4] rounded-lg text-sm text-[#1a1c1c] placeholder:text-[#8e90a6] focus:outline-none focus:ring-2 focus:ring-[#000666]/20 focus:border-[#000666] transition-all"
          />
        </div>

        {/* Stats & Export */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          <div className="text-sm text-[#454652] font-medium whitespace-nowrap">
            <span className="text-[#000666] font-bold">{filtered.length}</span> total
          </div>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c6c5d4] rounded-lg text-sm font-semibold text-[#343d96] hover:bg-[#e0e0ff] disabled:opacity-50 disabled:cursor-not-allowed transition touch-target"
            title="Export filtered list to CSV"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#eeeeee] text-[#454652] text-[11px] uppercase tracking-wider font-bold border-b border-[#c6c5d4]">
            <tr>
              <th className="py-3 px-4 sm:px-6">Student</th>
              <th className="py-3 px-4">Plan Details</th>
              <th className="py-3 px-4 text-center">Tests Taken</th>
              <th className="py-3 px-4 text-center">Avg Score</th>
              <th className="py-3 px-4">Registered</th>
              <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#e2e8f0]">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-6 text-center text-[#8e90a6]">
                  {searchQuery ? 'No students match your search.' : 'No students found.'}
                </td>
              </tr>
            ) : (
              displayed.map((student) => (
                <tr key={student.id} className="hover:bg-[#f8fafc] transition-colors group">
                  <td className="py-3 px-4 sm:px-6">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[#1a1c1c] font-semibold truncate">{student.name || 'Unknown'}</span>
                      <span className="text-[#454652] text-xs truncate">{student.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      student.mockTestPlan === 'pro_plus' ? 'bg-purple-100 text-purple-700' :
                      student.mockTestPlan === 'pro' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {student.mockTestPlan.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-[#1a1c1c] font-bold">
                    {student.mockTestsTaken}
                  </td>
                  <td className="py-3 px-4 text-center text-[#1a1c1c] font-bold">
                    {student.mockTestAvgScore}%
                  </td>
                  <td className="py-3 px-4 text-[#454652] text-xs whitespace-nowrap">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right">
                    <button
                      onClick={() => handleDeleteClick(student.id, student.email)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors inline-flex group-hover:opacity-100 focus:opacity-100 touch-target"
                      title="Delete Student"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[#c6c5d4] bg-[#f8fafc] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#454652] font-medium order-2 sm:order-1">
            Page <span className="font-bold text-[#1a1c1c]">{currentPage}</span> of <span className="font-bold text-[#1a1c1c]">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-[#c6c5d4] rounded text-sm font-semibold text-[#1a1c1c] hover:bg-[#f1f5f9] disabled:opacity-50 disabled:cursor-not-allowed transition touch-target"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-[#c6c5d4] rounded text-sm font-semibold text-[#1a1c1c] hover:bg-[#f1f5f9] disabled:opacity-50 disabled:cursor-not-allowed transition touch-target"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {deleteConfirm && (
        <div 
          onClick={() => !isDeleting && setDeleteConfirm(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#c6c5d4] dark:border-slate-800 max-w-md w-full p-6 relative flex flex-col gap-4 animate-scale-in"
          >
            {/* Header / Warning Icon */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                {isDeleting ? (
                  <div className="w-6 h-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-rose-500 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#000666] dark:text-blue-400">
                  {isDeleting ? 'Deleting Account...' : 'Delete Student Account'}
                </h3>
                <p className="text-xs text-[#8e90a6] dark:text-slate-400 font-medium">
                  {isDeleting ? 'Please wait while removing database entry' : 'This action is permanent and cannot be undone'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="text-sm text-[#454652] dark:text-slate-300 leading-relaxed bg-[#f8fafc] dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              Are you sure you want to delete the student profile for <span className="font-bold text-[#1a1c1c] dark:text-slate-100">{deleteConfirm.email}</span>? They will lose access to all premium mock tests.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#c6c5d4] dark:border-slate-700 rounded-xl text-[#454652] dark:text-slate-350 hover:bg-[#e8e8e8] dark:hover:bg-slate-800 text-sm font-semibold transition touch-target disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 rounded-xl text-white text-sm font-bold shadow-sm shadow-rose-200 dark:shadow-none transition flex items-center gap-2 touch-target disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Student</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
