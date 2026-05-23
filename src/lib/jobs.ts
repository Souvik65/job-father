import { prisma } from '@/lib/prisma';
import { Job } from '@/types/job';
import { Category, Prisma } from '@prisma/client';

export async function getJobs(filters?: { category?: string; search?: string }): Promise<Job[]> {
  const where: Prisma.JobWhereInput = {
    isVerified: true,
  };

  if (filters?.category && filters.category !== 'ALL') {
    // Validate category is a valid enum value
    if (Object.values(Category).includes(filters.category as Category)) {
      where.category = filters.category as Category;
    } else {
      // If invalid category and not 'ALL', return empty results
      return [];
    }
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      timeline: true,
    },
    orderBy: {
      postedAt: 'desc',
    },
  });
  return jobs;
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const job = await prisma.job.findFirst({
    where: {
      slug,
      isVerified: true,
    },
    include: {
      timeline: true,
    },
  });
  return job;
}

export function getCategories(): string[] {
  const categories = Object.values(Category);
  return categories;
}

