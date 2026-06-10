import { Ad } from '@prisma/client';

interface AdSlotProps {
  id: string;
  ad?: Ad | null;
  className?: string;
}

function isSafeUrl(url: string): boolean {
  try {
    if (url.startsWith('//')) {
      return false;
    }
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function AdSlot({ id, ad, className = '' }: AdSlotProps) {
  if (!ad) return null;

  if (ad.type === 'CUSTOM' && ad.imageUrl) {
    const AdContent = (
      <div id={id} className={`relative block overflow-hidden bg-gray-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={ad.imageUrl}
          alt={ad.label}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
    
    if (ad.targetUrl && isSafeUrl(ad.targetUrl)) {
      return (
        <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
          {AdContent}
        </a>
      );
    }
    
    return AdContent;
  }

  // Fallback for Google AdSense or missing image
  return (
    <div id={id} className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <span className="text-xs text-gray-500 font-medium">Advertisement</span>
    </div>
  );
}
