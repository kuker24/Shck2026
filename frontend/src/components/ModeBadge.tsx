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

const dotClass = (m: InvestigationMode) => {
  if (m === 'live') return 'bg-status-success';
  if (m === 'cache') return 'bg-slash-copper';
  return 'bg-slash-steel';
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
          className="inline-flex rounded-full bg-slash-carbon p-0.5 border border-slash-graphite text-xs"
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
                className={`pressable px-3 py-1 min-h-[44px] sm:min-h-[32px] rounded-full font-sans text-[11px] transition-colors duration-150 flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none ${
                  active
                    ? 'bg-slash-obsidian text-slash-paper font-medium'
                    : 'text-slash-fog hover:text-slash-bone'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass(m)}`} aria-hidden="true" />
                {getModeLabel(m)}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="inline-flex items-center gap-2 px-3 py-1 min-h-[32px] rounded-full border border-slash-graphite bg-slash-carbon text-xs font-sans text-slash-bone"
          title={getModeHint(mode)}
          aria-label={`Mode ${getModeLabel(mode)}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass(mode)}`} aria-hidden="true" />
          <span className="font-medium">{getModeLabel(mode)}</span>
          <span className="text-[11px] text-slash-fog hidden sm:inline">
            · {getModeHint(mode)}
          </span>
        </div>
      )}

      {creditEstimate !== undefined && creditEstimate !== null && (
        <div
          className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[32px] rounded-full bg-slash-carbon border border-slash-graphite text-[11px] text-slash-mist font-mono"
          title="Perkiraan kuota API yang dipakai untuk pemeriksaan ini"
        >
          ~{creditEstimate} kredit
        </div>
      )}
    </div>
  );
};
