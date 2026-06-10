import type { Metadata } from 'next';
import { getJobs, getJobBySlug } from '@/lib/jobs';
import { jobUrl, buildShareText } from '@/lib/utils';
import { getSiteSettings } from '@/lib/settings';
import { JobDetailPage } from '@/components/JobDetailPage';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AdPosition } from '@prisma/client';

interface JobPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = true;

// Generate static params for all jobs
export async function generateStaticParams() {
  const jobs = await getJobs();
  return jobs.map((job) => ({
    slug: job.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Job Not Found | Jobfather',
      description: 'The job you are looking for does not exist.',
    };
  }

  const shareText = buildShareText(job);

  return {
    title: `${job.title} | Jobfather`,
    description: job.description || `Apply for ${job.title} on Jobfather`,
    openGraph: {
      title: job.title,
      description: job.description || `Apply for ${job.title}`,
      type: 'website',
      url: jobUrl(job),
    },
    twitter: {
      card: 'summary',
      title: job.title,
      description: shareText,
    },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  const settings = await getSiteSettings();

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600 mb-4">Job not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  const jobDetailAd = await prisma.ad.findFirst({
    where: { isActive: true, position: AdPosition.JOB_DETAIL_TOP },
    orderBy: { createdAt: 'desc' }
  });

  const portalName = settings.portalName || 'Jobfather';

  return (
    <JobDetailPage job={job} portalName={portalName} jobDetailAd={jobDetailAd} />
  );
}
