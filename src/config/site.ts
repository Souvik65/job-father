

// If you ever need to change the site's URL in the future, you only need to update it in src/config/site.ts once!

export const siteConfig = {
  baseUrl: (process.env.NEXT_PUBLIC_SITE_BASE || 'https://syncdb.in/jobfather').replace(/\/$/, ''),
} as const;
