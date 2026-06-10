import { getJobs, getCategories } from '@/lib/jobs';
import { HomeClient, CategoryWithAll } from '@/components/HomeClient';
import { NewsletterPopup } from '@/components/NewsletterPopup';
import { getSiteSettings } from '@/lib/settings';
import { prisma } from '@/lib/prisma';
import { AdPosition } from '@prisma/client';

export default async function Home() {
  const jobs = await getJobs();
  const categories = await getCategories();
  const settings = await getSiteSettings();
  
  const headerAd = await prisma.ad.findFirst({
    where: { isActive: true, position: AdPosition.HEADER_TOP },
    orderBy: { createdAt: 'desc' }
  });

  const inlineAd = await prisma.ad.findFirst({
    where: { isActive: true, position: AdPosition.INLINE_AFTER_3RD },
    orderBy: { createdAt: 'desc' }
  });

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
        headerAd={headerAd}
        inlineAd={inlineAd}
      />
      {subscriptionPopup && <NewsletterPopup popupDelay={popupDelay} />}
    </>
  );
}
