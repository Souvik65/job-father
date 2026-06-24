import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PolicySections, type PolicySection } from '@/components/PolicySections';
import { getPortalName } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const portalName = await getPortalName();
  return {
    title: `About Us | ${portalName}`,
    description: `About ${portalName}.`,
  };
}

const sections: PolicySection[] = [
  {
    title: 'What We Do',
    list: [
      'Government Job Alerts (Sarkari Jobs): We continuously track official department notifications, employment newspapers, and gazette releases to bring you authentic, timely updates regarding central and state government openings.',
      'Private Sector Careers: From fast-growing startups to multinational corporations, we curate job vacancies across diverse fields including Web Development, Marketing, Administration, Sales, Finance, and Operations.',
      'Simplified Job Summaries: We don’t just dump unorganized links. We break down complex, multi-page official notifications into clean, easy-to-read summaries covering age limits, educational qualifications, fees, selection processes, and step-by-step application instructions.',
    ],
  },
  {
    title: 'Our Mission',
    paragraphs: [
      'Our mission is to bridge the gap between ambitious job seekers and credible employers. We believe in absolute transparency, accuracy, and accessibility, ensuring that no meaningful career opportunity goes unnoticed due to information clutter.',
    ],
  },
  {
    title: 'Important Notice',
    paragraphs: [
      'Jobfather.in is an independent career resource platform. Please note that we are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any government agency, body, or board. All government job postings displayed on our platform are compiled from publicly available official portals for informational purposes only. Visitors are always encouraged to verify details on the official government portals.',
    ],
  },
];

export default async function AboutPage() {
  const portalName = await getPortalName();

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950">
      <Header portalName={portalName} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <article className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-slate-100 mb-4">
            About Us
          </h1>

          <div className="space-y-2.5 mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed">
              Welcome to Jobfather.in, your premier destination for up-to-date, verified, and comprehensive job notifications across both the Government and Private sectors.
            </p>
            <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed">
              Finding the right career path in a rapidly evolving employment market can be challenging. Jobfather.in was established to simplify the job hunt. We aggregate, verify, and systematically organize career opportunities to save you time and help you secure your dream role.
            </p>
          </div>

          <PolicySections sections={sections} />
        </article>
      </main>

      <Footer portalName={portalName} />
    </div>
  );
}
