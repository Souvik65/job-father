import { NextResponse } from 'next/server';
import { auth, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SUBJECT_APPSCRIPT_URLS } from '@/lib/constants';

interface SheetQuestion {
  question?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
}

const DIFFICULTY_TABS = ['easy', 'medium', 'hard'] as const;
type DifficultyTab = typeof DIFFICULTY_TABS[number];

/** Build an Apps Script URL with an optional ?sheet=<tab> query param */
function buildAppsScriptUrl(base: string, sheet?: string): string {
  if (!sheet) return base;
  const url = new URL(base);
  url.searchParams.set('sheet', sheet);
  return url.toString();
}

/** Fetch and map questions from a single Apps Script URL for a given difficulty */
async function fetchTabQuestions(
  appScriptUrl: string,
  diff: DifficultyTab | 'all'
): Promise<{ q: string; opts: string[]; ans: number; exp: string; diff: string }[]> {
  const res = await fetch(appScriptUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Apps Script responded with status ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const sheetQuestions: SheetQuestion[] = data.questions || [];
  return sheetQuestions.map((q) => {
    const opts = [
      String(q.optionA || '').trim(),
      String(q.optionB || '').trim(),
      String(q.optionC || '').trim(),
      String(q.optionD || '').trim(),
    ].filter(Boolean);

    let ansIdx = 0;
    const ansStr = String(q.correctAnswer || '').trim().toLowerCase();
    if (ansStr === 'a' || ansStr === 'optiona') ansIdx = 0;
    else if (ansStr === 'b' || ansStr === 'optionb') ansIdx = 1;
    else if (ansStr === 'c' || ansStr === 'optionc') ansIdx = 2;
    else if (ansStr === 'd' || ansStr === 'optiond') ansIdx = 3;
    else {
      const matched = opts.findIndex(opt => opt.toLowerCase() === ansStr);
      if (matched !== -1) ansIdx = matched;
    }

    return {
      q: q.question || '',
      opts,
      ans: ansIdx,
      exp: q.explanation || '',
      diff: diff === 'all' ? 'medium' : diff,
    };
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subject, difficulty = 'all' } = body as { subject: string; difficulty?: string };

    if (!subject || !SUBJECT_APPSCRIPT_URLS[subject]) {
      return NextResponse.json({ error: 'Invalid or missing subject' }, { status: 400 });
    }

    const appScriptBase = SUBJECT_APPSCRIPT_URLS[subject];
    if (!appScriptBase) {
      return NextResponse.json({ error: 'Apps Script URL not configured for this subject' }, { status: 400 });
    }

    let webQuestions: ReturnType<typeof fetchTabQuestions> extends Promise<infer T> ? T : never = [];

    if (difficulty === 'all') {
      // Fetch from all three difficulty tabs concurrently
      const tabResults = await Promise.allSettled(
        DIFFICULTY_TABS.map(tab =>
          fetchTabQuestions(buildAppsScriptUrl(appScriptBase, tab), tab)
        )
      );

      for (const result of tabResults) {
        if (result.status === 'fulfilled') {
          webQuestions = [...webQuestions, ...result.value];
        }
      }

      // If no tab-based questions were returned, fall back to default (no sheet param)
      if (webQuestions.length === 0) {
        webQuestions = await fetchTabQuestions(appScriptBase, 'all');
      }
    } else if (DIFFICULTY_TABS.includes(difficulty as DifficultyTab)) {
      // Fetch from a specific tab
      const tabUrl = buildAppsScriptUrl(appScriptBase, difficulty);
      webQuestions = await fetchTabQuestions(tabUrl, difficulty as DifficultyTab);
    } else {
      return NextResponse.json({ error: 'Invalid difficulty value. Use: all, easy, medium, or hard' }, { status: 400 });
    }

    // Fetch current QB from database SiteSettings
    const row = await prisma.siteSettings.findUnique({
      where: { key: 'mock_test_qb' },
    });

    let currentQB: Record<string, unknown[]> = {};
    if (row && row.value) {
      try {
        currentQB = JSON.parse(row.value);
      } catch (e) {
        console.error('Error parsing current mock_test_qb, starting fresh:', e);
      }
    }

    // Overwrite/merge questions for the subject (lowercase key)
    const dbSubjKey = subject.toLowerCase();
    if (difficulty === 'all') {
      // Full replace for 'all'
      currentQB[dbSubjKey] = webQuestions;
    } else {
      // Partial update: replace only the questions for the selected difficulty
      const existingForSubject = (currentQB[dbSubjKey] as typeof webQuestions) || [];
      const otherDiffQuestions = existingForSubject.filter(
        (q): q is { q: string; opts: string[]; ans: number; exp: string; diff: string } =>
          typeof q === 'object' && q !== null && 'diff' in q && (q as { diff: string }).diff !== difficulty
      );
      currentQB[dbSubjKey] = [...otherDiffQuestions, ...webQuestions];
    }

    // Save back to database
    await prisma.siteSettings.upsert({
      where: { key: 'mock_test_qb' },
      create: { key: 'mock_test_qb', value: JSON.stringify(currentQB) },
      update: { value: JSON.stringify(currentQB) },
    });

    return NextResponse.json({
      success: true,
      count: webQuestions.length,
      difficulty,
      subject,
    });
  } catch (error: unknown) {
    console.error('Publishing error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

