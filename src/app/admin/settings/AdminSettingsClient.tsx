'use client';

import { useState, useTransition, useMemo } from 'react';
import { changeAdminPassword, saveIdentitySettings, saveFrontendSettings, saveBooksSettings, saveQBSettings } from './actions';

interface Props {
  initialPortalName: string;
  initialSubscriptionPopup: boolean;
  initialPopupDelay: number;
  initialFabEnabled: boolean;
  initialBooksJson: string;
  initialQBJson: string;
}

interface PrepBook {
  id: string | number;
  subj: string;
  name: string;
  author: string;
  desc?: string;
  link: string;
  tag?: string;
}

type Msg = { text: string; ok: boolean } | null;

const defaultFallbackBooks = [
  { id: 'math_default', subj: 'math', name: 'Fast Track Objective Arithmetic', author: 'Rajesh Verma', desc: 'Best for SSC/Banking Maths. Covers all topics with shortcuts.', link: 'https://amazon.in', tag: 'Bestseller' },
  { id: 'reasoning_default', subj: 'reasoning', name: 'Verbal & Non-Verbal Reasoning', author: 'R.S. Aggarwal', desc: 'Complete reasoning with 5000+ questions for all competitive exams.', link: 'https://amazon.in', tag: 'Top Rated' },
  { id: 'english_default', subj: 'english', name: 'Objective General English', author: 'S.P. Bakshi', desc: 'Grammar, comprehension, vocabulary for SSC, IBPS, RRB and more.', link: 'https://amazon.in', tag: 'Popular' },
  { id: 'gk_default', subj: 'gk', name: 'Manorama Yearbook 2026', author: 'Manorama', desc: 'Complete general awareness and current affairs for all govt exams.', link: 'https://amazon.in', tag: 'Must Have' },
  { id: 'pyq_default', subj: 'pyq', name: '25 Years SSC Chapterwise Solved Papers', author: 'Arihant Experts', desc: 'Previous year questions with detailed solutions for SSC CGL/CHSL.', link: 'https://amazon.in', tag: 'Recommended' }
];

