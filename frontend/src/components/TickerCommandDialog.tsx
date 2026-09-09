'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IDX_TICKERS, IDXTicker } from '@/constants/idxTickers';
import { COPY } from '@/constants/copy';
import { parseTicker, tickerErrorCopy } from '@/lib/ticker';

interface TickerCommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (code: string) => void;
  currentTicker?: string;
}

type SectorFilter = 'Semua' | 'Perbankan' | 'Telko & Teknologi' | 'Energi & Tambang' | 'Konglomerasi' | 'Konsumer' | 'Diagnostik';

const SECTOR_TABS: readonly SectorFilter[] = [
  'Semua',
  'Perbankan',
  'Telko & Teknologi',
  'Energi & Tambang',
  'Konglomerasi',
  'Konsumer',
  'Diagnostik',
];

export const TickerCommandDialog: React.FC<TickerCommandDialogProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
  currentTicker,
}) => {
  const [query, setQuery] = useState('');
  const [activeSector, setActiveSector] = useState<SectorFilter>('Semua');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setQuery('');
      setActiveSector('Semua');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      prevFocusRef.current?.focus?.();
    }
  }, [isOpen]);

  // Focus trap inside dialog
  useEffect(() => {
    if (!isOpen) return;
    const el = panelRef.current;
    if (!el) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
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
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [isOpen]);

  const filteredTickers = IDX_TICKERS.filter((item) => {
    const matchesSector = activeSector === 'Semua' || item.sector === activeSector;
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return matchesSector;

    const matchesCode = item.code.toUpperCase().includes(cleanQuery);
    const matchesName = item.name.toUpperCase().includes(cleanQuery);
    const matchesNote = item.note ? item.note.toUpperCase().includes(cleanQuery) : false;

    return matchesSector && (matchesCode || matchesName || matchesNote);
  });

  // Scroll selected item into view
  const scrollToSelected = useCallback((index: number) => {
    const listEl = listRef.current;
    if (!listEl) return;
    const items = listEl.querySelectorAll('[data-cmd-item]');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev + 1 < filteredTickers.length ? prev + 1 : 0;
          scrollToSelected(next);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev - 1 >= 0 ? prev - 1 : filteredTickers.length - 1;
          scrollToSelected(next);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTickers[selectedIndex]) {
          onSelectTicker(filteredTickers[selectedIndex].code);
          onClose();
        } else if (query.trim()) {
          const parsed = parseTicker(query);
          if (!parsed.ok) return;
          onSelectTicker(parsed.ticker);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTickers, selectedIndex, query, onSelectTicker, onClose, scrollToSelected]);

  useEffect(() => {
    if (selectedIndex >= filteredTickers.length) {
      setSelectedIndex(0);
    }
  }, [filteredTickers.length, selectedIndex]);

  if (!isOpen) return null;

  const parsedQuery = parseTicker(query);
  const activeDescendantId = filteredTickers[selectedIndex]
    ? `cmd-item-${filteredTickers[selectedIndex].code}`
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cari kode efek"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overlay-dim"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-2xl bg-slash-onyx border border-slash-graphite rounded-lg overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="relative border-b border-slash-graphite px-4 py-3.5 flex items-center bg-slash-carbon">
          <span className="text-[11px] font-sans text-slash-mist mr-3 shrink-0">{COPY.ticker_label}</span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-listbox"
            aria-autocomplete="list"
            aria-label="Cari kode efek, nama perusahaan, atau sektor"
            aria-activedescendant={activeDescendantId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Kode, nama, atau sektor"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-slash-paper placeholder-slash-steel text-sm font-mono font-medium focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Kosongkan pencarian"
              className="pressable text-slash-mist hover:text-slash-paper text-sm font-sans min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] inline-flex items-center justify-center rounded-sm cursor-pointer"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : (
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-slash-steel border border-slash-graphite px-1.5 py-0.5 rounded-sm select-none">
              Esc
            </kbd>
          )}
        </div>

        {/* Sector tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-slash-graphite overflow-x-auto" role="group" aria-label="Filter sektor">
          {SECTOR_TABS.map((sector) => (
            <button
              key={sector}
              type="button"
              aria-pressed={activeSector === sector}
              onClick={() => {
                setActiveSector(sector);
                setSelectedIndex(0);
              }}
              className={`pressable px-3 py-1.5 min-h-[44px] sm:min-h-[32px] rounded-md text-[11px] font-sans whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                activeSector === sector
                  ? 'bg-slash-paper text-slash-obsidian font-medium'
                  : 'text-slash-fog hover:text-slash-paper'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          id="cmd-listbox"
          role="listbox"
          className="overflow-y-auto p-1.5 flex-1 min-h-[220px]"
        >
          {filteredTickers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slash-paper mb-1">
                Tidak ada emiten untuk &ldquo;{query}&rdquo;
              </p>
              {parsedQuery.ok ? (
                <>
                  <p className="text-xs text-slash-fog mb-5">Enter untuk memeriksa kode ini.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTicker(parsedQuery.ticker);
                      onClose();
                    }}
                    className="pressable px-4 py-2.5 rounded-md bg-slash-paper text-slash-obsidian font-sans text-sm font-medium cursor-pointer"
                  >
                    {COPY.cta_investigate} {parsedQuery.ticker}
                  </button>
                </>
              ) : (
                <p className="text-xs text-slash-fog">
                  {query.trim() ? tickerErrorCopy(parsedQuery.reason) : COPY.search_hint}
                </p>
              )}
            </div>
          ) : (
            filteredTickers.map((item: IDXTicker, idx: number) => {
              const isSelected = idx === selectedIndex;
              const isCurrent = currentTicker === item.code;

              return (
                <button
                  key={item.code}
                  type="button"
                  id={`cmd-item-${item.code}`}
                  role="option"
                  aria-selected={isSelected}
                  data-cmd-item
                  onClick={() => {
                    onSelectTicker(item.code);
                    onClose();
                  }}
                  onFocus={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-md cursor-pointer flex items-center justify-between gap-3 transition-colors duration-75 ${
                    isSelected
                      ? 'bg-slash-carbon'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="font-mono font-semibold text-sm px-2 py-1 rounded-sm bg-slash-obsidian text-slash-paper border border-slash-graphite">
                        {item.code}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-sans text-slash-copper mt-1">
                          Sekarang
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-sm font-sans text-slash-paper truncate block">
                        {item.name}
                      </span>
                      {item.note && (
                        <p className="text-[11px] text-slash-fog truncate">{item.note}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                    <span className="text-[11px] font-sans text-slash-mist">{item.sector}</span>
                    <span className="text-[10px] font-mono text-slash-steel">{item.marketCapTier}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2.5 bg-slash-carbon border-t border-slash-graphite flex flex-wrap items-center justify-between gap-2 text-[11px] text-slash-mist font-sans">
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px]">
            <kbd className="px-1.5 py-0.5 rounded-sm border border-slash-graphite">↑↓</kbd>
            <span className="mr-2">pilih</span>
            <kbd className="px-1.5 py-0.5 rounded-sm border border-slash-graphite">Enter</kbd>
            <span className="mr-2">buka</span>
            <kbd className="px-1.5 py-0.5 rounded-sm border border-slash-graphite">Esc</kbd>
            <span>tutup</span>
          </div>
          <span className="sm:hidden">Ketuk emiten untuk memeriksa</span>
          <span aria-live="polite">{filteredTickers.length} emiten</span>
        </div>
      </div>
    </div>
  );
};
