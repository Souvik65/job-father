import type { Metadata } from 'next';
import { getJobs, getJobBySlug } from '@/lib/jobs';
import { formatDate, jobUrl, buildShareText } from '@/lib/utils';
import Link from 'next/link';

interface JobPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all jobs
export async function generateStaticParams() {
  const jobs = await getJobs();
  return jobs.map((job) => ({
    slug: job.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);

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
  const job = await getJobBySlug(params.slug);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
              {job.category}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
              Last Date: {formatDate(job.timeline?.applicationEnd || null)}
            </span>
          </div>

          {job.description && (
            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          <div className="flex gap-4">
            {job.sourceUrl ? (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Apply Now
              </a>
            ) : (
              <button disabled className="px-6 py-3 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed">
                Not Available
              </button>
            )}
            
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
