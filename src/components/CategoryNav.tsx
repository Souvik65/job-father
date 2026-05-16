'use client';

import { useEffect, useRef } from 'react';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeBtn = navRef.current?.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  return (
    <nav
      ref={navRef}
      className="flex overflow-x-auto gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 scrollbar-hide"
      aria-label="Job categories"
    >
      <button
        onClick={() => onCategoryChange('ALL')}
        data-active={activeCategory === 'ALL'}
        className={`px-4 py-2 font-medium whitespace-nowrap rounded-lg transition ${
          activeCategory === 'ALL'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
        aria-pressed={activeCategory === 'ALL'}
      >
        All Jobs
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          data-active={activeCategory === cat}
          className={`px-4 py-2 font-medium whitespace-nowrap rounded-lg transition ${
            activeCategory === cat
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          aria-pressed={activeCategory === cat}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}
