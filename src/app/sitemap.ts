import { MetadataRoute } from 'next';
import { getJobs, getCategories } from '@/lib/jobs';
import { jobUrl } from '@/lib/utils';
import { siteConfig } from '@/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.baseUrl;
  const jobs = await getJobs();

  const jobEntries = jobs.map((job) => ({
    url: jobUrl(job, baseUrl),
    lastModified: new Date(job.postedAt || Date.now()).toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categories = await getCategories();
  const categoryEntries = categories.map((cat) => ({
    url: `${baseUrl}/?category=${encodeURIComponent(cat)}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    ...categoryEntries,
    ...jobEntries,
  ];
}
