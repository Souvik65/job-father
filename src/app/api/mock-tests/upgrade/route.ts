import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const planId = formData.get('planId') as string | null;

    if (!file || !planId) {
      return NextResponse.json({ error: 'Missing file or planId' }, { status: 400 });
    }

    // Server-side size validation (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Server-side type validation
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPG, JPEG, and WEBP formats are supported' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop() || 'png';
    const mimeType = file.type || `image/${fileExt}`;
    const base64Data = buffer.toString('base64');
    const screenshotUrl = `data:${mimeType};base64,${base64Data}`;

    // Update or create UpgradeRequest in DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing pending requests for this plan
    const existing = await prisma.upgradeRequest.findFirst({
      where: {
        userId: user.id,
        planId: planId,
        status: 'PENDING',
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a pending upgrade request for this plan. Please wait for admin approval.' },
        { status: 400 }
      );
    }

    const upgradeRequest = await prisma.upgradeRequest.create({
      data: {
        userId: user.id,
        planId: planId,
        screenshotUrl: screenshotUrl,
      },
    });

    return NextResponse.json({ success: true, request: upgradeRequest });
  } catch (error) {
    console.error('Error processing upgrade request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