export default function AdminSettingsClient({
  initialPortalName,
  initialSubscriptionPopup,
  initialPopupDelay,
  initialFabEnabled,
  initialBooksJson,
  initialQBJson,
}: Props) {
  // ── Password state ─────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<Msg>(null);
  const [passwordPending, startPasswordTransition] = useTransition();

  // ── Identity state ─────────────────────────────────────────────────────
  const [portalName, setPortalName] = useState(initialPortalName);
  const [identityMsg, setIdentityMsg] = useState<Msg>(null);
  const [identityPending, startIdentityTransition] = useTransition();

  // ── Frontend controls state ────────────────────────────────────────────
  const [subscriptionPopup, setSubscriptionPopup] = useState(initialSubscriptionPopup);
  const [popupDelay, setPopupDelay] = useState(initialPopupDelay);
  const [fabEnabled, setFabEnabled] = useState(initialFabEnabled);
  const [frontendMsg, setFrontendMsg] = useState<Msg>(null);
  const [frontendPending, startFrontendTransition] = useTransition();

  // ── Recommended Books Manager state ────────────────────────────────────
  const [booksList, setBooksList] = useState<PrepBook[]>(() => {
    try {
      const parsed = JSON.parse(initialBooksJson);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultFallbackBooks;
    } catch {
      return defaultFallbackBooks;
    }
  });
  const [bookSubj, setBookSubj] = useState('math');
  const [bookName, setBookName] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [bookLink, setBookLink] = useState('');
  const [bookTag, setBookTag] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [booksMsg, setBooksMsg] = useState<Msg>(null);
  const [booksPending, startBooksTransition] = useTransition();

  // ── Question Bank Manager state ────────────────────────────────────────
  const [qbJsonVal, setQbJsonVal] = useState(initialQBJson === 'null' ? '' : initialQBJson);
  const [qbMsg, setQbMsg] = useState<Msg>(null);
  const [qbPending, startQbTransition] = useTransition();

  const qbStats = useMemo(() => {
    try {
      const parsed = JSON.parse(qbJsonVal || '{}');
      const stats: Record<string, number> = {};
      let total = 0;
      for (const [subj, qList] of Object.entries(parsed)) {
        if (Array.isArray(qList)) {
          stats[subj] = qList.length;
          total += qList.length;
        }
      }
      return { stats, total, valid: true };
    } catch {
      return { stats: {}, total: 0, valid: false };
    }
  }, [qbJsonVal]);

  const handleQBFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setQbMsg({ text: "✗ File exceeds 5MB limit.", ok: false });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        JSON.parse(text);
        setQbJsonVal(text);
        setQbMsg({ text: "✓ File loaded successfully! Click 'Save Question Bank' below to publish.", ok: true });
      } catch {
        setQbMsg({ text: "✗ Invalid JSON format in uploaded file.", ok: false });
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadQB = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(qbJsonVal || '{}');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", "mock_test_qb.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyQBTemplate = () => {
    const template = {
      math: [
        { q: "Sample question?", opts: ["Option A", "Option B", "Option C", "Option D"], ans: 0, exp: "Explanation", diff: "easy" }
      ],
      reasoning: [],
      english: [],
      gk: [],
      pyq: []
    };
    navigator.clipboard.writeText(JSON.stringify(template, null, 2))
      .then(() => alert('Question bank JSON template copied to clipboard!'))
      .catch(() => alert('Could not copy template automatically.'));
  };

  function handleQBSave() {
    setQbMsg(null);
    startQbTransition(async () => {
      const result = await saveQBSettings(qbJsonVal || '{}');
      setQbMsg({ text: result.message, ok: result.ok });
    });
  }

  // ── Handlers ───────────────────────────────────────────────────────────

  function handlePasswordUpdate() {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: 'All password fields are required.', ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', ok: false });
      return;
    }
    if (newPassword.length < 12) {
      setPasswordMsg({ text: 'New password must be at least 12 characters.', ok: false });
      return;
    }
    startPasswordTransition(async () => {
      const result = await changeAdminPassword(currentPassword, newPassword);
      setPasswordMsg({ text: result.message, ok: result.ok });
      if (result.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  }

  function handleIdentitySave() {
    setIdentityMsg(null);
    startIdentityTransition(async () => {
      const result = await saveIdentitySettings(portalName);
      setIdentityMsg({ text: result.message, ok: result.ok });
    });
  }

  function handleFrontendApply() {
    setFrontendMsg(null);
    startFrontendTransition(async () => {
      const result = await saveFrontendSettings(subscriptionPopup, popupDelay, fabEnabled);
      setFrontendMsg({ text: result.message, ok: result.ok });
    });
  }

  const handleAddOrUpdateBook = () => {
    if (!bookName.trim() || !bookAuthor.trim() || !bookLink.trim()) {
      alert('Book Name, Author and Purchase Link are required');
      return;
    }
    
    if (editingId !== null) {
      setBooksList(prev => prev.map(b => b.id === editingId ? {
        ...b,
        subj: bookSubj,
        name: bookName.trim(),
        author: bookAuthor.trim(),
        desc: bookDesc.trim(),
        link: bookLink.trim(),
        tag: bookTag.trim() || 'Recommended'
      } : b));
      setEditingId(null);
    } else {
      const newBook = {
        id: 'book_' + Date.now(),
        subj: bookSubj,
        name: bookName.trim(),
        author: bookAuthor.trim(),
        desc: bookDesc.trim(),
        link: bookLink.trim(),
        tag: bookTag.trim() || 'Recommended'
      };
      setBooksList(prev => [...prev, newBook]);
    }
    
    setBookName('');
    setBookAuthor('');
    setBookDesc('');
    setBookLink('');
    setBookTag('');
  };

  const handleEditBookClick = (book: PrepBook) => {
    setEditingId(book.id);
    setBookSubj(book.subj);
    setBookName(book.name);
    setBookAuthor(book.author);
    setBookDesc(book.desc || '');
    setBookLink(book.link);
    setBookTag(book.tag || '');
  };

  const handleRemoveBook = (id: string | number) => {
    if (confirm('Are you sure you want to remove this prep book?')) {
      setBooksList(prev => prev.filter(b => b.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setBookName('');
        setBookAuthor('');
        setBookDesc('');
        setBookLink('');
        setBookTag('');
      }
    }
  };

  function handleBooksSave() {
    setBooksMsg(null);
    startBooksTransition(async () => {
      const result = await saveBooksSettings(JSON.stringify(booksList));
      setBooksMsg({ text: result.message, ok: result.ok });
    });
  }

  // ── Input class helper ─────────────────────────────────────────────────
  const inputClass =
    'w-full bg-[#f9f9f9] border border-[#c6c5d4] rounded-md px-3 py-2 text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-colors';

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1a1c1c] tracking-tight">Settings Configuration</h2>
        <p className="text-sm text-[#454652] mt-1">
          Manage parameters, security credentials, and portal interface controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-8 flex flex-col gap-6">

          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">lock</span>
                Account Security
              </h3>
              <p className="text-sm text-[#454652] mt-1">Update administrator authentication credentials.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="current_password">
                  Current Password
                </label>
                <input
                  id="current_password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="new_password">
                  New Password
                </label>
                <input
                  id="new_password"
                  type="password"
                  placeholder="Create new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <p className="text-[11px] text-[#767683] mt-1">
                  Must be at least 12 characters and include complexity requirements.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="confirm_password">
                  Confirm New Password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  placeholder="Verify new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              {passwordMsg && (
                <p className={`text-sm font-medium ${passwordMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMsg.ok ? '✓' : '✗'} {passwordMsg.text}
                </p>
              )}

              <div className="flex justify-end mt-2">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={passwordPending}
                  className="bg-[#000666] text-white text-xs font-bold uppercase tracking-wider rounded-md px-6 py-2.5 hover:bg-[#1a237e] transition-colors shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {passwordPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Update Password
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">badge</span>
                Platform Identity
              </h3>
              <p className="text-sm text-[#454652] mt-1">Manage public-facing portal branding and nomenclature.</p>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="site_name">
                  Official Portal Name
                </label>
                <input
                  id="site_name"
                  type="text"
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  className={inputClass}
                />
              </div>

              {identityMsg && (
                <p className={`text-sm font-medium ${identityMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {identityMsg.ok ? '✓' : '✗'} {identityMsg.text}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleIdentitySave}
                  disabled={identityPending}
                  className="bg-[#000666] text-white text-xs font-bold uppercase tracking-wider rounded-md px-6 py-2.5 hover:bg-[#1a237e] transition-colors shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {identityPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Identity
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">auto_stories</span>
                Recommended Prep Books Manager
              </h3>
              <p className="text-sm text-[#454652] mt-1">Add, update, or remove exam preparation books and links.</p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[#fcfcfd] border border-[#e8e8f2] rounded-lg p-4 flex flex-col gap-4">
                <h4 className="text-xs font-extrabold text-[#000666] uppercase tracking-wider">
                  {editingId !== null ? '⚡ Edit Selected Book' : '➕ Add Recommended Book'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">
                      Subject Category
                    </label>
                    <select
                      value={bookSubj}
                      onChange={(e) => setBookSubj(e.target.value)}
                      className={inputClass}
                    >
                      <option value="math">📐 Mathematics (Math)</option>
                      <option value="reasoning">🧩 Reasoning Ability (Reason)</option>
                      <option value="english">📖 English Language (English)</option>
                      <option value="gk">🌍 General Knowledge (GK)</option>
                      <option value="pyq">📋 Previous Year Qs (PYQ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">
                      Display Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bestseller"
                      value={bookTag}
                      onChange={(e) => setBookTag(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">
                      Book Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter book title"
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">
                      Author *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter author name"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">
                    Amazon Purchase Link *
                    </label>
                  <input
                    type="url"
                    placeholder="https://amazon.in/..."
                    value={bookLink}
                    onChange={(e) => setBookLink(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1">
                    Short Description
                  </label>
                  <textarea
                    placeholder="Brief description about the book content..."
                    value={bookDesc}
                    onChange={(e) => setBookDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f9f9f9] border border-[#c6c5d4] rounded-md px-3 py-2 text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editingId !== null && (
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setBookName('');
                        setBookAuthor('');
                        setBookDesc('');
                        setBookLink('');
                        setBookTag('');
                      }}
                      className="border border-[#767683] text-[#1a1c1c] text-xs font-bold uppercase tracking-wider rounded-md px-4 py-2 hover:bg-[#eeeeee] transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    onClick={handleAddOrUpdateBook}
                    className="bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold uppercase tracking-wider rounded-md px-5 py-2 transition-all flex items-center gap-1.5"
                  >
                    {editingId !== null ? 'Update Book' : 'Add to List'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <span className="block text-xs font-extrabold text-[#454652] uppercase tracking-wider">
                  📚 Configured Prep Books List ({booksList.length})
                </span>
                
                {booksList.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-400 font-semibold bg-slate-50 border border-dashed rounded-lg">
                    No books configured. Click `&quot;`Add`&quot;` to configure prep books.
                  </div>
                ) : (
                  <div className="max-h-[350px] overflow-y-auto border border-[#c6c5d4] rounded-lg divide-y divide-[#c6c5d4] bg-white">
                    {booksList.map((book) => (
                      <div key={book.id} className="p-3 flex items-start justify-between gap-4 hover:bg-[#fbfbfd] transition-colors">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider">
                              {book.subj}
                            </span>
                            {book.tag && (
                              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[8.5px] font-extrabold border border-green-200">
                                {book.tag}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-extrabold text-slate-800 truncate" title={book.name}>
                            {book.name}
                          </span>
                          <span className="text-[10.5px] font-semibold text-slate-400">
                            by {book.author}
                          </span>
                          <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-0.5">
                            {book.desc}
                          </p>
                          <a
                            href={book.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 font-black hover:underline truncate mt-0.5"
                          >
                            🔗 Buy Link: {book.link}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleEditBookClick(book)}
                            className="w-7 h-7 rounded border border-slate-200 text-slate-500 hover:text-[#000666] hover:bg-slate-100 flex items-center justify-center transition-colors"
                            title="Edit Book Details"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleRemoveBook(book.id)}
                            className="w-7 h-7 rounded border border-slate-200 text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                            title="Remove Book"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {booksMsg && (
                <p className={`text-sm font-medium ${booksMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {booksMsg.ok ? '✓' : '✗'} {booksMsg.text}
                </p>
              )}

              <div className="flex justify-end pt-4 border-t border-[#e8e8e8]">
                <button
                  onClick={handleBooksSave}
                  disabled={booksPending}
                  className="bg-[#000666] text-white text-xs font-bold uppercase tracking-wider rounded-md px-6 py-2.5 hover:bg-[#1a237e] transition-colors shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {booksPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Recommended Books
                </button>
              </div>
            </div>
          </section>

          {/* Mock Test Question Bank JSON Manager */}
          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">upload_file</span>
                Mock Test Question Bank JSON Manager
              </h3>
              <p className="text-sm text-[#454652] mt-1">Upload, validate, or export the active mock test questions pool.</p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Stats / active summary */}
              <div className="bg-[#fcfcfd] border border-[#e8e8f2] rounded-lg p-4 flex flex-col gap-3">
                <span className="text-xs font-extrabold text-[#000666] uppercase tracking-wider">
                  📊 Active Question Bank Status
                </span>
                {qbStats.valid ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-1 text-center">
                    {['math', 'reasoning', 'english', 'gk', 'pyq'].map((subj) => {
                      const count = qbStats.stats[subj] || 0;
                      return (
                        <div key={subj} className="bg-white border rounded-lg p-2.5 flex flex-col gap-0.5">
                          <span className="text-[9px] font-black uppercase text-slate-400">{subj}</span>
                          <span className="text-sm font-extrabold text-slate-800">{count} Qs</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 flex items-center gap-1.5">
                    ⚠️ Invalid Question Bank format or missing data. Loading default fallback pool.
                  </div>
                )}
                {qbStats.valid && (
                  <div className="text-[11px] font-semibold text-slate-500 flex justify-between items-center mt-1 border-t border-slate-100 pt-2 px-1">
                    <span>Total Database Questions: <strong className="text-slate-800">{qbStats.total}</strong></span>
                    <span className="text-green-600 font-extrabold flex items-center gap-0.5">✓ Dynamic Pool Active</span>
                  </div>
                )}
              </div>

              {/* Uploader Box */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider">
                  Upload Question Bank JSON File
                </label>
                <div className="border-2 border-dashed border-[#c6c5d4] bg-[#f9f9f9] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[#eeeeee] transition-colors relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleQBFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="material-symbols-outlined text-[#767683] text-3xl mb-1.5">upload_file</span>
                  <span className="text-xs font-semibold text-[#000666] mb-0.5">Click to choose JSON file</span>
                  <span className="text-[10px] text-[#767683]">MCQ Question Bank JSON (Max 5MB)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap text-xs">
                <button
                  onClick={handleCopyQBTemplate}
                  className="border border-[#767683] text-[#1a1c1c] font-semibold rounded-md px-4 py-2 hover:bg-[#eeeeee] transition-colors"
                >
                  📋 Copy JSON Template
                </button>
                {qbJsonVal && (
                  <button
                    onClick={handleDownloadQB}
                    className="border border-[#767683] text-[#1a1c1c] font-semibold rounded-md px-4 py-2 hover:bg-[#eeeeee] transition-colors"
                  >
                    📥 Download/Export JSON
                  </button>
                )}
              </div>

              {qbMsg && (
                <p className={`text-sm font-medium ${qbMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {qbMsg.ok ? '✓' : '✗'} {qbMsg.text}
                </p>
              )}

              <div className="flex justify-end pt-4 border-t border-[#e8e8e8]">
                <button
                  onClick={handleQBSave}
                  disabled={qbPending || !qbJsonVal}
                  className="bg-[#000666] text-white text-xs font-bold uppercase tracking-wider rounded-md px-6 py-2.5 hover:bg-[#1a237e] transition-colors shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {qbPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Question Bank
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white border border-[#c6c5d4] rounded-xl p-6">
            <div className="border-b border-[#c6c5d4] pb-3 mb-6">
              <h3 className="text-lg font-semibold text-[#000666] flex items-center gap-2">
                Frontend Controls
              </h3>
              <p className="text-sm text-[#454652] mt-1">Adjust user interface behaviors.</p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Email Subscription Toggle */}
              <div className="flex flex-col gap-3 pb-5 border-b border-[#e8e8e8]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#1a1c1c]">Email Subscription Pop-up</div>
                    <div className="text-[11px] text-[#767683]">Display newsletter popup to site visitors.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={subscriptionPopup}
                      onChange={(e) => setSubscriptionPopup(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c5d4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454652] uppercase tracking-wider mb-1" htmlFor="popup_delay">
                    Pop-up Delay (Seconds)
                  </label>
                  <input
                    id="popup_delay"
                    type="number"
                    min={1}
                    max={300}
                    value={popupDelay}
                    onChange={(e) => setPopupDelay(Number(e.target.value))}
                    className="w-full max-w-[120px] bg-[#f9f9f9] border border-[#c6c5d4] rounded-md px-3 py-2 text-sm text-[#1a1c1c] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Floating Action Button Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#1a1c1c]">Floating Action Button (FAB)</div>
                  <div className="text-[11px] text-[#767683]">Show global &lsquo;Post a Job&rsquo; button.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={fabEnabled}
                    onChange={(e) => setFabEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c6c5d4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]"></div>
                </label>
              </div>

              {frontendMsg && (
                <p className={`text-sm font-medium ${frontendMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {frontendMsg.ok ? '✓' : '✗'} {frontendMsg.text}
                </p>
              )}

              <div className="flex justify-end pt-2 mt-2 border-t border-[#e8e8e8]">
                <button
                  onClick={handleFrontendApply}
                  disabled={frontendPending}
                  className="border border-[#767683] text-[#1a1c1c] text-xs font-semibold rounded-md px-5 py-2 hover:bg-[#eeeeee] transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {frontendPending && (
                    <span className="w-3.5 h-3.5 border-2 border-[#1a1c1c] border-t-transparent rounded-full animate-spin" />
                  )}
                  Apply Changes
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
