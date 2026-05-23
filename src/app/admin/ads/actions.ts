'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AdType, AdPosition } from '@prisma/client';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'ADMIN') throw new Error('Unauthorized');
}

export async function toggleAdStatus(adId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.ad.update({ where: { id: adId }, data: { isActive } });
  revalidatePath('/admin/ads');
}

export async function deleteAd(adId: string) {
  await requireAdmin();
  await prisma.ad.delete({ where: { id: adId } });
  revalidatePath('/admin/ads');
}

export async function saveAd(formData: FormData, adId?: string) {
  await requireAdmin();

  const label = formData.get('label') as string;
  if (!label || label.trim() === '') {
    throw new Error('Label is required');
  }

  const type = formData.get('type') as AdType;
  const position = formData.get('position') as AdPosition;

  if (!Object.values(AdType).includes(type)) {
    throw new Error(`Invalid ad type: ${type}`);
  }
  if (!Object.values(AdPosition).includes(position)) {
    throw new Error(`Invalid ad position: ${position}`);
  }

  const targetUrl = (formData.get('targetUrl') as string) || null;
  const imageUrl = (formData.get('imageUrl') as string) || null;
  const notes = (formData.get('notes') as string) || null;
  const isActive = formData.get('isActive') === 'on';

  const data = { label, type, position, targetUrl, imageUrl, notes, isActive };

  if (adId) {
    await prisma.ad.update({ where: { id: adId }, data });
  } else {
    await prisma.ad.create({ data });
  }

  revalidatePath('/admin/ads');
}
