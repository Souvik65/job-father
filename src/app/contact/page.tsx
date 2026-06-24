import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PolicySections, type PolicySection } from '@/components/PolicySections';
import { getPortalName } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const portalName = await getPortalName();
  return {
    title: `Contact Us | ${portalName}`,
    description: `Get in touch with ${portalName}.`,
  };
}

const sections: PolicySection[] = [
  {
    title: 'Get In Touch',
    paragraphs: [
      'For any business inquiries, technical support, or content feedback, please reach out to us via email:',
    ],
    children: (
      <a
        href="mailto:support@jobfather.in"
        className="inline-flex items-center gap-2 mt-1.5 px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-[#EA580C] dark:text-orange-400 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        support@jobfather.in
      </a>
    ),
  },
  {
    title: 'Response Time',
    paragraphs: [
      'We review all legitimate messages closely and make every effort to respond within 24 to 48 hours.',
    ],
  },
  {
    title: 'Safety Alert for Job Seekers',
    paragraphs: [
      'Please note that Jobfather.in is a purely informational career portal and not a recruitment or staffing agency. We do not provide jobs directly, nor do we ever charge money from candidates for interviews, scheduling, or placements. If you receive any communication claiming to be from Jobfather.in that asks for monetary compensation, please report it to us immediately.',
    ],
  },
];

export default async function ContactPage() {
  const portalName = await getPortalName();

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-slate-950">
      <Header portalName={portalName} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <article className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-slate-100 mb-4">
            Contact Us
          </h1>

          <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed mb-6 sm:mb-8">
            We value your feedback, inquiries, and suggestions. Whether you are an applicant looking for assistance navigating our portal or an organization wishing to share a legitimate career opening, the Jobfather.in team is here to assist you.
          </p>

          <PolicySections sections={sections} />
        </article>
      </main>

      <Footer portalName={portalName} />
    </div>
  );
}
