import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ plan: 'free' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { mockTestPlan: true, mockTestPlanExpiry: true },
    });

    const expired = user?.mockTestPlanExpiry != null && user.mockTestPlanExpiry < new Date();
    const plan = !user || expired ? 'free' : user.mockTestPlan || 'free';

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ plan: 'free' });
  }
}
