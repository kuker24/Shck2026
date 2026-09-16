'use client';

import React from 'react';
import { Check, X, Minus, Clock } from 'lucide-react';
import { Step } from '@/types/investigate';
import { COPY } from '@/constants/copy';

interface StepsTimelineProps {
  steps: Step[];
  className?: string;
}

const ROLE_LABEL: Record<Step['role'], string> = {
  planner: COPY.role_planner,
  executor: COPY.role_executor,
  critic: COPY.role_critic,
};

/** Marker rendering per status. The running state is the only animated one,
 *  and the pulse sits on the dot so the label never drops below readable. */
const Marker: React.FC<{ status: Step['status'] }> = ({ status }) => {
  const base =
    'relative z-10 shrink-0 w-6 h-6 rounded-full border flex items-center justify-center bg-slash-obsidian';

  if (status === 'done') {
    return (
      <span className={`${base} border-slash-copper text-slash-copper`}>
        <Check size={13} strokeWidth={2.5} aria-hidden="true" />
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className={`${base} border-trade-sell text-trade-sell`}>
        <X size={13} strokeWidth={2.5} aria-hidden="true" />
      </span>
    );
  }
  if (status === 'skipped') {
    return (
      <span className={`${base} border-slash-slate text-slash-steel`}>
        <Minus size={13} strokeWidth={2.5} aria-hidden="true" />
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className={`${base} border-slash-copper`}>
        <span className="step-pulse w-2.5 h-2.5 rounded-full bg-slash-copper" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className={`${base} border-slash-graphite text-slash-steel`}>
      <Clock size={12} strokeWidth={2} aria-hidden="true" />
    </span>
  );
};

const STATUS_TEXT: Record<Step['status'], string> = {
  done: 'Selesai',
  running: 'Berjalan',
  error: 'Gagal',
  skipped: 'Dilewati',
  pending: 'Menunggu',
};

const STATUS_TONE: Record<Step['status'], string> = {
  done: 'text-slash-copper',
  running: 'text-slash-copper',
  error: 'text-trade-sell',
  skipped: 'text-slash-steel',
  pending: 'text-slash-steel',
};

export const StepsTimeline: React.FC<StepsTimelineProps> = ({ steps, className = '' }) => {
  const completedCount = steps.filter((s) => s.status === 'done').length;
  const runningStep = steps.find((s) => s.status === 'running');
  const allDone = completedCount === steps.length && steps.length > 0;

  return (
    <section aria-labelledby="orchestration-heading" className={className}>
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2
          id="orchestration-heading"
          className="text-sm font-sans font-semibold text-slash-paper tracking-[-0.01em]"
        >
          {COPY.orchestration_title}
        </h2>
        <p className="text-[11px] text-slash-steel font-mono-numbers m-0 shrink-0">
          <span className="text-slash-mist">{completedCount}</span>/{steps.length}
        </p>
      </div>

      {/* Screen readers get one short status line instead of the whole
          re-announced list on every step transition. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {allDone
          ? `Pemeriksaan selesai, ${completedCount} dari ${steps.length} tahap.`
          : runningStep
            ? `Tahap ${completedCount + 1} dari ${steps.length}: ${runningStep.title}`
            : `${completedCount} dari ${steps.length} tahap selesai.`}
      </p>

      <ol className="list-none p-0 m-0 relative">
        {steps.map((step, idx) => {
          const isRunning = step.status === 'running';
          const isDimmed = step.status === 'skipped' || step.status === 'pending';
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.id || idx}
              aria-current={isRunning ? 'step' : undefined}
              className="relative grid grid-cols-[24px_minmax(0,1fr)_auto] gap-x-3.5 pb-4 last:pb-0"
            >
              {/* Rail connecting the markers into one continuous process. */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[11.5px] top-6 bottom-0 w-px ${
                    step.status === 'done' ? 'bg-slash-copper/35' : 'bg-slash-graphite'
                  }`}
                />
              )}

              <Marker status={step.status} />

              <div className={`min-w-0 pt-0.5 ${isDimmed ? 'opacity-55' : ''}`}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-slash-steel shrink-0">
                    {ROLE_LABEL[step.role]}
                  </span>
                  <p
                    className={`text-[13px] font-sans leading-snug m-0 ${
                      isRunning ? 'text-slash-paper font-medium' : 'text-slash-bone'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {step.detail && (
                  <p
                    className="text-xs text-slash-fog font-sans mt-1 mb-0 leading-relaxed line-clamp-2 max-w-[62ch]"
                    title={step.detail}
                  >
                    {step.detail}
                  </p>
                )}
              </div>

              <span
                className={`text-[11px] font-sans font-medium pt-1 shrink-0 ${STATUS_TONE[step.status]} ${
                  isDimmed ? 'opacity-70' : ''
                }`}
              >
                {STATUS_TEXT[step.status]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
