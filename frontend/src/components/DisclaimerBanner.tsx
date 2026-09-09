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
      className={`text-sm text-slash-mist font-serif leading-relaxed max-w-[65ch] ${className}`}
    >
      {variant === 'compact' ? COPY.disclaimer_short : COPY.disclaimer_long}
    </p>
  );
};
