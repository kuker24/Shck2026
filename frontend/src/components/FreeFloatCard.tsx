'use client';

import React from 'react';
import { Check, TriangleAlert } from 'lucide-react';
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
  const isRedundantNote =
    Boolean(data.note && /memenuhi ketentuan|aturan min|di bawah aturan/i.test(data.note));

  return (
    <section aria-label={COPY.free_float_title} className={`border border-slash-graphite rounded-lg p-5 sm:p-6 flex flex-col ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <h3 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em] m-0">
              {COPY.free_float_title}
            </h3>
            {hasData ? (
              <span className="compliance-badge font-sans text-[11px] font-medium inline-flex items-center gap-1.5 px-2 py-1 rounded">
                {isCompliant ? (
                  <Check size={12} strokeWidth={2.5} className="text-status-success" aria-hidden="true" />
                ) : (
                  <TriangleAlert size={12} strokeWidth={2.5} className="text-slash-copper" aria-hidden="true" />
                )}
                {isCompliant ? COPY.free_float_compliant : COPY.free_float_noncompliant}
              </span>
            ) : (
              <span className="font-sans text-[11px] text-slash-fog">{COPY.free_float_unknown}</span>
            )}
          </div>

          <div className="flex flex-col gap-1 mb-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[34px] sm:text-[40px] font-serif text-slash-paper tracking-tight leading-none tabular-nums">
                {hasData ? `${animatedPercent.toFixed(1)}%` : '—'}
              </span>
              {data.as_of && (
                <span className="text-xs text-slash-fog font-sans shrink-0">
                  Per {formatDate(data.as_of)}
                </span>
              )}
            </div>
            <p className="text-xs text-slash-mist font-sans mt-1.5 mb-0">
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

              <div className="flex items-center justify-between text-xs font-sans mb-4">
                <span className="text-slash-bone">Publik {percent.toFixed(1)}%</span>
                <span className="text-slash-fog">Pengendali {(100 - percent).toFixed(1)}%</span>
              </div>
            </>
          ) : (
            <div className="mb-4 space-y-2.5">
              <div className="skeleton h-2 w-full" aria-hidden="true" />
              <p className="text-xs text-slash-fog font-sans leading-relaxed m-0">
                Menunggu data kepemilikan publik.
              </p>
            </div>
          )}

          {!isRedundantNote && data.note && (
            <p className="text-xs text-slash-fog font-sans leading-relaxed mt-auto mb-0">{data.note}</p>
          )}
    </section>
  );
};
