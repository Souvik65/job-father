import { prisma } from '@/lib/prisma';
import SubscribersClient from './SubscribersClient';

export default async function AdminSubscribersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      mockTestResults: {
        select: {
          score: true,
          max: true,
          date: true,
          subject: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Shape data for the client
  const subscribers = users.map(u => {
    const testsCount = u.mockTestResults.length;
    const bestPct = testsCount > 0
      ? Math.max(...u.mockTestResults.map(r => r.max > 0 ? Math.round((r.score / r.max) * 100) : 0))
      : null;
    const lastActive = testsCount > 0 ? u.mockTestResults[0].date : null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      testsCount,
      bestPct,
      lastActive,
      createdAt: u.createdAt,
    };
  });

  return <SubscribersClient initialSubscribers={subscribers} />;
}

