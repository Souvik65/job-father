/**
 * POST /api/mock-tests/save
 * Saves a mock test result for the authenticated user.
 * Upserts on (userId, date, subject) — one result per subject per day.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SavePayload {
  date: string;    // "YYYY-MM-DD"
  subject: string; // "math" | "reasoning" | "english" | "gk" | "pyq"
  score: number;
  wrong: number;
  skip: number;
  max: number;
  timeSecs: number;
  mode: string;    // "timed" | "practice"
  plan: string;    // "free" | "premium"
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as Partial<SavePayload>;
    const { date, subject, score, wrong, skip, max, timeSecs, mode } = body;

    if (!date || !subject || score === undefined || max === undefined) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const VALID_SUBJECTS = ['math', 'reasoning', 'english', 'gk', 'pyq'];
    if (!VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: 'Invalid subject.' }, { status: 400 });
    }

    const sVal = Number(score);
    const mVal = Number(max);
    const wVal = Number(wrong ?? 0);
    const kVal = Number(skip ?? 0);

    if (sVal < 0 || mVal < 0 || sVal > mVal || wVal < 0 || kVal < 0) {
      return NextResponse.json({ error: 'Invalid mock test score metrics.' }, { status: 400 });
    }

    // Retrieve and validate active user mock test plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mockTestPlan: true, mockTestPlanExpiry: true }
    });

    const expired = user?.mockTestPlanExpiry != null && user.mockTestPlanExpiry < new Date();
    const derivedPlan = !user || expired ? 'free' : user.mockTestPlan || 'free';

    const result = await prisma.mockTestResult.upsert({
      where: {
        userId_date_subject: {
          userId: session.user.id,
          date,
          subject,
        },
      },
      update: {
        score: sVal,
        wrong: wVal,
        skip: kVal,
        max: mVal,
        timeSecs: timeSecs ?? 0,
        mode: mode ?? 'timed',
        plan: derivedPlan,
      },
      create: {
        userId: session.user.id,
        date,
        subject,
        score: sVal,
        wrong: wVal,
        skip: kVal,
        max: mVal,
        timeSecs: timeSecs ?? 0,
        mode: mode ?? 'timed',
        plan: derivedPlan,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: result.id }, { status: 200 });
  } catch (error) {
    console.error('[/api/mock-tests/save] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
