'use client';

import React from 'react';
import { Step } from '@/types/investigate';

interface StepsTimelineProps {
  steps: Step[];
  className?: string;
}

export const StepsTimeline: React.FC<StepsTimelineProps> = ({ steps, className = '' }) => {
  const getStatusLabel = (status: Step['status']) => {
    switch (status) {
      case 'done':
        return { text: 'Selesai', className: 'text-status-success' };
      case 'running':
        return { text: 'Proses', className: 'text-[#e2ab7d]' };
      case 'error':
        return { text: 'Gagal', className: 'text-status-error' };
      case 'skipped':
        return { text: 'Dilewati', className: 'text-slash-fog' };
      case 'pending':
      default:
        return { text: 'Menunggu', className: 'text-slash-fog' };
    }
  };

  const completedCount = steps.filter((s) => s.status === 'done').length;

  return (
    <section
      aria-label="Status pemeriksaan"
      className={`card-interactive border border-slash-graphite rounded-lg p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em]">Status pemeriksaan</h2>
        <div className="text-[11px] text-slash-mist font-mono-numbers" aria-label={`${completedCount} dari ${steps.length} tahap selesai`}>
          {completedCount}/{steps.length}
          <span className="sr-only"> tahap selesai</span>
        </div>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 list-none p-0 m-0">
        {steps.map((step, idx) => {
          const isRunning = step.status === 'running';
          const isDone = step.status === 'done';
          const isError = step.status === 'error';
          const isSkipped = step.status === 'skipped';
          const status = getStatusLabel(step.status);

          return (
            <li
              key={step.id || idx}
              aria-current={isRunning ? 'step' : undefined}
              className={`rounded-md p-3.5 border relative flex flex-col justify-between min-h-[6rem] ${
                isRunning
                  ? 'bg-slash-carbon border-slash-copper/60'
                  : isDone
                    ? 'bg-slash-carbon/40 border-slash-graphite'
                    : isError
                      ? 'bg-trade-sell-dim/30 border-status-error/25'
                      : isSkipped
                        ? 'border-slash-graphite/40 opacity-55'
                        : 'border-slash-graphite/40 opacity-45'
              }`}
            >
              {isRunning && (
                <div className="step-running-bar absolute top-0 left-0 right-0 h-[2px] bg-slash-copper rounded-t-md" />
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-slash-steel">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[11px] font-sans font-medium ${status.className}`}>{status.text}</span>
                </div>
                <div className="text-[12px] font-sans text-slash-paper leading-snug">{step.title}</div>
              </div>

              {step.detail && (
                <div className="text-[11px] text-slash-mist mt-2.5 leading-relaxed line-clamp-2" title={step.detail}>
                  {step.detail}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
