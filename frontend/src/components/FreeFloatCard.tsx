'use client';

import React from 'react';
import { FreeFloat } from '@/types/investigate';
import { formatNumber, formatDate } from '@/lib/formatters';
import { useCountUp } from '@/lib/useCountUp';
import { COPY } from '@/constants/copy';

interface FreeFloatCardProps {
  data: FreeFloat;
  className?: string;
}

export const FreeFloatCard: React.FC<FreeFloatCardProps> = ({ data, className = '' }) => {
  const hasData = data.percent !== null && data.percent !== undefined;
  // SAFETY: hasData narrows percent to number; assertion only applies in the true branch.
  const percent = hasData ? (data.percent as number) : 0;
  const animatedPercent = useCountUp(hasData ? percent : 0);
  const isCompliant = hasData && percent >= 7.5;

  return (
    <section aria-label={COPY.free_float_title} className={`border border-slash-graphite rounded-lg p-5 sm:p-6 flex flex-col ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <h3 className="text-sm font-serif italic text-slash-paper tracking-tight">{COPY.free_float_title}</h3>
            {hasData ? (
              <span className="compliance-badge font-sans text-xs font-medium inline-flex items-center gap-1.5 px-2.5 py-1 rounded">
                <span aria-hidden="true" className="text-slash-copper">{isCompliant ? '✓' : '!'}</span>
                {isCompliant ? COPY.free_float_compliant : COPY.free_float_noncompliant}
              </span>
            ) : (
              <span className="font-serif italic text-xs text-slash-mist">{COPY.free_float_unknown}</span>
            )}
          </div>

          <div className="flex flex-col gap-1 mb-5">
            <div className="flex items-baseline justify-between">
              <span className="text-4xl sm:text-5xl font-serif text-slash-paper tracking-tight leading-none tabular-nums">
                {hasData ? `${animatedPercent.toFixed(1)}%` : '—'}
              </span>
              {data.as_of && (
                <span className="text-xs text-slash-fog font-sans">
                  Per {formatDate(data.as_of)}
                </span>
              )}
            </div>
            <p className="text-xs text-slash-bone font-sans font-medium mt-1">
              {data.shares !== null && data.shares !== undefined
                ? `${formatNumber(data.shares)} lembar saham publik`
                : 'Jumlah lembar belum tersedia'}
            </p>
          </div>

          {hasData ? (
            <>
              <div
                role="progressbar"
                aria-valuenow={Math.round(percent * 10) / 10}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Saham publik ${percent.toFixed(1)} persen`}
                className="w-full bg-slash-graphite h-2 rounded-xs overflow-hidden mb-3 flex"
              >
                <div
                  className="gilded-gradient h-full rounded-xs"
                  style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-sans text-slash-mist mb-4">
                <span className="text-slash-bone">Publik {percent.toFixed(1)}%</span>
                <span>Pengendali {(100 - percent).toFixed(1)}%</span>
              </div>
            </>
          ) : (
            <div className="mb-4 space-y-2" aria-hidden="true">
              <div className="skeleton h-2.5 w-full" />
              <p className="text-sm text-slash-mist font-serif leading-relaxed">Menunggu data kepemilikan publik.</p>
            </div>
          )}

          {data.note && (
            <p className="text-sm text-slash-mist font-serif leading-relaxed mt-auto">{data.note}</p>
          )}
    </section>
  );
};
