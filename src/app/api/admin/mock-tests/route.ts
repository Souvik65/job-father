import { NextResponse } from 'next/server';
import { auth, isAdmin } from '@/lib/auth';
import { SUBJECT_APPSCRIPT_URLS } from '@/lib/constants';

export async function GET(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get('subject');
  const difficulty = searchParams.get('difficulty'); // optional: 'easy' | 'medium' | 'hard'

  if (!subject || !SUBJECT_APPSCRIPT_URLS[subject]) {
    return NextResponse.json({ error: 'Invalid or missing subject' }, { status: 400 });
  }

  const appScriptBase = SUBJECT_APPSCRIPT_URLS[subject];
  if (!appScriptBase) {
    return NextResponse.json({ error: 'Google Apps Script URL not configured for this subject' }, { status: 400 });
  }

  // Append ?sheet=<difficulty> if a specific difficulty tab is requested
  let appScriptUrl = appScriptBase;
  if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
    try {
      const url = new URL(appScriptBase);
      url.searchParams.set('sheet', difficulty);
      appScriptUrl = url.toString();
    } catch {
      // If base URL isn't parseable, use it as-is
    }
  }

  try {
    const res = await fetch(appScriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Apps Script responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return NextResponse.json({ questions: data.questions || [] });
  } catch (error: unknown) {
    console.error('Error fetching from Google Apps Script:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg || 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { subject, question, optionA, optionB, optionC, optionD, correctAnswer, explanation } = body;

  if (!subject || !SUBJECT_APPSCRIPT_URLS[subject]) {
    return NextResponse.json({ error: 'Apps Script URL not configured' }, { status: 400 });
  }
  const appScriptUrl = SUBJECT_APPSCRIPT_URLS[subject];

  try {
    const res = await fetch(appScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'POST',
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation,
      }),
    });

    if (!res.ok) {
      throw new Error(`Apps Script responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { subject, id, question, optionA, optionB, optionC, optionD, correctAnswer, explanation } = body;

  if (!subject || !SUBJECT_APPSCRIPT_URLS[subject]) {
    return NextResponse.json({ error: 'Apps Script URL not configured' }, { status: 400 });
  }
  const appScriptUrl = SUBJECT_APPSCRIPT_URLS[subject];

  try {
    const res = await fetch(appScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'PUT',
        id,
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation,
      }),
    });

    if (!res.ok) {
      throw new Error(`Apps Script responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get('subject');
  const id = parseInt(searchParams.get('id') || '0', 10);

  if (!subject || !SUBJECT_APPSCRIPT_URLS[subject] || !id) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }
  const appScriptUrl = SUBJECT_APPSCRIPT_URLS[subject];

  try {
    const res = await fetch(appScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'DELETE',
        id,
      }),
    });

    if (!res.ok) {
      throw new Error(`Apps Script responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
