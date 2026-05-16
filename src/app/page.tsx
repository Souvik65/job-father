import { getJobs, getCategories } from '@/lib/jobs';
import { HomeClient } from '@/components/HomeClient';

export default async function Home() {
  const jobs = await getJobs();
  const categories = await getCategories();

  return (
    <HomeClient
      initialJobs={jobs}
      initialCategories={['ALL', ...categories]}
    />
  );
}
