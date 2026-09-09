'use client';

import React from 'react';
import { COPY } from '@/constants/copy';
import { Step } from '@/types/investigate';
import { StepsTimeline } from './StepsTimeline';

interface EmptyStateProps {
  ticker: string;
  errorMessage?: string;
  steps?: Step[];
  onReset: () => void;
  onTryBBCA: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  ticker,
  errorMessage,
  steps,
  onReset,
  onTryBBCA,
  className = '',
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {steps && steps.length > 0 && <StepsTimeline steps={steps} />}

      <div className="max-w-xl">
        <h2 className="text-lg font-serif font-medium text-slash-paper mb-3 tracking-[-0.01em]">
          {COPY.empty_title}
          {ticker ? ` · ${ticker}` : ''}
        </h2>

        <p className="text-base text-slash-mist font-serif leading-relaxed mb-2 max-w-[65ch]">
          {errorMessage && !/error|failed|exception|500|404/i.test(errorMessage)
            ? errorMessage
            : COPY.empty_body}
        </p>
        <p className="text-sm text-slash-fog font-serif leading-relaxed mb-8 max-w-[65ch]">
          {COPY.empty_suggest}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onTryBBCA}
            className="pressable px-5 py-2.5 min-h-[44px] rounded-md bg-slash-paper hover:bg-slash-bone text-slash-obsidian font-sans text-sm font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none transition-colors duration-150"
          >
            {COPY.cta_try_example}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="pressable px-5 py-2.5 min-h-[44px] rounded-md bg-slash-carbon text-slash-bone font-sans text-sm border border-slash-graphite cursor-pointer hover:text-slash-paper hover:border-slash-slate focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none transition-colors duration-150"
          >
            {COPY.cta_retry}
          </button>
        </div>
      </div>
    </div>
  );
};
