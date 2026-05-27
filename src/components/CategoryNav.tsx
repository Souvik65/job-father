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
    <div className="bg-[#ff7315] w-full border-none select-none overflow-x-auto scrollbar-hide">
      <nav
        ref={navRef}
        className="w-full flex items-stretch h-12"
        aria-label="Job categories"
      >
        <button
          onClick={() => onCategoryChange('ALL')}
          data-active={activeCategory === 'ALL'}
          className={`px-6 h-full flex items-center justify-center font-black text-xs uppercase tracking-widest transition-colors cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-white text-[#ff7315]'
              : 'bg-[#f17726dd] text-white hover:bg-[#e66712]'
          }`}
          aria-pressed={activeCategory === 'ALL'}
        >
          ALL JOBS
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            data-active={activeCategory === cat}
            className={`px-6 h-full flex items-center justify-center font-black text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-white text-[#ff7315]'
                : 'bg-[#f17726dd] text-white hover:bg-[#e66712]'
            }`}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </nav>
    </div>
  );
}
