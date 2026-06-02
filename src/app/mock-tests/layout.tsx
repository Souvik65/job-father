import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MockTestLayoutClient } from '@/components/MockTestLayoutClient';
import { SessionProvider } from 'next-auth/react';

export const metadata = {
  title: 'Mock Tests — Jobfather Govt Exam Prep',
  description: 'Practice interactive mock tests for competitive government exams with real-time analytics, timed quizzes, and full answers review.',
};

export default async function MockTestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/mock-tests');
  }

  return (
    <SessionProvider session={session}>
      <MockTestLayoutClient>
        {children}
      </MockTestLayoutClient>
    </SessionProvider>
  );
}
