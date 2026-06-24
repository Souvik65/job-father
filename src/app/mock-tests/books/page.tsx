'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ShoppingCart, Loader2 } from 'lucide-react';

const SUBJECTS = [
  { id: 'math', name: 'Quantitative Aptitude', short: 'Math', icon: '📐', color: '#f97316' },
  { id: 'reasoning', name: 'Reasoning Ability', short: 'Reason', icon: '🧩', color: '#7c3aed' },
  { id: 'english', name: 'English Language', short: 'English', icon: '📖', color: '#16a34a' },
  { id: 'gk', name: 'General Knowledge', short: 'GK', icon: '🌍', color: '#1a4fd6' },
  { id: 'pyq', name: 'Previous Year Qs', short: 'PYQ', icon: '📋', color: '#dc2626' }
];

interface PrepBook {
  id: string | number;
  subj: string;
  name: string;
  author: string;
  desc?: string;
  link: string;
  tag?: string;
}

export default function BooksPage() {
  const [booksList, setBooksList] = useState<PrepBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.books) {
          setBooksList(data.books);
        }
      })
      .catch(err => console.error("Error fetching recommended books:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px] gap-2.5">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Loading Prep Books...
        </span>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2 w-full">
          Recommended Prep Books <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {booksList.map((book) => {
          const subj = SUBJECTS.find(s => s.id === book.subj);
          return (
            <div key={book.id} className="bg-white dark:bg-[#111d2e] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500 transition-colors flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="bg-slate-100 dark:bg-slate-900 px-3 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  {subj ? `${subj.icon} ${subj.short}` : 'General'}
                </span>
                <span className="text-[9.5px] font-extrabold text-green-500 bg-green-500/10 px-2.5 py-0.5 rounded border border-green-500/15">
                  {book.tag}
                </span>
              </div>
              <div>
                <span className="block font-black text-sm text-slate-800 dark:text-white leading-tight">
                  {book.name}
                </span>
                <span className="block text-xs font-semibold text-slate-400 mt-1">
                  by {book.author}
                </span>
                <p className="text-[11.5px] font-medium text-slate-500 leading-relaxed mt-2">
                  {book.desc}
                </p>
              </div>
              <a
                href={book.link}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0d1b2a] hover:bg-slate-800 text-white text-[13px] font-black tracking-wider uppercase px-4 py-2.5 rounded-lg text-center shadow-md transition-colors mt-auto flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-4.5 h-4.5" /> Buy on Amazon <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
