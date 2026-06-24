export const CATEGORIES = [
  'TPSC', 'SSC', 'UPSC', 'RAILWAY', 'BANKING',
  'TEACHING', 'POLICE', 'DEFENCE', 'STATE_PSC', 'PRIVATE', 'OTHER'
] as const;

export const CATEGORY_LABELS = [
  { value: '', label: 'All Categories' },
  { value: 'TPSC', label: 'TPSC' },
  { value: 'SSC', label: 'SSC' },
  { value: 'UPSC', label: 'UPSC' },
  { value: 'RAILWAY', label: 'Railways' },
  { value: 'BANKING', label: 'Banking' },
  { value: 'TEACHING', label: 'Teaching' },
  { value: 'POLICE', label: 'Police' },
  { value: 'DEFENCE', label: 'Defence' },
  { value: 'STATE_PSC', label: 'State PSC' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const MOCK_TEST_SUBJECTS = [
  { value: 'MATH', label: 'Quantitative Aptitude' },
  { value: 'REASONING', label: 'Reasoning Ability' },
  { value: 'ENGLISH', label: 'English Language' },
  { value: 'GK', label: 'General Knowledge' },
  { value: 'PYQ', label: 'Previous Year Qs' },
] as const;

export const SUBJECT_APPSCRIPT_URLS: Record<string, string> = {
  MATH: process.env.APPSCRIPT_URL_MATH || '',
  REASONING: process.env.APPSCRIPT_URL_REASONING || '',
  ENGLISH: process.env.APPSCRIPT_URL_ENGLISH || '',
  GK: process.env.APPSCRIPT_URL_GK || '',
  PYQ: process.env.APPSCRIPT_URL_PYQ || '',
};
