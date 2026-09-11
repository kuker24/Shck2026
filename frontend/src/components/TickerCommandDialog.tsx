'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { IDX_TICKERS, IDXTicker } from '@/constants/idxTickers';
import { COPY } from '@/constants/copy';
import { parseTicker, tickerErrorCopy } from '@/lib/ticker';
import { useOverlayTransition } from '@/lib/useOverlayTransition';

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
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const { mounted, open } = useOverlayTransition(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setActiveSector('Semua');
      setSelectedIndex(0);
    }
  }

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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

  if (filteredTickers.length > 0 && selectedIndex >= filteredTickers.length) {
    setSelectedIndex(0);
  }

  if (!mounted) return null;

  const parsedQuery = parseTicker(query);
  const activeDescendantId = filteredTickers[selectedIndex]
    ? `cmd-item-${filteredTickers[selectedIndex].code}`
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cari kode efek"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overlay-dim"
      data-open={open ? 'true' : 'false'}
      onClick={onClose}
    >
      {/* No onKeyDown here or on the panel: keyboard handling lives in the
          window listener above. Stopping propagation on the panel prevented
          the native event from ever reaching it, which broke Escape and the
          arrow-key navigation. */}
      <div
        ref={panelRef}
        role="document"
        className="command-panel w-full max-w-2xl bg-slash-onyx border border-slash-slate rounded-lg overflow-hidden flex flex-col max-h-[80vh]"
        data-open={open ? 'true' : 'false'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slash-graphite px-4 sm:px-5 py-3.5 flex items-center bg-slash-carbon/60 gap-3">
          <Search size={15} strokeWidth={2} className="text-slash-steel shrink-0" aria-hidden="true" />
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
            placeholder="Cari kode atau nama emiten"
            autoComplete="off"
            spellCheck={false}
            className="w-full min-h-[32px] bg-transparent text-slash-paper placeholder-slash-steel text-sm font-sans focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Kosongkan pencarian"
              className="pressable text-slash-mist hover:text-slash-paper w-8 h-8 inline-flex items-center justify-center rounded-md cursor-pointer shrink-0 transition-colors duration-150"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block font-mono text-[11px] text-slash-mist border border-slash-slate px-1.5 py-0.5 rounded-xs select-none shrink-0">
              Esc
            </kbd>
          )}
        </div>

        <div className="flex items-center gap-4 px-6 py-2.5 border-b border-slash-graphite overflow-x-auto text-xs" role="group" aria-label="Filter sektor">
          {SECTOR_TABS.map((sector) => (
            <button
              key={sector}
              type="button"
              aria-pressed={activeSector === sector}
              onClick={() => {
                setActiveSector(sector);
                setSelectedIndex(0);
              }}
              className={`pressable py-1 font-sans whitespace-nowrap cursor-pointer transition-colors duration-150 border-b ${
                activeSector === sector
                  ? 'border-slash-copper text-slash-paper font-medium'
                  : 'border-transparent text-slash-fog hover:text-slash-bone'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>

        <div
          ref={listRef}
          id="cmd-listbox"
          role="listbox"
          aria-label="Hasil pencarian emiten"
          className="overflow-y-auto flex-1 min-h-[220px] divide-y divide-slash-graphite/40"
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
                    className="pressable px-4 py-2 rounded-xs bg-slash-paper text-slash-obsidian font-mono text-xs font-medium cursor-pointer"
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
                <div
                  key={item.code}
                  id={`cmd-item-${item.code}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`${item.code}, ${item.name}, sektor ${item.sector}`}
                  data-cmd-item
                  onClick={() => {
                    onSelectTicker(item.code);
                    onClose();
                  }}
                  onMouseMove={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 sm:px-6 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors duration-100 ${
                    isSelected ? 'bg-slash-carbon' : 'text-slash-mist'
                  }`}
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono font-semibold text-xs text-slash-copper bg-slash-carbon border border-slash-graphite px-1.5 py-0.5 rounded shrink-0">
                      {item.code}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-slash-copper shrink-0">
                        Aktif
                      </span>
                    )}
                    <span className="text-sm font-sans truncate text-slash-bone">{item.name}</span>
                  </div>
                  <span className="text-xs font-sans text-slash-fog shrink-0 hidden sm:inline">
                    {item.sector}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-2.5 bg-slash-carbon/60 border-t border-slash-graphite flex items-center justify-between text-[11px] text-slash-fog">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center">
              <kbd className="font-mono text-[10px] text-slash-bone bg-slash-obsidian border border-slash-slate px-1.5 py-0.5 rounded mr-1">↑↓</kbd> telusuri
            </span>
            <span className="inline-flex items-center">
              <kbd className="font-mono text-[10px] text-slash-bone bg-slash-obsidian border border-slash-slate px-1.5 py-0.5 rounded mr-1">↵</kbd> periksa
            </span>
            <span className="inline-flex items-center">
              <kbd className="font-mono text-[10px] text-slash-bone bg-slash-obsidian border border-slash-slate px-1.5 py-0.5 rounded mr-1">Esc</kbd> tutup
            </span>
          </div>
          <span className="font-mono text-slash-mist text-[11px] tabular-nums">
            {filteredTickers.length} emiten IDX
          </span>
        </div>
      </div>
    </div>
  );
};
