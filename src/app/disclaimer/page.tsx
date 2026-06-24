import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PolicySections, type PolicySection } from '@/components/PolicySections';
import { getPortalName } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const portalName = await getPortalName();
  return {
    title: `Disclaimer | ${portalName}`,
    description: `Disclaimer for ${portalName}.`,
  };
}

const sections: PolicySection[] = [
  {
    number: 1,
    title: 'Absolute Non-Affiliation with Government Bodies',
    paragraphs: [
      'Jobfather.in is an independent, privately owned web portal. It is NOT affiliated with, associated with, endorsed by, or in any way officially connected with any government organization, department, recruitment board, or ministry (such as UPSC, SSC, Banking Boards, Railways, or State Public Service Commissions).',
      'The use of official government department names, acronyms, emblems, or examination terminology on this website is purely for informational and reference purposes to assist job seekers in locating public sector career opportunities.',
    ],
  },
  {
    number: 2,
    title: 'Sources of Information',
    paragraphs: [
      'All government job notifications, examination schedules, eligibility details, and results published on Jobfather.in are aggregated from publicly available official government web portals, public press releases, and official employment news channels. While we work diligently to verify the authenticity of these postings, Jobfather.in does not guarantee the absolute completeness or final accuracy of the data. We strongly advise all users to cross-check and verify details on the official portals of the respective government departments before making any financial payments or submitting applications.',
    ],
  },
  {
    number: 3,
    title: 'Liability and Risk',
    paragraphs: [
      'All information on this website is published in good faith. Jobfather.in does not make any warranties about the complete reliability and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk. Jobfather.in will not be liable for any losses and/or damages in connection with the use of our website.',
    ],
  },
  {
    number: 4,
    title: 'External Hyperlinks',
    paragraphs: [
      'Our website contains hyperlinks to external sites (such as official application forms, employer corporate sites, or official notifications). While we strive to provide only high-quality, safe, and ethical links, we have no control over the nature, content, and updates of these external websites. A link to an external site does not imply a recommendation for all the content found there. External site owners and content may change without notice before we have the opportunity to update or remove a broken or altered link.',
    ],
  },
];

export default async function DisclaimerPage() {
  const portalName = await getPortalName();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950">
      <Header portalName={portalName} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <article className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#94A3B8] dark:text-slate-500 mb-1">
            Last updated: June 2026
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-slate-100 mb-4">
            Disclaimer
          </h1>

          <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed mb-6 sm:mb-8">
            The information provided on the Jobfather.in website (https://jobfather.in) is for general informational and educational purposes only.
          </p>

          <PolicySections sections={sections} />
        </article>
      </main>

      <Footer portalName={portalName} />
    </div>
  );
}
