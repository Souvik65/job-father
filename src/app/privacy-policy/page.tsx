import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PolicySections, type PolicySection } from '@/components/PolicySections';
import { getPortalName } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const portalName = await getPortalName();
  return {
    title: `Privacy Policy | ${portalName}`,
    description: `Privacy Policy for ${portalName}.`,
  };
}

const sections: PolicySection[] = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'Jobfather.in follows standard procedures regarding the collection of user data. We collect information in the following ways:',
    ],
    list: [
      'Direct Communication: If you contact us directly via our support channels, we may receive additional information about you such as your name, email address, phone number, and the contents or attachments of any message you send.',
      'Account Registration: When you register on our platform for custom job alerts, a personal dashboard, or newsletters, we may ask for your contact details, including your name, email address, and mobile number.',
    ],
  },
  {
    title: 'How We Use Your Information',
    paragraphs: [
      'We use the gathered information to optimize your job-seeking experience, specifically to:',
    ],
    list: [
      'Provide, operate, and maintain our job alert portal.',
      'Improve, personalize, and expand our platform’s features.',
      'Understand and analyze how visitors navigate and interact with our job listings.',
      'Develop new career tools, calculators, and dashboard functionalities.',
      'Communicate with you, either directly or through one of our partners, to provide timely job updates, marketing materials, and relevant career insights.',
      'Detect and prevent fraudulent activities or unauthorized scraping.',
    ],
  },
  {
    title: 'Log Files and Analytics',
    paragraphs: [
      'Jobfather.in follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamps, referring/exit pages, and the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users’ movement on the website, and gathering demographic information.',
    ],
  },
  {
    title: 'Cookies and Web Beacons',
    paragraphs: [
      'Like any other modern web platform, Jobfather.in uses “cookies”. These cookies are used to store information including visitors’ preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users’ experience by customizing our web page content based on visitors’ browser type and other programmatic factors.',
    ],
  },
  {
    title: 'Google DoubleClick DART Cookie',
    paragraphs: [
      'Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to Jobfather.in and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy.',
    ],
  },
  {
    title: 'Third-Party Privacy Policies',
    paragraphs: [
      'Jobfather.in’s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.',
    ],
  },
  {
    title: 'Consent',
    paragraphs: [
      'By utilizing our web portal, you hereby consent to our Privacy Policy and agree to its terms and conditions.',
    ],
  },
];

export default async function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed mb-6 sm:mb-8">
            At Jobfather.in, accessible from https://jobfather.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Jobfather.in and how we use it. If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
          </p>

          <PolicySections sections={sections} />
        </article>
      </main>

      <Footer portalName={portalName} />
    </div>
  );
}
