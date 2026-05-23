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
