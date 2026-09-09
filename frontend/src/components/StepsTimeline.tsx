'use client';

import React from 'react';
import { Step } from '@/types/investigate';

interface StepsTimelineProps {
  steps: Step[];
  className?: string;
}

const getStatusLabel = (status: Step['status']) => {
  switch (status) {
    case 'done':
      return { text: 'Selesai', className: 'text-slash-copper font-mono' };
    case 'running':
      return { text: 'Proses', className: 'text-slash-copper font-mono' };
    case 'error':
      return { text: 'Gagal', className: 'text-trade-sell font-mono' };
    case 'skipped':
      return { text: 'Dilewati', className: 'text-slash-fog font-mono' };
    case 'pending':
    default:
      return { text: 'Menunggu', className: 'text-slash-fog font-mono' };
  }
};

export const StepsTimeline: React.FC<StepsTimelineProps> = ({ steps, className = '' }) => {

  const completedCount = steps.filter((s) => s.status === 'done').length;

  return (
    <section aria-label="Status pemeriksaan" className={className}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em]">
          Status pemeriksaan
        </h2>
        <p className="text-[11px] text-slash-mist font-mono-numbers m-0" aria-label={`${completedCount} dari ${steps.length} tahap selesai`}>
          {completedCount}/{steps.length}
          <span className="sr-only"> tahap selesai</span>
        </p>
      </div>

      <ol className="list-none p-0 m-0 divide-y divide-slash-graphite border-y border-slash-graphite">
        {steps.map((step, idx) => {
          const isRunning = step.status === 'running';
          const isSkipped = step.status === 'skipped';
          const isPending = step.status === 'pending';
          const status = getStatusLabel(step.status);

          return (
            <li
              key={step.id || idx}
              aria-current={isRunning ? 'step' : undefined}
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 items-start py-3 ${
                isSkipped || isPending ? 'opacity-50' : ''
              }`}
            >
              <span className="font-mono-numbers text-[11px] text-slash-steel pt-0.5 w-4 tabular-nums">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-sans text-slash-paper leading-snug m-0">{step.title}</p>
                {step.detail && (
                  <p className="text-sm text-slash-mist font-serif mt-1 mb-0 leading-relaxed line-clamp-2" title={step.detail}>
                    {step.detail}
                  </p>
                )}
              </div>
              <span
                className={`text-[11px] font-sans font-medium pt-0.5 shrink-0 ${status.className} ${
                  isRunning ? 'step-running-bar' : ''
                }`}
              >
                {status.text}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
