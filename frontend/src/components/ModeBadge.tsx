'use client';

import React from 'react';
import { InvestigationMode } from '@/types/investigate';
import { COPY } from '@/constants/copy';

interface ModeBadgeProps {
  mode: InvestigationMode;
  creditEstimate?: number | null;
  onModeChange?: (mode: InvestigationMode) => void;
  interactive?: boolean;
}

const AVAILABLE_MODES: readonly InvestigationMode[] = ['mock', 'cache', 'live'];

const getModeLabel = (m: InvestigationMode): string => {
  switch (m) {
    case 'mock': return COPY.mode_mock;
    case 'cache': return COPY.mode_cache;
    case 'live': return COPY.mode_live;
    default: return '';
  }
};

const getModeHint = (m: InvestigationMode): string => {
  switch (m) {
    case 'mock': return COPY.mode_hint_mock;
    case 'cache': return COPY.mode_hint_cache;
    case 'live': return COPY.mode_hint_live;
    default: return '';
  }
};

export const ModeBadge: React.FC<ModeBadgeProps> = ({
  mode,
  creditEstimate,
  onModeChange,
  interactive = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {interactive && onModeChange ? (
        <div
          className="inline-flex items-center gap-2 text-xs"
          role="radiogroup"
          aria-label="Mode data"
        >
          {AVAILABLE_MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${getModeLabel(m)} — ${getModeHint(m)}`}
                title={getModeHint(m)}
                className={`pressable px-2 py-1 min-h-[44px] sm:min-h-[28px] flex items-center font-sans text-[11px] border-b-2 cursor-pointer transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-slash-copper focus-visible:outline-none ${
                  active
                    ? 'border-slash-copper text-slash-paper font-medium'
                    : 'border-transparent text-slash-fog hover:text-slash-bone'
                }`}
              >
                {getModeLabel(m)}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="inline-flex items-center gap-2 px-3 py-1 min-h-[30px] rounded border border-slash-graphite bg-slash-carbon text-xs font-sans text-slash-bone"
          title={getModeHint(mode)}
          aria-label={`Mode ${getModeLabel(mode)}`}
        >
          <span className="font-medium">{getModeLabel(mode)}</span>
          <span className="text-[11px] text-slash-fog hidden sm:inline">
            · {getModeHint(mode)}
          </span>
        </div>
      )}

      {creditEstimate !== undefined && creditEstimate !== null && (
        <div
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 min-h-[32px] rounded-md bg-slash-carbon border border-slash-graphite text-[11px] text-slash-mist font-mono"
          title="Perkiraan kuota API yang dipakai untuk pemeriksaan ini"
        >
          ~{creditEstimate} kredit
        </div>
      )}
    </div>
  );
};
