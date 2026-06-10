import { AdPosition } from '@prisma/client';

export interface PositionDetail {
  label: string;
  shortLabel: string;
  icon: string;
}

export const POSITION_DETAILS: Partial<Record<AdPosition, PositionDetail>> = {
  HEADER_TOP: {
    label: 'Header Top (Leaderboard)',
    shortLabel: 'Header Top',
    icon: 'vertical_align_top',
  },
  INLINE_AFTER_3RD: {
    label: 'Inline After 3rd Job',
    shortLabel: 'Inline (After 3rd Job)',
    icon: 'view_day',
  },
  JOB_DETAIL_TOP: {
    label: 'Job Detail Top',
    shortLabel: 'Job Detail Top',
    icon: 'article',
  },
};
