'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BrokerRow } from '@/types/investigate';
import { formatIDR } from '@/lib/formatters';
import { getBrokerInfo, BrokerMetadata } from '@/constants/brokerMetadata';
import { COPY } from '@/constants/copy';

interface BrokerAnalysisViewProps {
  topBuyers: BrokerRow[];
  topSellers: BrokerRow[];
  className?: string;
}

type ViewMode = 'split' | 'buyers' | 'sellers' | 'matrix';

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

  const totalBuyValue = topBuyers.reduce((sum, b) => sum + b.buy_value, 0) || 1;
  const top3BuyValue = topBuyers.slice(0, 3).reduce((sum, b) => sum + b.buy_value, 0);
  const top5BuyValue = topBuyers.slice(0, 5).reduce((sum, b) => sum + b.buy_value, 0);
  const cr3BuyersPercent = Math.round((top3BuyValue / totalBuyValue) * 100);
  const cr5BuyersPercent = Math.round((top5BuyValue / totalBuyValue) * 100);

  const totalSellValue = topSellers.reduce((sum, s) => sum + s.sell_value, 0) || 1;
  const top3SellValue = topSellers.slice(0, 3).reduce((sum, s) => sum + s.sell_value, 0);
  const top5SellValue = topSellers.slice(0, 5).reduce((sum, s) => sum + s.sell_value, 0);
  const cr3SellersPercent = Math.round((top3SellValue / totalSellValue) * 100);
  const cr5SellersPercent = Math.round((top5SellValue / totalSellValue) * 100);

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

  const tabBtn = (id: ViewMode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={viewMode === id}
      onClick={() => setViewMode(id)}
      className={`pressable px-3 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-md font-sans text-xs cursor-pointer transition-colors duration-150 whitespace-nowrap inline-flex items-center justify-center ${
        viewMode === id
          ? 'bg-slash-paper text-slash-obsidian font-semibold shadow-xs'
          : 'text-slash-fog hover:text-slash-paper hover:bg-slash-carbon/50'
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
      : (useCompact ? 'w-28 sm:w-36' : 'w-44 sm:w-52');
    const buySellColWidth = useCompact ? 'w-24 sm:w-28' : 'w-36 sm:w-44';
    const tableMinWidth = showFullColumns
      ? (useCompact ? 'min-w-[560px]' : 'min-w-[760px]')
      : (useCompact ? 'min-w-[360px]' : 'min-w-[460px]');

    return (
      <div className="border border-slash-graphite rounded-lg flex flex-col overflow-hidden bg-slash-obsidian">
        <div className="px-3.5 sm:px-4 py-3 border-b border-slash-graphite flex items-center justify-between gap-3 bg-slash-onyx/40">
          <h3 className="text-xs sm:text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em] whitespace-nowrap truncate">
            {isBuyers ? COPY.buyers_title : COPY.sellers_title}
          </h3>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slash-mist bg-slash-carbon px-2 py-0.5 rounded border border-slash-graphite/60 whitespace-nowrap shrink-0">
            <span className="text-slash-fog font-sans text-[10px]">Top 3:</span>
            <span className="font-semibold text-slash-paper">{isBuyers ? cr3BuyersPercent : cr3SellersPercent}%</span>
          </span>
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
                <th scope="col" className={`py-2.5 px-2.5 sm:px-3.5 text-right ${netColWidth}`}>Net</th>
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
                              className={`${showFullColumns ? 'sm:hidden' : ''} pressable ml-auto text-slash-mist hover:text-slash-paper font-mono text-xs w-6 h-6 inline-flex items-center justify-center rounded-xs cursor-pointer shrink-0`}
                            >
                              <span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
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
    <section aria-label="Aliran broker" className={`space-y-5 ${className}`}>
      <p className="text-sm text-slash-mist font-serif leading-relaxed">{COPY.broker_section_hint}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Tampilan tabel">
          {tabBtn('split', 'Beli & jual')}
          {tabBtn('buyers', 'Pembeli')}
          {tabBtn('sellers', 'Penjual')}
          {tabBtn('matrix', 'Konsentrasi')}
        </div>

        <div
          className="inline-flex items-center p-1 rounded-lg bg-slash-carbon border border-slash-graphite shrink-0"
          role="group"
          aria-label="Format angka"
        >
          <button
            type="button"
            onClick={() => setUseCompact(true)}
            aria-pressed={useCompact}
            title="Tampilkan angka ringkas, contoh Rp 125,0 M"
            className={`pressable px-3 py-1.5 min-h-[32px] sm:min-h-[28px] rounded-md font-sans text-xs font-medium cursor-pointer transition-all duration-150 whitespace-nowrap inline-flex items-center gap-1.5 ${
              useCompact
                ? 'bg-slash-graphite text-slash-paper shadow-xs font-semibold'
                : 'text-slash-fog hover:text-slash-paper'
            }`}
          >
            <span>Angka ringkas</span>
          </button>
          <button
            type="button"
            onClick={() => setUseCompact(false)}
            aria-pressed={!useCompact}
            title="Tampilkan angka lengkap, contoh Rp 125.000.000.000"
            className={`pressable px-3 py-1.5 min-h-[32px] sm:min-h-[28px] rounded-md font-sans text-xs font-medium cursor-pointer transition-all duration-150 whitespace-nowrap inline-flex items-center gap-1.5 ${
              !useCompact
                ? 'bg-slash-graphite text-slash-paper shadow-xs font-semibold'
                : 'text-slash-fog hover:text-slash-paper'
            }`}
          >
            <span>Angka lengkap</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-4 border-y border-slash-graphite">
        <div>
          <div className="text-xs font-sans font-medium text-slash-mist mb-1.5">{COPY.foreign_label} · neto</div>
          <div className={`font-mono text-base sm:text-lg font-medium tabular-nums tracking-tight ${foreignNet >= 0 ? 'text-trade-buy' : 'text-trade-sell'}`}>
            {foreignNet >= 0 ? '+' : ''}{formatIDR(foreignNet, useCompact)}
          </div>
        </div>
        <div>
          <div className="text-xs font-sans font-medium text-slash-mist mb-1.5">{COPY.domestic_label} · neto</div>
          <div className={`font-mono text-base sm:text-lg font-medium tabular-nums tracking-tight ${domesticNet >= 0 ? 'text-trade-buy' : 'text-trade-sell'}`}>
            {domesticNet >= 0 ? '+' : ''}{formatIDR(domesticNet, useCompact)}
          </div>
        </div>
        <div>
          <div className="text-xs font-sans font-medium text-slash-mist mb-1.5">Porsi 3 &amp; 5 besar pembeli</div>
          <div className="font-mono text-xl font-medium text-slash-paper tabular-nums">
            {cr3BuyersPercent}% <span className="text-xs text-slash-mist font-normal">/ {cr5BuyersPercent}%</span>
          </div>
          <details className="mt-2 text-xs text-slash-mist font-sans">
            <summary className="cursor-pointer hover:text-slash-paper text-slash-copper min-h-[32px] inline-flex items-center font-medium">Apa artinya?</summary>
            <p className="mt-1.5 text-xs text-slash-bone leading-relaxed max-w-[65ch] bg-slash-carbon/80 p-2.5 rounded border border-slash-graphite">{COPY.cr_explain}</p>
          </details>
        </div>
      </div>

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderBrokerTable('buyers', topBuyers, maxNetBuyer)}
          {renderBrokerTable('sellers', topSellers, maxNetSeller)}
        </div>
      )}

      {viewMode === 'buyers' && renderBrokerTable('buyers', topBuyers, maxNetBuyer)}
      {viewMode === 'sellers' && renderBrokerTable('sellers', topSellers, maxNetSeller)}

      {viewMode === 'matrix' && (
        <div className="border border-slash-graphite rounded-lg p-5 sm:p-6 space-y-5">
          <h3 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em]">Konsentrasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs text-slash-fog font-sans">{COPY.buyers_title}</span>
              <div className="space-y-2.5 text-xs font-mono-numbers">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slash-fog">3 besar / daftar</span>
                    <span className="text-slash-paper">{cr3BuyersPercent}%</span>
                  </div>
                  <div className="w-full bg-slash-carbon h-1.5 rounded-xs overflow-hidden">
                    <div className="bg-trade-buy h-full rounded-xs" style={{ width: `${cr3BuyersPercent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slash-fog">5 besar / daftar</span>
                    <span className="text-slash-paper">{cr5BuyersPercent}%</span>
                  </div>
                  <div className="w-full bg-slash-carbon h-1.5 rounded-xs overflow-hidden">
                    <div className="bg-trade-buy/70 h-full rounded-xs" style={{ width: `${cr5BuyersPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-xs text-slash-fog font-sans">{COPY.sellers_title}</span>
              <div className="space-y-2.5 text-xs font-mono-numbers">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slash-fog">3 besar / daftar</span>
                    <span className="text-slash-paper">{cr3SellersPercent}%</span>
                  </div>
                  <div className="w-full bg-slash-carbon h-1.5 rounded-xs overflow-hidden">
                    <div className="bg-trade-sell h-full rounded-xs" style={{ width: `${cr3SellersPercent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slash-fog">5 besar / daftar</span>
                    <span className="text-slash-paper">{cr5SellersPercent}%</span>
                  </div>
                  <div className="w-full bg-slash-carbon h-1.5 rounded-xs overflow-hidden">
                    <div className="bg-trade-sell/70 h-full rounded-xs" style={{ width: `${cr5SellersPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broker detail modal */}
      {activeHoverBroker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Profil sekuritas ${activeHoverBroker.code}`}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-dim"
          onClick={() => setActiveHoverBroker(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setActiveHoverBroker(null);
          }}
        >
          <div
            ref={modalRef}
            role="document"
            className="modal-panel w-full max-w-md bg-slash-onyx border border-slash-graphite rounded-lg p-5 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
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
                className="pressable text-slash-mist hover:text-slash-paper font-sans text-xs px-3 py-2 min-h-[44px] min-w-[44px] rounded-md cursor-pointer inline-flex items-center justify-center"
              >
                {COPY.cta_close}
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
