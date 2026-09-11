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

      <div className="max-w-xl border-t border-slash-graphite pt-6">
        <h2 className="text-base font-sans font-semibold text-slash-paper mb-2 tracking-[-0.01em] m-0">
          {COPY.empty_title}
          {ticker ? ` · ${ticker}` : ''}
        </h2>

        <p className="text-[13px] text-slash-mist font-sans leading-relaxed mb-1.5 max-w-[62ch]">
          {errorMessage && !/error|failed|exception|500|404/i.test(errorMessage)
            ? errorMessage
            : COPY.empty_body}
        </p>
        <p className="text-[13px] text-slash-fog font-sans leading-relaxed mb-6 max-w-[62ch]">
          {COPY.empty_suggest}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onTryBBCA}
            className="pressable px-4 min-h-[38px] rounded-md bg-slash-paper hover:bg-slash-bone text-slash-obsidian font-sans text-[13px] font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none transition-colors duration-150 inline-flex items-center"
          >
            {COPY.cta_try_example}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="pressable px-4 min-h-[38px] rounded-md bg-slash-carbon text-slash-mist font-sans text-[13px] border border-slash-graphite cursor-pointer hover:text-slash-paper hover:border-slash-slate focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none transition-colors duration-150 inline-flex items-center"
          >
            {COPY.cta_retry}
          </button>
        </div>
      </div>
    </div>
  );
};
