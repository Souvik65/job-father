'use client';

interface SubjectRecord {
  score: number;
  wrong: number;
  skip: number;
  max: number;
  time: number;
}

type DayRecord = Record<string, SubjectRecord>;
type DbState = Record<string, DayRecord>;

const SUBJECTS = [
  { id: 'math', name: 'Mathematics', short: 'Math', icon: '📐', color: '#f97316' },
  { id: 'reasoning', name: 'Reasoning Ability', short: 'Reason', icon: '🧩', color: '#7c3aed' },
  { id: 'english', name: 'English Language', short: 'English', icon: '📖', color: '#16a34a' },
  { id: 'gk', name: 'General Knowledge', short: 'GK', icon: '🌍', color: '#1a4fd6' },
  { id: 'pyq', name: 'Previous Year Qs', short: 'PYQ', icon: '📋', color: '#dc2626' }
];

const BOOKS = [
  { id: 1, subj: 'math', name: 'Fast Track Objective Arithmetic', author: 'Rajesh Verma', desc: 'Best for SSC/Banking Maths. Covers all topics with shortcuts.', link: 'https://amazon.in', tag: 'Bestseller' },
  { id: 2, subj: 'reasoning', name: 'Verbal & Non-Verbal Reasoning', author: 'R.S. Aggarwal', desc: 'Complete reasoning with 5000+ questions for all competitive exams.', link: 'https://amazon.in', tag: 'Top Rated' },
  { id: 3, subj: 'english', name: 'Objective General English', author: 'S.P. Bakshi', desc: 'Grammar, comprehension, vocabulary for SSC, IBPS, RRB and more.', link: 'https://amazon.in', tag: 'Popular' },
  { id: 4, subj: 'gk', name: 'Manorama Yearbook 2026', author: 'Manorama', desc: 'Complete general awareness and current affairs for all govt exams.', link: 'https://amazon.in', tag: 'Must Have' },
  { id: 5, subj: 'pyq', name: '25 Years SSC Chapterwise Solved Papers', author: 'Arihant Experts', desc: 'Previous year questions with detailed solutions for SSC CGL/CHSL.', link: 'https://amazon.in', tag: 'Recommended' }
];

const QUOTES = [
  { q: 'Success is not final, failure is not fatal \u2014 it is the courage to continue that counts.', a: 'Winston Churchill' },
  { q: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
  { q: "Don't watch the clock; do what it does. Keep going.", a: 'Sam Levenson' },
  { q: "You don't have to be great to start, but you have to start to be great.", a: 'Zig Ziglar' },
  { q: 'The expert in anything was once a beginner.', a: 'Helen Hayes' },
  { q: "It always seems impossible until it's done.", a: 'Nelson Mandela' },
  { q: 'Believe in yourself and all that you are.', a: 'Christian D. Larson' },
  { q: "Hard work beats talent when talent doesn't work hard.", a: 'Tim Notke' }
];


import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Activity, CheckCircle2, Flame, Target } from 'lucide-react';
import Link from 'next/link';

interface PrepBook {
  id: string | number;
  subj: string;
  name: string;
  author: string;
  desc?: string;
  link: string;
  tag?: string;
}

