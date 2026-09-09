'use client';

import React, { useState } from 'react';
import { COPY } from '@/constants/copy';

interface NarrativePanelProps {
  narrative: string;
  ticker: string;
  className?: string;
  onCopySuccess?: () => void;
}

export const NarrativePanel: React.FC<NarrativePanelProps> = ({
  narrative,
  ticker,
  className = '',
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      const fullText = `Aegis-IDX · ${ticker}\n${narrative}\n\nBukan saran investasi.`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setCopyFailed(false);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy narrative:', err);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  };

  const isLong = narrative.length > 600;

  return (
    <section aria-label={COPY.narrative_title} className={`card-interactive border border-slash-graphite rounded-lg p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em]">{COPY.narrative_title}</h3>
        {narrative && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Ringkasan tersalin' : `Salin ringkasan ${ticker}`}
            className="pressable text-[11px] font-sans px-3 py-1 min-h-[44px] sm:min-h-[32px] rounded-md border border-slash-graphite text-slash-mist hover:text-slash-paper hover:border-slash-slate focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none cursor-pointer transition-colors duration-150"
          >
            <span className="copy-label" data-swapping={copied}>
              {copyFailed ? COPY.toast_copy_fail : copied ? COPY.cta_copied : COPY.cta_copy}
            </span>
          </button>
        )}
      </div>

      {narrative ? (
        <div className="border-l border-slash-copper/40 pl-4">
          <p className={`text-sm text-slash-bone leading-relaxed whitespace-pre-line max-w-[65ch] ${!expanded && isLong ? 'line-clamp-6' : ''}`}>
            {narrative}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="pressable mt-3 text-[11px] font-sans text-slash-copper hover:text-slash-paper min-h-[44px] sm:min-h-[32px] cursor-pointer"
            >
              {expanded ? COPY.cta_collapse : COPY.cta_expand}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-slash-mist">{COPY.narrative_empty}</p>
      )}
    </section>
  );
};
