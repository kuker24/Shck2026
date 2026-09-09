'use client';

import React, { useState, useEffect, useRef } from 'react';
import { COPY } from '@/constants/copy';
import { InvestigationMode, InvestigateResponse, Step } from '@/types/investigate';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { ModeBadge } from '@/components/ModeBadge';
import { TickerSearch } from '@/components/TickerSearch';
import { StepsTimeline } from '@/components/StepsTimeline';
import { BrokerAnalysisView } from '@/components/BrokerAnalysisView';
import { FreeFloatCard } from '@/components/FreeFloatCard';
import { NarrativePanel } from '@/components/NarrativePanel';
import { EmptyState } from '@/components/EmptyState';
import { Toast } from '@/components/Toast';
import { MarketStatusBar } from '@/components/MarketStatusBar';
import { TickerCommandDialog } from '@/components/TickerCommandDialog';
import { AuditDrawer } from '@/components/AuditDrawer';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { runInvestigation } from '@/services/investigateService';

export default function HomePage() {
  const [ticker, setTicker] = useState<string>('BBCA');
  const [selectedMode, setSelectedMode] = useState<InvestigationMode>('mock');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liveSteps, setLiveSteps] = useState<Step[] | null>(null);
  const [result, setResult] = useState<InvestigateResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const requestSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

      if (isInputActive) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setIsAuditDrawerOpen((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        setSelectedMode('mock');
      } else if (e.key === '2') {
        e.preventDefault();
        setSelectedMode('cache');
      } else if (e.key === '3') {
        e.preventDefault();
        setSelectedMode('live');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleInvestigate = async (targetTicker: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const seq = ++requestSeqRef.current;
    const mode = selectedMode;

    setIsLoading(true);
    setTicker(targetTicker);
    setResult(null);
    setLiveSteps(null);

    try {
      const res = await runInvestigation(
        { ticker: targetTicker, mode },
        (progressSteps) => {
          if (seq !== requestSeqRef.current) return;
          setLiveSteps(progressSteps);
        },
        controller.signal
      );

      if (seq !== requestSeqRef.current) return;

      if (mode === 'live' && res.mode !== 'live') {
        setToastMessage(COPY.toast_live_fail);
      } else if (mode === 'cache' && res.mode !== 'cache') {
        setToastMessage(COPY.toast_cache_miss);
      }

      setResult(res);
    } catch (err: unknown) {
      if (controller.signal.aborted || seq !== requestSeqRef.current) return;
      console.error('Investigate error:', err);
      setToastMessage('Gagal memeriksa kode efek');
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }
  };

  const buyers = result?.brokers?.top_buyers ?? [];
  const sellers = result?.brokers?.top_sellers ?? [];
  const hasEmptyOrError = Boolean(
    result && (result.error || (buyers.length === 0 && sellers.length === 0))
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slash-obsidian text-slash-bone">
      {/* ── Header: 56px, sticky ── */}
      <header className="border-b border-slash-graphite bg-slash-obsidian sticky top-0 z-40">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 min-h-14 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-serif text-[20px] tracking-[-0.01em] text-slash-paper font-medium shrink-0 select-none">
            Aegis<span className="text-slash-copper font-sans text-[15px] ml-0.5">·IDX</span>
          </span>

          <div className="min-w-0 order-3 sm:order-2 basis-full sm:basis-auto">
            <MarketStatusBar />
          </div>

          <nav aria-label="Mode dan jejak" className="ml-auto flex items-center gap-2 order-2 sm:order-3">
            <div className="hidden md:block">
              <ModeBadge
                mode={selectedMode}
                creditEstimate={result?.credit_estimate}
                interactive={!isLoading}
                onModeChange={(m) => setSelectedMode(m)}
              />
            </div>
            <div className="md:hidden">
              <ModeBadge
                mode={selectedMode}
                interactive={!isLoading}
                onModeChange={(m) => setSelectedMode(m)}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAuditDrawerOpen(false);
                setIsCommandOpen(false);
                setIsShortcutsOpen(true);
              }}
              aria-label="Pintasan keyboard"
              className="pressable hidden sm:inline-flex items-center justify-center min-h-[32px] min-w-[32px] rounded-md bg-slash-carbon border border-slash-graphite text-[11px] font-mono text-slash-mist hover:text-slash-paper hover:border-slash-slate focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none cursor-pointer"
            >
              ?
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCommandOpen(false);
                setIsShortcutsOpen(false);
                setIsAuditDrawerOpen(true);
              }}
              className="pressable text-[11px] font-sans px-3 py-1 min-h-[44px] sm:min-h-[32px] rounded-md bg-slash-carbon border border-slash-graphite text-slash-mist hover:text-slash-paper hover:border-slash-slate focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:ring-offset-2 focus-visible:ring-offset-slash-obsidian focus-visible:outline-none cursor-pointer transition-colors duration-150"
            >
              Jejak
            </button>
          </nav>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full flex-1 flex flex-col">
        <div className="max-w-[900px] mx-auto w-full flex flex-col gap-8">
          <DisclaimerBanner variant="compact" />

          <TickerSearch
            onInvestigate={handleInvestigate}
            isLoading={isLoading}
            initialTicker={ticker}
            onOpenCommandDialog={() => {
              setIsAuditDrawerOpen(false);
              setIsShortcutsOpen(false);
              setIsCommandOpen(true);
            }}
          />

          {isLoading && (
            <div aria-live="polite" aria-label="Pemeriksaan berjalan">
              {liveSteps ? (
                <StepsTimeline steps={liveSteps} />
              ) : (
                <div className="border border-slash-graphite rounded-lg p-5 sm:p-6 space-y-3" aria-hidden="true">
                  <div className="skeleton h-4 w-32" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div className="skeleton h-24" />
                    <div className="skeleton h-24" />
                    <div className="skeleton h-24 hidden sm:block" />
                    <div className="skeleton h-24 hidden lg:block" />
                  </div>
                </div>
              )}
            </div>
          )}

          {result && !isLoading && (
            <>
              {hasEmptyOrError ? (
                <EmptyState
                  ticker={result.ticker}
                  errorMessage={result.error?.message}
                  steps={result.steps}
                  onReset={() => {
                    setResult(null);
                    setLiveSteps(null);
                  }}
                  onTryBBCA={() => handleInvestigate('BBCA')}
                />
              ) : (
                <div className="result-enter flex flex-col gap-8">
                  <StepsTimeline steps={result.steps} />
                  <BrokerAnalysisView
                    topBuyers={buyers}
                    topSellers={sellers}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FreeFloatCard data={result.free_float} />
                    <NarrativePanel
                      narrative={result.narrative}
                      ticker={result.ticker}
                      onCopySuccess={() => setToastMessage(COPY.toast_copied)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {!result && !isLoading && (
            <p className="text-sm text-slash-mist max-w-[65ch] leading-relaxed">
              {COPY.idle_hint}{' '}
              <kbd className="font-mono text-[11px] text-slash-paper bg-slash-carbon px-1.5 py-0.5 rounded-sm border border-slash-graphite">
                Ctrl/⌘K
              </kbd>
            </p>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slash-graphite mt-auto">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-serif text-sm text-slash-mist select-none shrink-0">Aegis<span className="text-slash-copper font-sans text-[11px] ml-0.5">·IDX</span></span>
          <p className="text-[11px] text-slash-mist leading-relaxed max-w-[65ch]">
            {COPY.disclaimer_long}
          </p>
        </div>
      </footer>

      {/* ── Overlays ── */}
      <TickerCommandDialog
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTicker={(selected) => {
          setTicker(selected);
          handleInvestigate(selected);
        }}
        currentTicker={ticker}
      />

      <AuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        result={result}
        selectedMode={selectedMode}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
