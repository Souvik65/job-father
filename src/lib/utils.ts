import { Job } from '@/types/job';
import { siteConfig } from '@/config/site';

export function slugify(str: string): string {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function jobUrl(job: Job, baseUrl: string = siteConfig.baseUrl): string {
  return `${baseUrl}/job/${encodeURIComponent(job.slug)}`;
}

export function formatDate(raw: string | Date | null | undefined): string {
  if (!raw) return 'N/A';
  
  const s = String(raw).trim();
  let d: Date;
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    // Parse as UTC to avoid timezone-related day shifts
    d = new Date(s + 'T00:00:00Z');
  } else {
    d = new Date(s);
  }
  
  if (isNaN(d.getTime())) return s;
  
  const day = d.getDate();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month}, ${year}`;
}
export function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildShareText(job: Job, baseUrl: string = siteConfig.baseUrl): string {
  const isPrivate = !!job.isPrivate;
  let msg = `📢 ${job.title}\n📁 Category: ${job.category}\n⏳ Last Date: ${formatDate(job.timeline?.applicationEnd)}\n\n🔗 ${
    isPrivate ? 'Send CV/Resume' : 'Apply Now'
  }: ${jobUrl(job, baseUrl)}\n\n📌 More Job Updates: ${baseUrl}`;
  
  if (!isPrivate) {
    msg += `\n\n📝 Mock Test: ${baseUrl}/mock-test/`;
  }
  
  return msg;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}
export function isoToday(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function isoDate(d?: Date): string {
  const date = d || new Date();
  return date.toISOString().split('T')[0];
}
