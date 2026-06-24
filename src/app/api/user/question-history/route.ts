/**
 * GET  /api/user/question-history?subject=math
 *   → Returns the array of seen question fingerprints for the subject
 *
 * POST /api/user/question-history
 *   → Appends newly seen question fingerprints and updates totalSeen count
 *   → Auto-resets the seen list when < 10% of the total pool remains unseen
 *
 * A "fingerprint" is a lightweight hash of the question text (first 80 chars),
 * so we don't need stable IDs on questions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface PostPayload {
  subject: string;         // "math" | "reasoning" | "english" | "gk" | "pyq"
  newHashes: string[];     // fingerprints of questions just shown in this test
  totalPoolSize: number;   // total questions available for this subject right now
}

// Lightweight string fingerprint — first 80 chars, lowercased, whitespace-collapsed
export function fingerprint(qText: string): string {
  return qText.slice(0, 80).toLowerCase().replace(/\s+/g, ' ').trim();
}

const VALID_SUBJECTS = ['math', 'reasoning', 'english', 'gk', 'pyq'];

// ── GET: fetch seen hashes for one subject ──────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subject = new URL(req.url).searchParams.get('subject');
    if (!subject || !VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    }

    const row = await prisma.userQuestionHistory.findUnique({
      where: { userId_subject: { userId: session.user.id, subject } },
      select: { seenHashes: true, totalSeen: true },
    });

    const seenHashes: string[] = row ? JSON.parse(row.seenHashes) : [];
    return NextResponse.json({ seenHashes, totalSeen: row?.totalSeen ?? 0 });
  } catch (err) {
    console.error('[question-history GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: mark questions as seen ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as Partial<PostPayload>;
    const { subject, newHashes, totalPoolSize } = body;

    if (!subject || !VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    }
    if (!Array.isArray(newHashes) || newHashes.length === 0) {
      return NextResponse.json({ ok: true, reset: false }); // nothing to save
    }

    const userId = session.user.id;

    // Fetch existing record
    const existing = await prisma.userQuestionHistory.findUnique({
      where: { userId_subject: { userId, subject } },
    });

    const currentSeen: string[] = existing ? JSON.parse(existing.seenHashes) : [];
    const currentSet = new Set(currentSeen);

    // Merge new hashes
    for (const h of newHashes) {
      currentSet.add(h);
    }

    const merged = Array.from(currentSet);
    const poolSize = totalPoolSize ?? 1500; // safe fallback

    // Auto-reset: if less than 10% of pool remains unseen, wipe the history
    // so the user gets fresh questions next test instead of running dry
    const remainingUnseen = poolSize - merged.length;
    const resetThreshold = Math.max(50, Math.floor(poolSize * 0.1));
    const shouldReset = remainingUnseen < resetThreshold;

    const finalHashes = shouldReset ? [] : merged;
    const newTotalSeen = (existing?.totalSeen ?? 0) + newHashes.length;

    await prisma.userQuestionHistory.upsert({
      where: { userId_subject: { userId, subject } },
      update: {
        seenHashes: JSON.stringify(finalHashes),
        totalSeen: newTotalSeen,
      },
      create: {
        userId,
        subject,
        seenHashes: JSON.stringify(finalHashes),
        totalSeen: newTotalSeen,
      },
    });

    return NextResponse.json({ ok: true, reset: shouldReset, totalSeen: newTotalSeen });
  } catch (err) {
    console.error('[question-history POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
