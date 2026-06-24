import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PolicySections, type PolicySection } from '@/components/PolicySections';
import { getPortalName } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const portalName = await getPortalName();
  return {
    title: `Terms & Conditions | ${portalName}`,
    description: `Terms & Conditions for ${portalName}.`,
  };
}

const sections: PolicySection[] = [
  {
    number: 1,
    title: 'Permitted Use of the Platform',
    paragraphs: [
      'The content, tools, and job listings provided on Jobfather.in are strictly for general informational, educational, and personal career-searching purposes. You agree to use this site legally and ethically to look for legitimate job openings and career advice.',
    ],
  },
  {
    number: 2,
    title: 'Intellectual Property Rights',
    paragraphs: [
      'Unless otherwise stated, Jobfather.in and its founders own the intellectual property rights for all original material, custom web layouts, custom tools, and written content published on this website. You may not copy, republish, or redistribute our compiled content without explicit written consent.',
    ],
  },
  {
    number: 3,
    title: 'Accuracy and Modifications',
    paragraphs: [
      'While our team exerts maximum effort to ensure that the information regarding private and government job listings is accurate and current, Jobfather.in cannot guarantee absolute error-free data. Job specifications, salary details, deadlines, and eligibility criteria are subject to change by the respective hiring entities or government bodies without prior notice.',
    ],
  },
  {
    number: 4,
    title: 'Prohibited Activities',
    paragraphs: [
      'When interacting with Jobfather.in, you agree not to:',
    ],
    list: [
      'Use automated scripts, bots, spiders, or web scrapers to extract data from this site without our permission.',
      'Attempt to disrupt the platform’s performance or bypass security architectures.',
      'Submit false, misleading, or malicious information through contact forms.',
    ],
  },
  {
    number: 5,
    title: 'Limitation of Liability',
    paragraphs: [
      'In no event shall Jobfather.in, its founders, or its team be liable for any direct, indirect, incidental, or consequential damages arising out of your use or inability to use the website, or your reliance on any job listing or third-party links provided herein.',
    ],
  },
];

export default async function TermsAndConditionsPage() {
  const portalName = await getPortalName();

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950">
      <Header portalName={portalName} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <article className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#94A3B8] dark:text-slate-500 mb-1">
            Last updated: June 2026
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-slate-100 mb-4">
            Terms &amp; Conditions
          </h1>

          <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed mb-6 sm:mb-8">
            Welcome to Jobfather.in. By accessing, browsing, or using this website, you agree to comply with and be bound by the following Terms of Service. If you do not agree with any part of these terms, please refrain from using our platform.
          </p>

          <PolicySections sections={sections} />
        </article>
      </main>

      <Footer portalName={portalName} />
    </div>
  );
}
