import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ─── GET /api/watchlist ───────────────────────────────────────────────────────
// Returns the authenticated user's watchlist with full job + timeline data.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const [watches, total] = await Promise.all([
      prisma.examWatch.findMany({
        where: { userId: session.user.id },
        include: {
          job: {
            include: { timeline: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.examWatch.count({ where: { userId: session.user.id } })
    ]);

    return NextResponse.json({ 
      data: watches.map((w) => w.job),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

// ─── POST /api/watchlist ──────────────────────────────────────────────────────
// Adds a job to the user's watchlist. Body: { jobId: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const jobId = typeof body?.jobId === 'string' ? body.jobId.trim() : null;

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  try {
    // Verify the job exists
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    let watch = await prisma.examWatch.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId } },
      select: { id: true, jobId: true, createdAt: true },
    });
    
    let statusCode = 200;

    if (!watch) {
      watch = await prisma.examWatch.create({
        data: { userId: session.user.id, jobId },
        select: { id: true, jobId: true, createdAt: true },
      });
      statusCode = 201;
    }

    return NextResponse.json({ data: watch }, { status: statusCode });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}

// ─── DELETE /api/watchlist ────────────────────────────────────────────────────
// Removes a job from the user's watchlist. Body: { jobId: string }
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const jobId = typeof body?.jobId === 'string' ? body.jobId.trim() : null;

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  try {
    // deleteMany to avoid throwing if record doesn't exist
    await prisma.examWatch.deleteMany({
      where: { userId: session.user.id, jobId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
}
