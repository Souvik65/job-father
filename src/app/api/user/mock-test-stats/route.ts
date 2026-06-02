import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user to get current plan and validate expiry
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mockTestPlan: true, mockTestPlanExpiry: true },
    });

    const expired = user?.mockTestPlanExpiry != null && user.mockTestPlanExpiry < new Date();
    const plan = !user || expired ? 'free' : user.mockTestPlan || 'free';

    // 2. Fetch all mock test results for this user
    const results = await prisma.mockTestResult.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'asc' },
    });

    // 3. Reconstruct the dbState dictionary
    // { [date]: { [subject]: { score, wrong, skip, max, time } } }
    const db: Record<string, Record<string, { score: number; wrong: number; skip: number; max: number; time: number; }>> = {};
    results.forEach((r) => {
      if (!db[r.date]) {
        db[r.date] = {};
      }
      db[r.date][r.subject] = {
        score: r.score,
        wrong: r.wrong,
        skip: r.skip,
        max: r.max,
        time: r.createdAt.getTime(), // we use createdAt timestamp to mimic local storage 'time' field
      };
    });

    const { searchParams } = new URL(req.url);
    const clientDateStr = searchParams.get('clientDate');

    // 4. Calculate streak
    let streak = 0;
    let now = new Date();
    if (clientDateStr && /^\d{4}-\d{2}-\d{2}$/.test(clientDateStr)) {
      const [y, m, d] = clientDateStr.split('-').map(Number);
      now = new Date(y, m - 1, d);
    }
    const p2 = (n: number) => String(n).padStart(2, '0');
    const dateKey = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
    
    // We only track math, reasoning, english, gk, pyq
    const validSubjects = ['math', 'reasoning', 'english', 'gk', 'pyq'];

    for (let i = 0; i < 90; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = dateKey(d);
      
      const dayRecord = db[k];
      if (dayRecord && validSubjects.some((s) => dayRecord[s])) {
        streak++;
      } else if (i > 0) {
        // Break only if we miss yesterday or earlier (i.e. i > 0)
        // If today is missed (i=0), the streak shouldn't break, they still have time today
        break;
      }
    }

    const { getSubjectRoadmap } = await import('@/lib/services/subjectRoadmapService');
    const roadmap = await getSubjectRoadmap(session.user.id);

    return NextResponse.json({
      db,
      streak,
      plan,
      roadmap,
    });
  } catch (error) {
    console.error('[/api/user/mock-test-stats] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
