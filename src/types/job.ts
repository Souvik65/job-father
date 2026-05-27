import { Job as PrismaJob, ExamTimeline } from '@prisma/client';

export type Job = PrismaJob & {
  timeline: ExamTimeline | null;
};

export interface PostJobFormData {
  title: string;
  category: string;
  fromDate: string;
  untilDate: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  totalVacancies?: number;
  attachments?: File[];
}

export interface ShareData {
  url: string;
  text: string;
  title?: string;
}
