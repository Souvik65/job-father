'use client';

import { useState, useTransition } from 'react';
import { deleteSubscriber, bulkDeleteSubscribers } from './actions';
import { Toast } from '@/components/Toast';

type Subscriber = {
  id: string;
  email: string;
  createdAt: string | Date;
};

interface Props {
  initialSubscribers: Subscriber[];
}

export default function SubscribersClient({ initialSubscribers }: Props) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const itemsPerPage = 10;

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; action: () => void }>({
    isOpen: false,
    message: '',
    action: () => { },
  });

  const filtered = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this subscriber?',
      action: () => {
        startTransition(async () => {
          const result = await deleteSubscriber(id);
          if (result.error) { showNotification(result.error); return; }
          setSubscribers(prev => prev.filter(s => s.id !== id));
          setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
          showNotification('Subscriber deleted successfully.');
        });
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setConfirmDialog({
      isOpen: true,
      message: `Are you sure you want to delete ${count} subscriber${count > 1 ? 's' : ''}?`,
      action: () => {
        startTransition(async () => {
          const result = await bulkDeleteSubscribers(Array.from(selectedIds));
          if (result.error) { showNotification(result.error); return; }
          setSubscribers(prev => prev.filter(s => !selectedIds.has(s.id)));
          setSelectedIds(new Set());
          showNotification(`${count} subscriber(s) deleted successfully.`);
        });
      },
    });
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const escape = (f: string) => (f.includes(',') || f.includes('"') || f.includes('\n')) ? `"${f.replace(/"/g, '""')}"` : f;
    const headers = ['Email Address', 'Subscribed At'];
    const rows = filtered.map(s => [
      escape(s.email),
      escape(new Date(s.createdAt).toISOString()),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#000666] mb-1">Email Subscribers</h1>
        <p className="text-sm text-[#454652]">Users who subscribed to the newsletter via the popup.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-[#c6c5d4] rounded-xl mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#454652] text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 border border-[#c6c5d4] rounded-lg bg-[#f9f9f9] focus:outline-none focus:border-[#000666] focus:ring-1 focus:ring-[#000666] text-sm text-[#1a1c1c] transition-shadow"
              placeholder="Search by email..."
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); setSelectedIds(new Set()); }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0 || isPending}
            className="flex items-center gap-2 px-4 py-2 border border-[#ba1a1a] text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6] transition-colors text-xs font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span className="hidden sm:inline">Delete Selected {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#e8e8e8] text-[#1a1c1c] rounded-lg hover:bg-[#e2e2e2] border border-[#c6c5d4] transition-colors text-xs font-semibold uppercase tracking-wider shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#c6c5d4] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#f3f3f3] border-b border-[#c6c5d4]">
              <tr>
                <th className="p-4 w-14 text-center">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#c6c5d4] text-[#000666] focus:ring-[#000666] cursor-pointer"
                  />
                </th>
                <th className="p-4 text-xs font-semibold text-[#454652] uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-semibold text-[#454652] uppercase tracking-wider">Subscribed Date</th>
                <th className="p-4 text-xs font-semibold text-[#454652] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c5d4]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#454652]">No users found.</td>
                </tr>
              ) : (
                paginated.map(sub => (
                  <tr key={sub.id} className="hover:bg-[#f3f3f3] transition-colors group">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.id)}
                        onChange={() => toggleSelect(sub.id)}
                        className="w-4 h-4 rounded border-[#c6c5d4] text-[#000666] focus:ring-[#000666] cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-sm text-[#1a1c1c] font-medium">{sub.email}</td>
                    <td className="p-4 text-sm text-[#454652]">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={isPending}
                        className="text-[#454652] hover:text-[#ba1a1a] transition-colors p-1.5 rounded-full hover:bg-[#ffdad6]/50 disabled:opacity-50"
                        title="Delete Subscriber"
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
        <div className="bg-white px-4 py-3 border-t border-[#c6c5d4] flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm text-[#454652]">
              Showing <span className="font-semibold text-[#1a1c1c]">{filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-[#1a1c1c]">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of{' '}
              <span className="font-semibold text-[#1a1c1c]">{filtered.length}</span> subscribers
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end gap-2">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setSelectedIds(new Set()); }}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-[#c6c5d4] text-xs font-semibold uppercase tracking-wider rounded-md text-[#454652] bg-[#f9f9f9] hover:bg-[#eeeeee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setSelectedIds(new Set()); }}
              disabled={currentPage === totalPages || totalPages === 0}
              className="relative inline-flex items-center px-4 py-2 border border-[#c6c5d4] text-xs font-semibold uppercase tracking-wider rounded-md text-[#454652] bg-[#f9f9f9] hover:bg-[#eeeeee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 text-[#ba1a1a] mb-4">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <h3 className="font-semibold text-lg text-[#1a1c1c]">Confirm Deletion</h3>
              </div>
              <p className="text-[#454652] text-sm mb-6 leading-relaxed">{confirmDialog.message} This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-sm font-semibold text-[#454652] hover:bg-[#f3f3f3] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { confirmDialog.action(); setConfirmDialog(prev => ({ ...prev, isOpen: false })); }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#ba1a1a] hover:bg-[#93000a] rounded-lg transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMessage} show={showToast} onHide={() => setShowToast(false)} />
    </div>
  );
}
