import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await prisma.siteSettings.findUnique({
      where: { key: 'mock_test_qb' }
    });
    if (row && row.value) {
      return NextResponse.json({ qb: JSON.parse(row.value) });
    }
  } catch (error) {
    console.error("Error fetching mock test question bank:", error);
  }
  return NextResponse.json({ qb: null });
}
