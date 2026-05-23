'use client';

import { useRouter } from 'next/navigation';

interface CategoryFilterProps {
  currentCategory: string;
  currentSearch: string;
  basePath?: string;
}

import { CATEGORY_LABELS } from '@/lib/constants';

export function CategoryFilter({ currentCategory, currentSearch, basePath = '/admin/jobs' }: CategoryFilterProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    if (currentSearch) params.set('search', currentSearch);
    if (e.target.value) params.set('category', e.target.value);
    params.set('page', '1');
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={currentCategory}
      onChange={handleChange}
      className="h-10 px-4 rounded-lg border border-[#c6c5d4] bg-white text-sm text-[#1a1c1c] outline-none focus:border-[#000666] focus:ring-1 focus:ring-[#000666] transition cursor-pointer"
    >
      {CATEGORY_LABELS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
