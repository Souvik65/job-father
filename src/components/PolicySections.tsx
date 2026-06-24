import type { ReactNode } from 'react';

export interface PolicySection {
  /** Optional number badge (e.g. for numbered legal sections). */
  number?: number;
  title: string;
  paragraphs?: string[];
  list?: string[];
  /** Optional custom content (e.g. a mailto link) rendered after the list. */
  children?: ReactNode;
}

/**
 * Renders a list of policy/legal sections with consistent styling.
 * Content is supplied as plain data to keep policy pages declarative.
 */
export function PolicySections({ sections }: { sections: PolicySection[] }) {
  return (
    <div className="space-y-6 sm:space-y-7">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0F172A] dark:text-slate-100 mb-2.5">
            {typeof section.number === 'number' && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-orange-50 dark:bg-orange-500/10 text-[#EA580C] dark:text-orange-400 text-[11px] font-black">
                {section.number}
              </span>
            )}
            <span>{section.title}</span>
          </h2>

          {section.paragraphs?.map((paragraph, i) => (
            <p
              key={i}
              className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed mb-2.5 last:mb-0"
            >
              {paragraph}
            </p>
          ))}

          {section.list && (
            <ul className="space-y-2 mt-1">
              {section.list.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed"
                >
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {section.children}
        </section>
      ))}
    </div>
  );
}
