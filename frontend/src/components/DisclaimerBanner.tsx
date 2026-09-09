'use client';

import React from 'react';
import { COPY } from '@/constants/copy';

interface DisclaimerBannerProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  variant = 'compact',
  className = '',
}) => {
  return (
    <p
      role="note"
      aria-label="Penafian: bukan saran investasi"
      className={`text-xs text-slash-mist leading-relaxed max-w-[65ch] flex gap-2 ${className}`}
    >
      <span aria-hidden="true" className="text-slash-copper shrink-0 font-mono">!</span>
      <span>{variant === 'compact' ? COPY.disclaimer_short : COPY.disclaimer_long}</span>
    </p>
  );
};
