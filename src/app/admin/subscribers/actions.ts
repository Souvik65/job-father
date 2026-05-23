'use server';

import { prisma } from '@/lib/prisma';
import { auth, isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session)) throw new Error('Unauthorized');
}

export async function deleteSubscriber(id: string) {
  await requireAdmin();
  
  try {
    await prisma.newsletterSubscriber.delete({
      where: { id }
    });
    revalidatePath('/admin/subscribers');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete subscriber:', error);
    return { error: 'Failed to delete subscriber' };
  }
}

export async function bulkDeleteSubscribers(ids: string[]) {
  await requireAdmin();
  
  try {
    await prisma.newsletterSubscriber.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    revalidatePath('/admin/subscribers');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete subscribers:', error);
    return { error: 'Failed to bulk delete subscribers' };
  }
}
