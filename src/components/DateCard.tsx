import React from 'react';

export function DateCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 border rounded-lg p-3 ${highlight ? 'bg-red-50 border-red-100' : 'bg-[#f3f3f3] border-gray-200'}`}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-bold ${highlight ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}
