'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth, isAdmin } from '@/lib/auth';

export async function deleteStudent(id: string) {
  const session = await auth();
  if (!isAdmin(session)) {
    throw new Error('Unauthorized');
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/admin/students');
}