export default function MockTestsDashboardPage() {
  const { data: session } = useSession();
  const [dbState, setDbState] = useState<DbState>({});
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [streak, setStreak] = useState<number>(0);
  const [booksList, setBooksList] = useState<PrepBook[]>(BOOKS);
  const [recommendation, setRecommendation] = useState<{
    weakSubjectId: string | null;
    weakSubjectName: string | null;
    recommendedBook: PrepBook | null;
    accuracy: number | null;
    reason: string;
  } | null>(null);
  const [roadmap, setRoadmap] = useState<{
    id: number;
    title: string;
    ph: string;
    stat: string;
    status: 'done' | 'active' | 'locked';
    prog?: number;
  }[]>([]);

  const [examName, setExamName] = useState('SSC CGL');
  const [examDate, setExamDate] = useState('2026-12-15');
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [tempExamName, setTempExamName] = useState('SSC CGL');
  const [tempExamDate, setTempExamDate] = useState('2026-12-15');
  const [customExamName, setCustomExamName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('user_target_exam_name');
    const savedDate = localStorage.getItem('user_target_exam_date');
    
    const timer = setTimeout(() => {
      if (savedName) {
        setExamName(savedName);
        if (['SSC CGL', 'UPSC CSE', 'IBPS PO', 'RRB NTPC'].includes(savedName)) {
          setTempExamName(savedName);
        } else {
          setTempExamName('Other / Custom');
          setCustomExamName(savedName);
        }
      }
      if (savedDate) {
        setExamDate(savedDate);
        setTempExamDate(savedDate);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSaveExam = () => {
    const finalName = tempExamName === 'Other / Custom' ? (customExamName || 'My Target Exam') : tempExamName;
    setExamName(finalName);
    setExamDate(tempExamDate);
    localStorage.setItem('user_target_exam_name', finalName);
    localStorage.setItem('user_target_exam_date', tempExamDate);
    setIsEditingExam(false);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = () => {
      if (session?.user?.id) {
        const p2 = (n: number) => String(n).padStart(2, '0');
        const today = `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}-${p2(new Date().getDate())}`;
        fetch(`/api/user/mock-test-stats?clientDate=${today}`, { signal: controller.signal })
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              setDbState(data.db || {});
              setUserPlan(data.plan || 'free');
              setStreak(data.streak || 0);
              if (data.roadmap) setRoadmap(data.roadmap);
            }
          })
          .catch(err => {
            if (err.name !== 'AbortError') console.error(err);
          });
      }
    };

    fetchStats();

    fetch('/api/books', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data.books) setBooksList(data.books);
        if (data.recommendation) setRecommendation(data.recommendation);
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    window.addEventListener("stats-updated", fetchStats);
    return () => {
      window.removeEventListener("stats-updated", fetchStats);
      controller.abort();
    };
  }, [session]);

  const p2 = (n: number) => String(n).padStart(2, '0');
  const dateKey = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const todayKey = () => dateKey(new Date());

  const getWeekDays = () => {
    const r: string[] = [];
    const t = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(t);
      d.setDate(d.getDate() - i);
      r.push(dateKey(d));
    }
    return r;
  };

  const weekDays = getWeekDays();

  let weekMaxTotal = 0, weekScoreTotal = 0;
  weekDays.forEach(d => {
    if (dbState[d]) {
      SUBJECTS.forEach(s => {
        if (dbState[d][s.id]) {
          weekScoreTotal += dbState[d][s.id].score;
          weekMaxTotal += dbState[d][s.id].max;
        }
      });
    }
  });

  const weekAccuracy = weekMaxTotal > 0 ? Math.round((weekScoreTotal / weekMaxTotal) * 100) : 0;
  const todayRecords = dbState[todayKey()] || {};
  let todayDone = 0;
  let todayScore = 0;
  SUBJECTS.forEach(s => { 
    if (todayRecords[s.id]) {
      todayDone++;
      todayScore += todayRecords[s.id].score;
    }
  });

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <div className="animate-fadeUp flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2 w-full">
          Weekly Performance <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </span>
      </div>

      {/* Score Tracker Graph Card */}
      <div className="bg-white dark:bg-[#111d2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="bg-linear-to-r from-[#0d1b2a] to-[#1a2e45] px-4 py-3 flex items-center justify-between gap-4 border-b border-orange-500">
          <span className="text-[10px] font-black tracking-wider text-white uppercase flex items-center gap-1.5">
            📊 Score Tracker — Last 7 Days
          </span>
          <span className="text-[10px] font-black text-orange-400">
            Jobfather Analytics
          </span>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none text-slate-800 dark:text-white">
                {weekScoreTotal}
              </div>
              <div className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">
                Total score this week
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-orange-500 leading-none">
                {weekAccuracy}%
              </div>
              <div className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">
                Avg Accuracy
              </div>
            </div>
          </div>

          {/* SVG/CSS Bar Graph */}
          <div className="flex items-end gap-3 h-22.5 border-b border-slate-100 dark:border-slate-800 pb-2 pt-4">
            {weekDays.map(d => {
              let score = 0;
              if (dbState[d]) {
                SUBJECTS.forEach(s => {
                  if (dbState[d][s.id]) score += dbState[d][s.id].score;
                });
              }
              const isToday = d === todayKey();
              const maxVal = Math.max(...weekDays.map(day => {
                let s = 0;
                if (dbState[day]) {
                  SUBJECTS.forEach(sub => {
                    if (dbState[day][sub.id]) s += dbState[day][sub.id].score;
                  });
                }
                return s;
              }), 1);

              const h = Math.max(4, Math.round((score / maxVal) * 60));
              const dateObj = new Date(d + 'T00:00:00');
              const names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[8px] font-bold text-slate-400">{score > 0 ? score : ''}</span>
                  <div
                    style={{ height: `${h}px` }}
                    className={`w-full rounded-t ${score === 0 ? 'bg-slate-100 dark:bg-slate-800' : isToday ? 'bg-slate-800 dark:bg-slate-200' : 'bg-linear-to-t from-orange-500 to-amber-400'}`}
                  />
                  <span className={`text-[9px] font-black ${isToday ? 'text-orange-500' : 'text-slate-400'}`}>
                    {names[dateObj.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exam Countdown Widget */}
      <div className="bg-linear-to-br from-[#0d1b2a] to-[#1e3a5f] rounded-2xl p-4.5 border border-orange-500/20 flex flex-col gap-4 shadow-sm overflow-hidden relative">
        <div className="absolute -right-6 -top-6 w-27.5 h-27.5 rounded-full bg-orange-500/5 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="block text-[8px] font-black text-white/40 tracking-wider uppercase mb-0.5">{examName} Target Countdown</span>
            <span className="block font-black text-2xl sm:text-3xl text-orange-500 leading-none">
              {Math.max(0, Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / 86400000))} Days
            </span>
            <span className="block text-[9.5px] font-bold text-white/40 mt-1">Remaining until target examination date</span>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500/15 border border-orange-500/30 text-orange-500 rounded-full px-3 py-1 text-[10px] font-black tracking-wide uppercase">
                {weekAccuracy >= 80 ? 'Exam Ready ✓' : weekAccuracy >= 60 ? 'Almost Ready' : weekAccuracy > 0 ? 'Needs Work' : 'Start Practicing'}
              </div>
              <button
                onClick={() => setIsEditingExam(!isEditingExam)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-1 text-[10px] font-bold transition-all cursor-pointer"
              >
                {isEditingExam ? 'Close' : 'Select Exam'}
              </button>
            </div>
            <div className="h-2 w-30 bg-white/10 rounded-full overflow-hidden mt-1 self-start sm:self-auto">
              <div style={{ width: `${weekAccuracy}%` }} className="h-full bg-linear-to-r from-orange-500 to-amber-400 transition-all duration-300" />
            </div>
          </div>
        </div>

        {isEditingExam && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row items-end gap-3 transition-all relative z-10">
            <div className="flex-1 w-full">
              <label className="block text-[9px] font-black text-white/60 tracking-wider uppercase mb-1">Target Exam Name</label>
              <select
                value={tempExamName}
                onChange={(e) => setTempExamName(e.target.value)}
                className="w-full bg-[#111d2e] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-orange-500"
              >
                <option value="SSC CGL">SSC CGL</option>
                <option value="UPSC CSE">UPSC CSE</option>
                <option value="IBPS PO">IBPS PO</option>
                <option value="RRB NTPC">RRB NTPC</option>
                <option value="Other / Custom">Other / Custom</option>
              </select>
            </div>
            {tempExamName === 'Other / Custom' && (
              <div className="flex-1 w-full">
                <label className="block text-[9px] font-black text-white/60 tracking-wider uppercase mb-1">Custom Exam Name</label>
                <input
                  type="text"
                  placeholder="Enter exam name..."
                  value={customExamName}
                  onChange={(e) => setCustomExamName(e.target.value)}
                  className="w-full bg-[#111d2e] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-orange-500"
                />
              </div>
            )}
            <div className="flex-1 w-full">
              <label className="block text-[9px] font-black text-white/60 tracking-wider uppercase mb-1">Target Exam Date</label>
              <input
                type="date"
                value={tempExamDate}
                onChange={(e) => setTempExamDate(e.target.value)}
                className="w-full bg-[#111d2e] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <button
              onClick={handleSaveExam}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-1.5 text-xs font-black tracking-wide uppercase transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Save Exam
            </button>
          </div>
        )}
      </div>

      {/* Today at a Glance */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2 w-full">
          Today at a Glance <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#111d2e] rounded-xl p-4 text-center border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.75 after:bg-orange-500">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500 mx-auto mb-2 flex items-center justify-center">
            <Activity size={17} strokeWidth={2.2} />
          </div>
          <div className="font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white leading-none">{todayScore}</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1.5">Today Score</div>
        </div>
        <div className="bg-white dark:bg-[#111d2e] rounded-xl p-4 text-center border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.75 after:bg-green-500">
          <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-500 mx-auto mb-2 flex items-center justify-center">
            <CheckCircle2 size={17} strokeWidth={2.2} />
          </div>
          <div className="font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white leading-none">{todayDone}</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1.5">Tests Done</div>
        </div>
        <div className="bg-white dark:bg-[#111d2e] rounded-xl p-4 text-center border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.75 after:bg-purple-500">
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500 mx-auto mb-2 flex items-center justify-center">
            <Flame size={17} strokeWidth={2.2} />
          </div>
          <div className="font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white leading-none">{streak}</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1.5">Day Streak</div>
        </div>
        <div className="bg-white dark:bg-[#111d2e] rounded-xl p-4 text-center border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.75 after:bg-blue-500">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 mx-auto mb-2 flex items-center justify-center">
            <Target size={17} strokeWidth={2.2} />
          </div>
          <div className="font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white leading-none">{weekAccuracy}%</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1.5">Accuracy</div>
        </div>
      </div>

      {/* Daily Goal Widgets */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2 w-full">
          Daily Goals <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-white dark:bg-[#111d2e] rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tests Today</span>
            <span>📋</span>
          </div>
          <div className="font-extrabold text-2xl text-slate-800 dark:text-white leading-none">
            {todayDone}<span className="text-sm font-bold text-slate-400 ml-1">/5</span>
          </div>
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1.5 mb-2.5">Complete 5 subject tests</div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div style={{ width: `${(todayDone / 5) * 100}%` }} className="h-full bg-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111d2e] rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy Goal</span>
            <span>🎯</span>
          </div>
          <div className="font-extrabold text-2xl text-slate-800 dark:text-white leading-none">
            {weekAccuracy}%
          </div>
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1.5 mb-2.5">Target: 70% accuracy</div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div style={{ width: `${Math.min(100, (weekAccuracy / 70) * 100)}%` }} className="h-full bg-green-500" />
          </div>
        </div>
      </div>

      {/* Motivational Quote Card */}
      <div className="bg-linear-to-br from-orange-500/5 to-orange-500/0 rounded-2xl p-4 border border-orange-500/12 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 text-lg">
          💡
        </div>
        <div>
          <span className="block text-xs font-semibold italic text-slate-700 dark:text-slate-300 leading-relaxed">
            &ldquo;{quote.q}&rdquo;
          </span>
          <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">— {quote.a}</span>
        </div>
      </div>

      {/* Subject Roadmap */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2 w-full">
          Subject Roadmap <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 select-none">
        {(roadmap.length > 0 ? roadmap : [
          { id: 1, title: 'Beginner', ph: 'Phase 1', stat: '0%', status: 'active', prog: 0 },
          { id: 2, title: 'Foundation', ph: 'Phase 2', stat: 'Locked', status: 'locked' },
          { id: 3, title: 'Intermediate', ph: 'Phase 3', stat: 'Locked', status: 'locked' },
          { id: 4, title: 'Advanced', ph: 'Phase 4', stat: 'Locked', status: 'locked' },
          { id: 5, title: 'Expert', ph: 'Phase 5', stat: 'Locked', status: 'locked' },
          { id: 6, title: 'Final Revision', ph: 'Phase 6', stat: 'Locked', status: 'locked' }
        ]).map(rm => (
          <div key={rm.id} className={`relative shrink-0 min-w-32.5 p-3 rounded-[10px] border bg-white dark:bg-[#111d2e] shadow-sm overflow-hidden flex flex-col
            ${rm.status === 'done' ? 'border-green-500' : rm.status === 'active' ? 'border-orange-500' : 'border-slate-200 dark:border-slate-800 opacity-60'}`}>
            <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{rm.ph}</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-white">{rm.title}</span>
            <span className={`text-[9.5px] font-extrabold mt-2 ${rm.status === 'done' ? 'text-green-500' : rm.status === 'active' ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
              {rm.stat}
            </span>
            {rm.status === 'active' && rm.prog !== undefined && (
              <div className="absolute bottom-0 left-0 h-0.75 bg-orange-500 transition-all duration-300" style={{ width: `${rm.prog}%` }} />
            )}
          </div>
        ))}
      </div>

      {/* Subjects Quick Navigation */}
      <div>
        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2 w-full mb-3">
          Quick Start Test <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {SUBJECTS.map(s => {
            const records = dbState[todayKey()] || {};
            const done = !!records[s.id];
            const score = done ? records[s.id].score : 0;
            const max = done ? records[s.id].max : 0;
            const pct = max > 0 ? Math.round((score / max) * 100) : 0;

            return (
              <Link
                key={s.id}
                href={`/mock-tests/start-test?subject=${s.id}`}
                className={`bg-white dark:bg-[#111d2e] rounded-xl p-3.5 border ${done ? 'border-green-500/40 animate-fadeUp' : 'border-slate-200 dark:border-slate-800'} hover:border-orange-500 dark:hover:border-orange-500 hover:-translate-y-0.5 hover:shadow-md cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden min-h-[140px] justify-between`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/40 flex items-center justify-center text-xl shrink-0 transition-all group-hover:scale-105 duration-200 shadow-sm">
                    {s.icon}
                  </div>
                  <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${done ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {done ? 'Completed' : 'Start'}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-end mt-1">
                  <span className="block font-black text-xs sm:text-[13px] text-slate-800 dark:text-white leading-tight mb-1">
                    {s.name}
                  </span>
                  <span className="block text-[9.5px] font-bold text-slate-400">
                    {done ? `${score}/${max} (${pct}%)` : `${userPlan !== 'free' ? 10 : 3} Questions`}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                  <div style={{ width: `${pct}%` }} className={`h-full ${done ? 'bg-green-500' : 'bg-linear-to-r from-orange-500 to-amber-400'}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Weak subject or performance-based book recommendation card */}
      {recommendation?.recommendedBook && (
        <div className="bg-white dark:bg-[#111d2e] rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
          <div>
            <div className={`rounded-full px-3 py-0.5 text-[8.5px] font-black uppercase tracking-wider w-fit mb-2 ${
              recommendation.weakSubjectId 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-orange-500/10 text-orange-500'
            }`}>
              {recommendation.weakSubjectId 
                ? `⚠️ Weak Subject: ${recommendation.weakSubjectName}` 
                : '💡 Recommended Prep Book'}
            </div>
            <span className="block font-black text-[15px] text-slate-800 dark:text-white leading-tight">
              {recommendation.recommendedBook.name}
            </span>
            <span className="block text-xs font-semibold text-slate-400 mt-1 leading-normal">
              by {recommendation.recommendedBook.author} • {recommendation.recommendedBook.desc || recommendation.reason}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={recommendation.recommendedBook.link}
              target="_blank"
              rel="noreferrer"
              className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-[10px] font-extrabold tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              🛒 Buy Amazon
            </a>
            {recommendation.recommendedBook.tag && (
              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
                {recommendation.recommendedBook.tag}
              </span>
            )}
          </div>
        </div>
      )}

      {userPlan === 'free' && (
        <div className="bg-[#0d1b2a] rounded-2xl p-5 border border-orange-500/25 text-center mt-3 select-none">
          <span className="block font-black text-base text-white mb-1">Upgrade to Premium Plan</span>
          <span className="block text-[11.5px] font-bold text-white/60 leading-relaxed mb-4">
            Get 10 questions per subject, complete question bank pools, weak subject diagnostics, and full test history dashboards.
          </span>
          <a
            href="/mock-tests/upgrade"
            className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-[10px] font-black tracking-widest uppercase px-6 py-2.5 rounded-lg transition-transform w-fit mx-auto inline-block"
          >
            Explore Premium Plans
          </a>
        </div>
      )}

      {/* Notice Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 p-3 rounded-xl mt-2 select-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span className="text-[10px] font-bold leading-relaxed">Jobfather is not affiliated with any government body. Always verify information from official sources before applying.</span>
      </div>
    </div>
  );
}
