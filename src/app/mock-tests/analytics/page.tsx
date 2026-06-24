/**
 * src/app/mock-tests/analytics/page.tsx
 * Server Component — reads MockTestResult from DB for the authenticated user.
 * The mock-tests layout already enforces auth, so session is always present here.
 */
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AnalyticsClient from './AnalyticsClient';

export const metadata = {
  title: 'Analytics — Jobfather Mock Tests',
  description: 'Track your mock test performance, accuracy, and weak subjects over time.',
};

const SUBJECTS = [
  { id: 'math',      name: 'Quantitative Aptitude',      short: 'Math',    icon: '📐', color: '#f97316' },
  { id: 'reasoning', name: 'Reasoning Ability', short: 'Reason',  icon: '🧩', color: '#7c3aed' },
  { id: 'english',   name: 'English Language',  short: 'English', icon: '📖', color: '#16a34a' },
  { id: 'gk',        name: 'General Knowledge', short: 'GK',      icon: '🌍', color: '#1a4fd6' },
  { id: 'pyq',       name: 'Previous Year Qs',  short: 'PYQ',     icon: '📋', color: '#dc2626' },
];

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // Fetch last 7 days of results for this user
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const p2 = (n: number) => String(n).padStart(2, '0');
  const dateKey = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const weekStart = dateKey(sevenDaysAgo);

  const weekResults = await prisma.mockTestResult.findMany({
    where: {
      userId,
      date: { gte: weekStart },
    },
    orderBy: { date: 'desc' },
  });

  // All-time history (for premium users)
  const allResults = await prisma.mockTestResult.findMany({
    where: { userId },
    orderBy: [{ date: 'desc' }, { subject: 'asc' }],
  });

  // Plan from User database model directly
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mockTestPlan: true },
  });
  const userPlan = user?.mockTestPlan || 'free';

  // Compute week accuracy per subject
  const accsList = SUBJECTS.map(s => {
    const subjResults = weekResults.filter(r => r.subject === s.id);
    const tot = subjResults.reduce((a, r) => a + r.max, 0);
    const sc = subjResults.reduce((a, r) => a + r.score, 0);
    const pct = tot > 0 ? Math.round((sc / tot) * 100) : 0;
    return { subj: s, pct, tot };
  });

  // Total unique test sessions (per day+subject combo)
  const totalTests = weekResults.length;

  // Overall week accuracy
  const wkTot = weekResults.reduce((a, r) => a + r.max, 0);
  const wkSc = weekResults.reduce((a, r) => a + r.score, 0);
  const weekAccuracy = wkTot > 0 ? Math.round((wkSc / wkTot) * 100) : 0;

  // Best subject this week
  const bestSubj = accsList
    .filter(a => a.tot > 0)
    .sort((a, b) => b.pct - a.pct)[0]?.subj.short ?? null;

  // Weak subject this week (lowest accuracy)
  const weakItem = accsList
    .filter(a => a.tot > 0)
    .sort((a, b) => a.pct - b.pct)[0] ?? null;
  const weakSubjDetails = weakItem ? weakItem.subj : null;

  // Group all results by date for history display
  const historyByDate: Record<string, typeof allResults> = {};
  for (const r of allResults) {
    if (!historyByDate[r.date]) historyByDate[r.date] = [];
    historyByDate[r.date].push(r);
  }

  // Compute date range label for "24 May – 30 May"
  const now = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return dateKey(d);
  });

  return (
    <AnalyticsClient
      accsList={accsList}
      totalTests={totalTests}
      weekAccuracy={weekAccuracy}
      bestSubj={bestSubj}
      weakSubjDetails={weakSubjDetails ? { ...weakSubjDetails, pct: weakItem!.pct } : null}
      historyByDate={historyByDate}
      userPlan={userPlan}
      weekDates={weekDates}
      subjects={SUBJECTS}
    />
  );
}
