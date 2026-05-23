'use server';

import { prisma } from '@/lib/prisma';

export async function subscribeNewsletter(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Invalid email address' };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return { success: true };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
