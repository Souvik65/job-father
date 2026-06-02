'use client';

import { ChartSpline } from "lucide-react";

// Force rebuild to fix module factory cache issue

interface SubjectInfo {
  id: string;
  name: string;
  short: string;
  icon: string;
  color: string;
}

interface AccsItem {
  subj: SubjectInfo;
  pct: number;
  tot: number;
}

interface ResultRecord {
  id: string;
  userId: string;
  date: string;
  subject: string;
  score: number;
  wrong: number;
  skip: number;
  max: number;
  timeSecs: number;
  mode: string;
  plan: string;
  createdAt: Date;
}

interface Props {
  accsList: AccsItem[];
  totalTests: number;
  weekAccuracy: number;
  bestSubj: string | null;
  weakSubjDetails: (SubjectInfo & { pct: number }) | null;
  historyByDate: Record<string, ResultRecord[]>;
  userPlan: string;
  weekDates: string[];
  subjects: SubjectInfo[];
}

export default function AnalyticsClient({
  accsList,
  totalTests,
  weekAccuracy,
  bestSubj,
  weakSubjDetails,
  historyByDate,
  userPlan,
  weekDates,
  subjects,
}: Props) {
  const historyDays = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));

  const weekLabel = weekDates.length > 0
    ? `${new Date(weekDates[0]).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${new Date(weekDates[weekDates.length - 1]).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
    : 'Last 7 Days';

  return (
    <div className="animate-fadeUp flex flex-col gap-8 max-w-5xl mx-auto w-full p-4 sm:p-8">

      {/* SECTION: PERFORMANCE ANALYTICS */}
      <div className="flex flex-col gap-4">
        <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          PERFORMANCE ANALYTICS
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#111d2e] rounded-2xl p-6 text-center shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-1">
            <div className="font-black text-[28px] text-orange-500 leading-none">
              {totalTests}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              TOTAL TESTS
            </div>
          </div>
          <div className="bg-white dark:bg-[#111d2e] rounded-2xl p-6 text-center shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-1">
            <div className="font-black text-[28px] text-green-600 dark:text-green-500 leading-none">
              {weekAccuracy}%
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              WEEK ACC.
            </div>
          </div>
          <div className="bg-white dark:bg-[#111d2e] rounded-2xl p-6 text-center shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-1">
            <div className="font-black text-[28px] text-blue-700 dark:text-blue-500 leading-none truncate w-full px-2">
              {bestSubj || '—'}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              BEST SUBJ.
            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT PERFORMANCE */}
      <div className="bg-white dark:bg-[#111d2e] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Dark Header */}
        <div className="bg-[#0d1b2a] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartSpline color="white" />
            <span className="text-[11px] font-bold tracking-[0.15em] text-white uppercase">
              SUBJECT PERFORMANCE
            </span>
          </div>
          <span className="text-[11px] font-bold text-orange-500">{weekLabel}</span>
        </div>

        {/* Subjects List */}
        <div className="p-6 flex flex-col gap-4">
          {accsList.map(item => (
            <div key={item.subj.id} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-[13px] font-extrabold text-[#0d1b2a] dark:text-white flex items-center gap-2">
                <span className="text-base opacity-90">{item.subj.icon}</span> {item.subj.short}
              </span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                {item.tot > 0 && (
                  <div
                    style={{ width: `${item.pct}%`, backgroundColor: item.subj.color }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                )}
              </div>
              <span className="w-10 shrink-0 text-right text-[12px] font-bold text-[#0d1b2a] dark:text-white">
                {item.tot > 0 ? `${item.pct}%` : '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Weak Subject Diagnosis inside the box */}
        <div className="px-6 pb-6 pt-2">
          <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">
            WEAK SUBJECT DETECTION
          </span>
          {weakSubjDetails ? (
            <div className="flex flex-col gap-3">
              <div className="bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20 rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest w-fit shadow-sm">
                ⚠️ WEAK: {weakSubjDetails.name.toUpperCase()} ({weakSubjDetails.pct}%)
              </div>
              <p className="text-[13px] font-bold text-[#0d1b2a] dark:text-white">
                Focus on {weakSubjDetails.name} —{' '}
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  try Practice Mode for deeper concept clarity.
                </span>
              </p>
            </div>
          ) : (
            <p className="text-[13px] font-semibold text-slate-400">
              Complete at least one mock test to unlock subject diagnostic metrics.
            </p>
          )}
        </div>
      </div>

      {/* SECTION: TEST HISTORY */}
      <div className="flex flex-col gap-4">
        <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          TEST HISTORY
        </span>

        {userPlan === 'free' || userPlan === '3m' ? (
          <div className="bg-[#0d1b2a] rounded-3xl p-10 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">History Requires Pro +</h2>
              <p className="text-sm font-medium text-slate-400 mb-8 max-w-sm">
                Track full test history, weak subject trends and score improvement over time.
              </p>
              <a
                href="/mock-tests/upgrade"
                className="bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] font-black tracking-[0.15em] uppercase px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-95"
              >
                UPGRADE To Pro+
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {!historyDays.length ? (
              <div className="bg-white dark:bg-[#111d2e] p-8 text-center text-sm font-bold text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                No attempt records found. Start your first quiz!
              </div>
            ) : (
              historyDays.map(day => {
                const records = historyByDate[day];
                const tot = records.reduce((a, r) => a + r.score, 0);
                const mx = records.reduce((a, r) => a + r.max, 0);

                return (
                  <div key={day} className="bg-white dark:bg-[#111d2e] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[12px] font-extrabold tracking-widest text-[#0d1b2a] dark:text-white uppercase">
                        📅 {new Date(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-[12px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full">
                        Score: {tot}/{mx}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50 p-2">
                      {subjects.map(s => {
                        const r = records.find(rec => rec.subject === s.id);
                        if (!r) return null;
                        const pct = Math.round((r.score / r.max) * 100);
                        return (
                          <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4">
                            <span className="text-[13px] font-extrabold text-[#0d1b2a] dark:text-white flex items-center gap-2">
                              <span className="opacity-90">{s.icon}</span> {s.name}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${pct >= 80 ? 'bg-green-500/10 text-green-600 dark:text-green-500' : pct >= 60 ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}>
                              {r.score}/{r.max} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
