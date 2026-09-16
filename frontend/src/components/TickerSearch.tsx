'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { COPY } from '@/constants/copy';
import { parseTicker, tickerErrorCopy } from '@/lib/ticker';

interface TickerSearchProps {
  onInvestigate: (ticker: string) => void;
  isLoading: boolean;
  initialTicker?: string;
  onOpenCommandDialog?: () => void;
}

export const TickerSearch: React.FC<TickerSearchProps> = ({
  onInvestigate,
  isLoading,
  initialTicker = 'BBCA',
  onOpenCommandDialog,
}) => {
  const [ticker, setTicker] = useState(initialTicker);
  const [prevInitialTicker, setPrevInitialTicker] = useState(initialTicker);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (initialTicker !== prevInitialTicker) {
    setPrevInitialTicker(initialTicker);
    if (initialTicker) {
      setTicker(initialTicker);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onOpenCommandDialog) {
          onOpenCommandDialog();
        } else {
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      } else if (e.key === 'Escape' && isInputActive) {
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandDialog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parsed = parseTicker(ticker);
    if (!parsed.ok) {
      setErrorMsg(tickerErrorCopy(parsed.reason));
      return;
    }
    setErrorMsg(null);
    onInvestigate(parsed.ticker);
  };

  const handleSelectQuick = (symbol: string) => {
    setTicker(symbol);
    setErrorMsg(null);
    onInvestigate(symbol);
  };

  const handleClear = () => {
    setTicker('');
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  const chipClass =
    'pressable px-2.5 min-h-[32px] rounded border border-slash-graphite bg-slash-carbon/80 hover:border-slash-copper/60 hover:text-slash-paper focus-visible:ring-1 focus-visible:ring-slash-copper focus-visible:outline-none text-slash-mist font-mono text-[11px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 inline-flex items-center';

  const submitLabel = isLoading
    ? COPY.loading
    : ticker.trim()
      ? `${COPY.cta_investigate} ${ticker.trim().toUpperCase()}`
      : COPY.cta_investigate;

  return (
    <div className="w-full space-y-3">
      <form
        role="search"
        method="dialog"
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row sm:items-stretch gap-2 w-full"
      >
        <label htmlFor="ticker-search-input" className="sr-only">
          Kode efek saham IDX
        </label>
        <div className="relative flex-1 flex items-center rounded-md bg-slash-carbon border border-slash-graphite focus-within:border-slash-copper focus-within:ring-1 focus-within:ring-slash-copper/30 transition-[border-color,box-shadow] duration-150">
          <Search
            size={15}
            strokeWidth={2}
            className="ml-3.5 sm:ml-4 text-slash-steel shrink-0"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id="ticker-search-input"
            type="text"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder={COPY.ticker_placeholder}
            disabled={isLoading}
            maxLength={10}
            autoComplete="off"
            spellCheck={false}
            aria-label="Kode efek saham IDX"
            aria-invalid={errorMsg ? 'true' : undefined}
            aria-describedby={errorMsg ? 'ticker-error ticker-hint' : 'ticker-hint'}
            className="w-full pl-3 pr-12 py-3.5 sm:py-3 bg-transparent text-slash-paper placeholder-slash-steel font-mono text-base sm:text-[15px] font-semibold uppercase tracking-wide focus:outline-none disabled:opacity-50"
          />

          <div className="absolute right-2 flex items-center">
            {ticker && !isLoading ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Kosongkan kode"
                className="pressable text-slash-mist hover:text-slash-paper w-9 h-9 inline-flex items-center justify-center rounded-md cursor-pointer transition-colors duration-150"
              >
                <X size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            ) : (
              <kbd className="hidden md:inline-block font-mono text-[10px] text-slash-mist px-1.5 py-0.5 rounded-sm border border-slash-graphite select-none">
                /
              </kbd>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="pressable inline-flex items-center justify-center px-5 min-h-[44px] sm:min-h-0 rounded-md bg-slash-paper text-slash-obsidian font-sans font-medium text-sm hover:bg-slash-bone focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150 whitespace-nowrap"
        >
          {submitLabel}
        </button>
      </form>

      {errorMsg ? (
        <p id="ticker-error" className="text-[13px] text-status-error font-sans leading-relaxed m-0" role="alert">
          {errorMsg}
        </p>
      ) : (
        <span id="ticker-hint" className="sr-only">
          {COPY.search_hint}
        </span>
      )}

      {/* One row of entry points: quick codes for the common case, full search
          for everything else. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-[11px] font-sans text-slash-steel select-none shrink-0">
          Sering dilihat
        </span>
        {['BBCA', 'BBRI', 'TLKM', 'GOTO'].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => handleSelectQuick(code)}
            disabled={isLoading}
            className={chipClass}
          >
            {code}
          </button>
        ))}

        {onOpenCommandDialog && (
          <button
            type="button"
            onClick={onOpenCommandDialog}
            className="pressable text-[11px] font-sans px-1.5 min-h-[32px] rounded text-slash-mist hover:text-slash-paper focus-visible:ring-1 focus-visible:ring-slash-copper focus-visible:outline-none cursor-pointer transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            {COPY.cta_view_all}
            <kbd className="hidden sm:inline font-mono text-[10px] text-slash-steel border border-slash-graphite rounded-xs px-1 py-0.5">
              ⌘K
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
};
