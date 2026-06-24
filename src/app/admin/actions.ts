'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Category } from '@prisma/client';
import { slugify } from '@/lib/utils';
import { auth, isAdmin } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session)) {
    throw new Error('Unauthorized');
  }
}


export async function verifyJob(jobId: string, isVerified: boolean) {
  await requireAdmin();
  const job = await prisma.job.update({
    where: { id: jobId },
    data: { 
      isVerified,
      ...(isVerified && { paymentScreenshot: null }) // Delete screenshot upon approval
    },
  });
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/job/${job.slug}`);
}

export async function deleteJob(jobId: string) {
  await requireAdmin();
  try {
    await prisma.job.delete({
      where: { id: jobId },
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      if ((error as { code: string }).code !== 'P2025') {
        throw error;
      }
    } else {
      throw error;
    }
  }
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function saveJob(formData: FormData, jobId?: string) {
  await requireAdmin();
  const title = formData.get('title') as string;
  const organization = formData.get('organization') as string;
  const category = formData.get('category') as Category;
  const sourceUrl = formData.get('sourceUrl') as string;
  const applyUrl = formData.get('applyUrl') as string;
  const description = formData.get('description') as string;
  const syllabusUrl = formData.get('syllabusUrl') as string;
  const totalVacanciesStr = formData.get('totalVacancies') as string;
  const parsedVacancies = parseInt(totalVacanciesStr, 10);
  const totalVacancies = totalVacanciesStr && !isNaN(parsedVacancies) ? parsedVacancies : null;
  const isPrivate = formData.get('isPrivate') === 'on';
  const isVerified = formData.get('isVerified') === 'on';
  
  // Timeline dates
  const applicationStartStr = formData.get('applicationStart') as string;
  const applicationEndStr = formData.get('applicationEnd') as string;
  const examDateStr = formData.get('examDate') as string;
  
  const applicationStart = applicationStartStr ? new Date(applicationStartStr) : null;
  const applicationEnd = applicationEndStr ? new Date(applicationEndStr) : null;
  const examDate = examDateStr ? new Date(examDateStr) : null;

  if (!title?.trim()) {
    throw new Error('Title is required');
  }
  if (!organization?.trim()) {
    throw new Error('Organization is required');
  }
  if (!Object.values(Category).includes(category)) {
    throw new Error('Invalid category');
  }
  if (!sourceUrl?.trim()) {
    throw new Error('Source URL is required');
  }

  try {
    new URL(sourceUrl);
  } catch {
    throw new Error('Invalid source URL format');
  }

  if (applyUrl?.trim()) {
    try {
      new URL(applyUrl);
    } catch {
      throw new Error('Invalid apply URL format');
    }
  }

  if (syllabusUrl?.trim()) {
    try {
      new URL(syllabusUrl);
    } catch {
      throw new Error('Invalid syllabus URL format');
    }
  }

  if (applicationStartStr && isNaN(applicationStart!.getTime())) {
    throw new Error('Invalid application start date');
  }
  if (applicationEndStr && isNaN(applicationEnd!.getTime())) {
    throw new Error('Invalid application end date');
  }
  if (examDateStr && isNaN(examDate!.getTime())) {
    throw new Error('Invalid exam date');
  }

  const data = {
    title,
    organization,
    category,
    sourceUrl,
    applyUrl,
    description,
    syllabusUrl,
    totalVacancies,
    isPrivate,
    isVerified,
  };

  const timelineData = {
    applicationStart,
    applicationEnd,
    examDate,
  };

  let job;

  if (jobId) {
    job = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...data,
        timeline: {
          upsert: {
            create: timelineData,
            update: timelineData,
          }
        }
      },
    });
  } else {
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    job = await prisma.job.create({
      data: {
        ...data,
        slug,
        timeline: {
          create: timelineData,
        }
      },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/job/${job.slug}`);
}
