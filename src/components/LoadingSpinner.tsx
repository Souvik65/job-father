import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  minHeight?: string;
  title: string;
  subtitle: string;
  showBackground?: boolean;
}

export function LoadingSpinner({ 
  minHeight = 'min-h-[70vh]', 
  title, 
  subtitle,
  showBackground = false 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} gap-3.5 select-none ${showBackground ? 'bg-[#f9f9f9] dark:bg-slate-950' : ''} transition-colors duration-200 animate-fadeUp`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-full bg-orange-500/10 blur-md animate-pulse" />
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" strokeWidth={2.5} />
      </div>
      <div className="text-center flex flex-col gap-1 mt-1">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {title}
        </span>
        <span className="text-[11px] font-semibold text-slate-400/80 dark:text-slate-500/80 uppercase tracking-wide">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
