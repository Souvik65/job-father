import { prisma } from './prisma';

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSettings.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {};
  }
}

export async function getPortalName(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.portalName || 'Jobfather';
}
