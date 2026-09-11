'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus, Minus, X } from 'lucide-react';
import { BrokerRow } from '@/types/investigate';
import { formatIDR } from '@/lib/formatters';
import { getBrokerInfo, BrokerMetadata } from '@/constants/brokerMetadata';
import { COPY } from '@/constants/copy';
import { useOverlayTransition } from '@/lib/useOverlayTransition';

interface BrokerAnalysisViewProps {
  topBuyers: BrokerRow[];
  topSellers: BrokerRow[];
  className?: string;
}

type ViewMode = 'split' | 'buyers' | 'sellers';

export const BrokerAnalysisView: React.FC<BrokerAnalysisViewProps> = ({
  topBuyers,
  topSellers,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [useCompact, setUseCompact] = useState(true);
  const [activeHoverBroker, setActiveHoverBroker] = useState<BrokerMetadata | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const { mounted: modalMounted, open: modalOpen } = useOverlayTransition(
    activeHoverBroker !== null
  );

  // Modal: Esc + focus trap + return focus
  useEffect(() => {
    if (!activeHoverBroker) return;
    prevFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveHoverBroker(null);
      }
      if (e.key === 'Tab') {
        const el = modalRef.current;
        if (!el) return;
        const focusable = el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    setTimeout(() => modalRef.current?.querySelector<HTMLElement>('button')?.focus(), 0);
    return () => {
      window.removeEventListener('keydown', handleKey);
      prevFocusRef.current?.focus?.();
    };
  }, [activeHoverBroker]);

  // Denominator is the rows the API returned, not the whole market. A "top 5 of
  // 5" ratio would always be 100%, so only the top-3 share is reported and the
  // coverage limit is stated next to it.
  const totalBuyValue = topBuyers.reduce((sum, b) => sum + b.buy_value, 0) || 1;
  const top3BuyValue = topBuyers.slice(0, 3).reduce((sum, b) => sum + b.buy_value, 0);
  const cr3BuyersPercent = Math.round((top3BuyValue / totalBuyValue) * 100);

  const totalSellValue = topSellers.reduce((sum, s) => sum + s.sell_value, 0) || 1;
  const top3SellValue = topSellers.slice(0, 3).reduce((sum, s) => sum + s.sell_value, 0);
  const cr3SellersPercent = Math.round((top3SellValue / totalSellValue) * 100);

  let foreignNet = 0;
  let domesticNet = 0;

  topBuyers.forEach((b) => {
    const meta = getBrokerInfo(b.broker_code, b.broker_name);
    if (meta.type === 'F') {
      foreignNet += b.net_value;
    } else {
      domesticNet += b.net_value;
    }
  });

  topSellers.forEach((s) => {
    const meta = getBrokerInfo(s.broker_code, s.broker_name);
    if (meta.type === 'F') {
      foreignNet += s.net_value;
    } else {
      domesticNet += s.net_value;
    }
  });

  const maxNetBuyer = Math.max(...topBuyers.map((d) => Math.abs(d.net_value)), 1);
  const maxNetSeller = Math.max(...topSellers.map((d) => Math.abs(d.net_value)), 1);

  // Toggle group rather than role="tablist": these buttons swap content in
  // place and never owned tabpanel semantics, so aria-pressed is the honest
  // mapping and keeps arrow-key expectations off the table.
  const tabBtn = (id: ViewMode, label: string) => (
    <button
      type="button"
      aria-pressed={viewMode === id}
      onClick={() => setViewMode(id)}
      className={`pressable px-3 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[30px] rounded-md font-sans text-xs cursor-pointer transition-colors duration-150 whitespace-nowrap inline-flex items-center justify-center ${
        viewMode === id
          ? 'bg-slash-paper text-slash-obsidian font-semibold'
          : 'text-slash-mist hover:text-slash-paper hover:bg-slash-carbon'
      }`}
    >
      {label}
    </button>
  );

  const renderBrokerTable = (type: 'buyers' | 'sellers', data: BrokerRow[], maxVal: number) => {
    const isBuyers = type === 'buyers';
    const showFullColumns = viewMode !== 'split';
    const netColWidth = showFullColumns
      ? (useCompact ? 'w-28 sm:w-36' : 'w-40 sm:w-48')
      : (useCompact ? 'w-24 sm:w-36' : 'w-44 sm:w-52');
    const buySellColWidth = useCompact ? 'w-24 sm:w-28' : 'w-36 sm:w-44';
    // Split + compact must fit a 375px viewport unaided: a min-width just wide
    // enough to force a 17px scroll clipped the "M" unit off every net value.
    // The name column truncates instead, which loses nothing.
    const tableMinWidth = showFullColumns
      ? (useCompact ? 'min-w-[560px]' : 'min-w-[760px]')
      : (useCompact ? 'min-w-0' : 'min-w-[460px]');

    return (
      <div className="border border-slash-graphite rounded-lg flex flex-col overflow-hidden bg-slash-obsidian">
        {/* The top-3 share already appears once in the summary above, so the
            header only names the table. */}
        <div className="px-3.5 sm:px-4 py-3 border-b border-slash-graphite flex items-center gap-2.5 bg-slash-onyx/40">
          {isBuyers ? (
            <ArrowUp size={14} strokeWidth={2.5} className="text-trade-buy shrink-0" aria-hidden="true" />
          ) : (
            <ArrowDown size={14} strokeWidth={2.5} className="text-trade-sell shrink-0" aria-hidden="true" />
          )}
          <h3 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em] truncate m-0">
            {isBuyers ? COPY.buyers_title : COPY.sellers_title}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table
            className={`w-full text-left border-collapse text-xs table-fixed ${tableMinWidth}`}
            aria-label={isBuyers ? 'Pembeli bersih' : 'Penjual bersih'}
          >
            <thead>
              <tr className="border-b border-slash-graphite text-slash-fog font-sans text-[11px]">
                <th scope="col" className="py-2.5 px-2 sm:px-3.5 w-9 sm:w-10 text-center">No</th>
                <th scope="col" className="py-2.5 px-2 sm:px-3.5">Sekuritas</th>
                {showFullColumns && (
                  <>
                    <th scope="col" className={`py-2.5 px-2 sm:px-3 text-right ${buySellColWidth}`}>Beli</th>
                    <th scope="col" className={`py-2.5 px-2 sm:px-3 text-right ${buySellColWidth}`}>Jual</th>
                  </>
                )}
                <th scope="col" className={`py-2.5 px-2.5 sm:px-3.5 text-right ${netColWidth}`}>
                  <span title={COPY.broker_section_hint}>Net</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slash-graphite/50 font-mono-numbers">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={showFullColumns ? 5 : 3} className="py-10 px-4 text-center font-sans">
                    <p className="text-sm text-slash-paper mb-1">Belum ada catatan transaksi</p>
                    <p className="text-xs text-slash-fog">Coba kode lain atau contoh BBCA.</p>
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const meta = getBrokerInfo(row.broker_code, row.broker_name);
                  const isPositive = row.net_value >= 0;
                  const isForeign = meta.type === 'F';
                  const concentrationPercent = Math.min(
                    Math.round((Math.abs(row.net_value) / maxVal) * 100),
                    100
                  );
                  const rowKey = row.broker_code || String(row.rank);
                  const isExpanded = expandedCode === `${type}-${rowKey}`;

                  return (
                    <React.Fragment key={`${type}-${rowKey}`}>
                      <tr className="row-hover">
                        <td className="py-3 px-2 sm:px-3.5 text-center text-slash-steel font-mono text-[11px] align-middle">
                          {row.rank}
                        </td>
                        <td className="py-3 px-2 sm:px-3.5 min-w-0 align-middle">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span
                              className={`font-sans text-[10px] sm:text-[11px] shrink-0 ${
                                isForeign ? 'text-slash-copper' : 'text-slash-fog'
                              }`}
                              title={isForeign ? 'Sekuritas asing' : 'Sekuritas domestik'}
                            >
                              {isForeign ? 'Asing' : 'Domestik'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveHoverBroker(meta)}
                              aria-haspopup="dialog"
                              aria-label={`Profil ${row.broker_code} ${row.broker_name}`}
                              className="pressable font-mono font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 min-h-[26px] sm:min-h-[28px] rounded-xs bg-slash-carbon text-slash-paper border border-slash-graphite text-[11px] cursor-pointer hover:border-slash-slate transition-colors duration-150 shrink-0"
                              title={meta.name}
                            >
                              {row.broker_code}
                            </button>
                            <span
                              className="font-sans text-xs sm:text-[13px] text-slash-bone truncate min-w-0 flex-1"
                              title={row.broker_name}
                            >
                              {row.broker_name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedCode(isExpanded ? null : `${type}-${rowKey}`)}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? `Sembunyikan rincian ${row.broker_code}` : `Tampilkan rincian ${row.broker_code}`}
                              className={`${showFullColumns ? 'sm:hidden' : ''} pressable ml-auto text-slash-mist hover:text-slash-paper w-7 h-7 inline-flex items-center justify-center rounded-xs cursor-pointer shrink-0 transition-colors duration-150`}
                            >
                              {isExpanded ? (
                                <Minus size={14} strokeWidth={2.5} aria-hidden="true" />
                              ) : (
                                <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                          {isExpanded && (
                            <dl className={`${showFullColumns ? 'sm:hidden' : ''} mt-2.5 space-y-1.5 text-xs font-mono border-t border-slash-graphite/50 pt-2.5`}>
                              <div className="flex justify-between items-center">
                                <dt className="text-slash-fog font-sans">{COPY.buy_label}</dt>
                                <dd className="text-slash-mist font-mono tabular-nums">{formatIDR(row.buy_value, useCompact)}</dd>
                              </div>
                              <div className="flex justify-between items-center">
                                <dt className="text-slash-fog font-sans">{COPY.sell_label}</dt>
                                <dd className="text-slash-mist font-mono tabular-nums">{formatIDR(row.sell_value, useCompact)}</dd>
                              </div>
                            </dl>
                          )}
                        </td>
                        {showFullColumns && (
                          <>
                            <td className={`py-3 px-2 sm:px-3 text-right text-slash-mist align-middle whitespace-nowrap font-mono tabular-nums ${
                              useCompact ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-[13px] tracking-tight'
                            }`}>
                              {formatIDR(row.buy_value, useCompact)}
                            </td>
                            <td className={`py-3 px-2 sm:px-3 text-right text-slash-mist align-middle whitespace-nowrap font-mono tabular-nums ${
                              useCompact ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-[13px] tracking-tight'
                            }`}>
                              {formatIDR(row.sell_value, useCompact)}
                            </td>
                          </>
                        )}
                        <td className="py-3 px-2.5 sm:px-3.5 text-right align-middle whitespace-nowrap">
                          <div className="inline-flex flex-col items-end gap-1">
                            <span
                              className={`font-mono font-medium tabular-nums ${
                                useCompact ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-[13px] tracking-tight font-semibold'
                              } ${isPositive ? 'text-trade-buy' : 'text-trade-sell'}`}
                            >
                              <span className="sr-only">{COPY.net_label}: </span>
                              {formatIDR(row.net_value, useCompact)}
                            </span>
                            <div
                              className="w-16 sm:w-20 bg-slash-graphite/40 h-1 rounded-full overflow-hidden"
                              aria-hidden="true"
                              title={`${concentrationPercent}% dari nilai terbesar`}
                            >
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isPositive ? 'bg-trade-buy' : 'bg-trade-sell'
                                }`}
                                style={{ width: `${concentrationPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <section aria-labelledby="broker-flow-heading" className={`space-y-5 ${className}`}>
      <div>
        <h2
          id="broker-flow-heading"
          className="text-sm font-sans font-semibold text-slash-paper tracking-[-0.01em] m-0"
        >
          Aliran broker
        </h2>
        <p className="text-[13px] text-slash-fog font-sans leading-relaxed mt-1 mb-0 max-w-[68ch]">
          {COPY.coverage_note}
        </p>
      </div>

      {/* Summary figures. Gold means money in, rose means money out —
          the interactive accent is copper so the hues never collide. */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 py-5 border-y border-slash-graphite m-0">
        <div>
          <dt className="text-xs font-sans text-slash-fog mb-1.5">{COPY.foreign_label} · neto</dt>
          <dd
            className={`font-mono text-lg sm:text-xl font-medium tabular-nums tracking-tight m-0 ${
              foreignNet >= 0 ? 'text-trade-buy' : 'text-trade-sell'
            }`}
          >
            {foreignNet >= 0 ? '+' : ''}
            {formatIDR(foreignNet, useCompact)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-sans text-slash-fog mb-1.5">{COPY.domestic_label} · neto</dt>
          <dd
            className={`font-mono text-lg sm:text-xl font-medium tabular-nums tracking-tight m-0 ${
              domesticNet >= 0 ? 'text-trade-buy' : 'text-trade-sell'
            }`}
          >
            {domesticNet >= 0 ? '+' : ''}
            {formatIDR(domesticNet, useCompact)}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs font-sans text-slash-fog mb-1.5">{COPY.cr_label}</dt>
          <dd className="font-mono text-lg sm:text-xl font-medium text-slash-paper tabular-nums m-0 flex items-baseline gap-3 flex-wrap">
            <span>
              {cr3BuyersPercent}%
              <span className="text-[11px] font-sans font-normal text-slash-fog ml-1.5">beli</span>
            </span>
            <span className="text-slash-steel font-normal text-sm" aria-hidden="true">
              /
            </span>
            <span>
              {cr3SellersPercent}%
              <span className="text-[11px] font-sans font-normal text-slash-fog ml-1.5">jual</span>
            </span>
          </dd>
          <p className="text-xs text-slash-fog font-sans leading-relaxed mt-1.5 mb-0 max-w-[46ch]">
            {COPY.cr_explain}
          </p>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Tampilan tabel">
          {tabBtn('split', 'Beli & jual')}
          {tabBtn('buyers', 'Pembeli')}
          {tabBtn('sellers', 'Penjual')}
        </div>

        <button
          type="button"
          onClick={() => setUseCompact((prev) => !prev)}
          aria-pressed={!useCompact}
          className="pressable px-3 py-1.5 min-h-[36px] sm:min-h-[30px] rounded-md border border-slash-graphite bg-slash-carbon text-slash-mist hover:text-slash-paper hover:border-slash-slate font-sans text-xs cursor-pointer transition-colors duration-150 whitespace-nowrap inline-flex items-center shrink-0"
        >
          {useCompact ? 'Tampilkan angka lengkap' : 'Tampilkan angka ringkas'}
        </button>
      </div>

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderBrokerTable('buyers', topBuyers, maxNetBuyer)}
          {renderBrokerTable('sellers', topSellers, maxNetSeller)}
        </div>
      )}

      {viewMode === 'buyers' && renderBrokerTable('buyers', topBuyers, maxNetBuyer)}
      {viewMode === 'sellers' && renderBrokerTable('sellers', topSellers, maxNetSeller)}

      {/* Broker detail modal */}
      {modalMounted && activeHoverBroker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Profil sekuritas ${activeHoverBroker.code}`}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-dim"
          data-open={modalOpen ? 'true' : 'false'}
          onClick={() => setActiveHoverBroker(null)}
        >
          {/* Escape and the Tab trap are handled by the window listener above;
              stopping keydown propagation here prevented both from firing. */}
          <div
            ref={modalRef}
            role="document"
            className="modal-panel w-full max-w-md bg-slash-onyx border border-slash-graphite rounded-lg p-5 sm:p-6 space-y-4"
            data-open={modalOpen ? 'true' : 'false'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-semibold text-base text-slash-paper">
                    {activeHoverBroker.code}
                  </span>
                  <span className="text-[11px] text-slash-mist font-sans">
                    {activeHoverBroker.type === 'F' ? 'Sekuritas asing' : 'Sekuritas domestik'}
                  </span>
                </div>
                <h4 className="text-sm font-sans text-slash-paper mt-1">{activeHoverBroker.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveHoverBroker(null)}
                aria-label="Tutup profil sekuritas"
                className="pressable text-slash-mist hover:text-slash-paper rounded-md cursor-pointer inline-flex items-center justify-center w-11 h-11 -mr-2 -mt-1 shrink-0 transition-colors duration-150"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-0 text-xs divide-y divide-slash-graphite/50">
              <div className="flex justify-between py-2.5">
                <span className="text-slash-fog">Kategori</span>
                <span className="font-mono text-slash-paper">{activeHoverBroker.category}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slash-fog">Tier</span>
                <span className="font-mono text-slash-paper">{activeHoverBroker.tier}</span>
              </div>
              <p className="text-slash-bone leading-relaxed pt-2.5">{activeHoverBroker.note}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
