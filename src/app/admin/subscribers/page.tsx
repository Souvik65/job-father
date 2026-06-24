import { prisma } from '@/lib/prisma';
import SubscribersClient from './SubscribersClient';

export default async function AdminSubscribersPage() {
  const subscribersData = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  const subscribers = subscribersData.map(s => ({
    id: s.id,
    email: s.email,
    createdAt: s.createdAt,
  }));

  return <SubscribersClient initialSubscribers={subscribers} />;
}

