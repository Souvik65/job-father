import { getJobs, getCategories } from '@/lib/jobs';
import { HomeClient, CategoryWithAll } from '@/components/HomeClient';
import { NewsletterPopup } from '@/components/NewsletterPopup';
import { getSiteSettings } from '@/lib/settings';

export default async function Home() {
  const jobs = await getJobs();
  const categories = await getCategories();
  const settings = await getSiteSettings();
  
  const portalName = settings.portalName || 'Jobfather';
  const fabEnabled = settings.fabEnabled === 'true';
  const subscriptionPopup = settings.subscriptionPopup !== 'false'; // default true
  const popupDelay = parseInt(settings.popupDelay || '5', 10);

  return (
    <>
      <HomeClient
        initialJobs={jobs}
        initialCategories={['ALL', ...categories] as CategoryWithAll[]}
        portalName={portalName}
        fabEnabled={fabEnabled}
      />
      {subscriptionPopup && <NewsletterPopup popupDelay={popupDelay} />}
    </>
  );
}
