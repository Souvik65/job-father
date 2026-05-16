'use client';

import Image from 'next/image';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

interface AdSlotProps {
  id: string;
  className?: string;
}

export function AdSlot({ id, className = '' }: AdSlotProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center justify-center py-2">
          <Image 
            src="/advertisement.svg"
            alt="advertisement"
            width={32}
            height={32}
            className='mx-auto mb-1 opacity-50'
          />
          <p className="text-gray-500 text-xs font-medium">Advertisement Slot</p>
        </div>
      </div>
    );
  }
  return (
    <div id={id} className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center justify-center py-2">
        <Image 
          src="/advertisement.svg"
          alt="advertisement"
          width={32}
          height={32}
          className='mx-auto mb-1 opacity-50'
        />
        <p className="text-gray-500 text-xs font-medium">Advertisement Slot</p>
      </div>
    </div>
  );
}
