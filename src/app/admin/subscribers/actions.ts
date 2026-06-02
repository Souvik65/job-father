'use server';

import { prisma } from '@/lib/prisma';
import { auth, isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session)) throw new Error('Unauthorized');
}

// Keep old newsletter subscriber actions for backward compatibility
export async function deleteSubscriber(id: string) {
  await requireAdmin();
  try {
    await prisma.newsletterSubscriber.delete({ where: { id } });
    revalidatePath('/admin/subscribers');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete newsletter subscriber:', error);
    return { error: 'Failed to delete subscriber' };
  }
}

export async function bulkDeleteSubscribers(ids: string[]) {
  await requireAdmin();
  try {
    await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/admin/subscribers');
    return { success: true };
  } catch (error) {
    console.error('Failed to bulk delete newsletter subscribers:', error);
    return { error: 'Failed to bulk delete subscribers' };
  }
}

// New user-based actions for the subscribers page
export async function deleteUserSubscriber(userId: string) {
  await requireAdmin();
  try {
    // Prevent admins from deleting themselves
    const session = await auth();
    if (session?.user?.id === userId) {
      return { error: 'You cannot delete your own admin account.' };
    }
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin/subscribers');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { error: 'Failed to delete user' };
  }
}

export async function bulkDeleteUserSubscribers(userIds: string[]) {
  await requireAdmin();
  try {
    const session = await auth();
    const filteredIds = userIds.filter(id => id !== session?.user?.id);
    const skippedSelf = userIds.length !== filteredIds.length;
    await prisma.user.deleteMany({ where: { id: { in: filteredIds } } });
    revalidatePath('/admin/subscribers');
    return { success: true, deletedCount: filteredIds.length, skippedSelf };
  } catch (error) {
    console.error('Failed to bulk delete users:', error);
    return { error: 'Failed to bulk delete users' };
  }
}
