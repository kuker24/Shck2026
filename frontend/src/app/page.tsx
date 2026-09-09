'use client';

import React, { useState, useEffect, useRef } from 'react';
import { COPY } from '@/constants/copy';
import { InvestigationMode, InvestigateResponse, Step } from '@/types/investigate';
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
    <div className="page-root-v3 min-h-[100dvh] flex flex-col bg-slash-obsidian text-slash-bone">
      <header className="border-b border-slash-graphite bg-slash-onyx sticky top-0 z-40">
            <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 min-h-14 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0 select-none">
                <span className="font-sans text-sm font-bold tracking-[0.08em] uppercase text-slash-paper">
                  Aegis
                </span>
                <span className="text-slash-gilded font-mono text-[11px] font-semibold border border-slash-graphite px-1.5 py-0.5 rounded">
                  IDX
                </span>
              </div>
              <div className="hidden md:flex items-center opacity-85">
                <MarketStatusBar />
              </div>
              <nav aria-label="Mode dan jejak" className="flex items-center gap-3 shrink-0">
                <div className="md:hidden">
                  <MarketStatusBar />
                </div>
                <ModeBadge
                  mode={selectedMode}
                  creditEstimate={result?.credit_estimate}
                  interactive={!isLoading}
                  onModeChange={(m) => setSelectedMode(m)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsAuditDrawerOpen(false);
                    setIsCommandOpen(false);
                    setIsShortcutsOpen(true);
                  }}
                  aria-label="Pintasan keyboard"
                  className="pressable hidden sm:inline-flex items-center justify-center min-h-[32px] min-w-[32px] text-xs font-mono text-slash-steel hover:text-slash-bone transition-colors cursor-pointer"
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
                  className="pressable text-[11px] font-serif italic tracking-wide px-3.5 py-1 min-h-[44px] sm:min-h-[32px] rounded border border-slash-graphite text-slash-bone hover:border-slash-copper hover:text-slash-paper focus-visible:ring-1 focus-visible:ring-slash-copper focus-visible:outline-none cursor-pointer transition-colors duration-150 flex items-center"
                >
                  Jejak Audit
                </button>
              </nav>
            </div>
          </header>

          <main className="page-fade-in max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pt-11 pb-24 w-full flex-1 flex flex-col">
            <div className="max-w-[1140px] mx-auto w-full flex flex-col gap-10">
                  <div className="border-b border-slash-graphite/60 pb-5">
                    <h1 className="font-serif text-2xl sm:text-[27px] text-slash-paper font-medium italic tracking-tight pb-1">
                      Aktivitas Broker &amp; Kepemilikan Publik
                    </h1>
                  </div>

                  <div className="w-full">
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
                  </div>

                  {isLoading && (
                    <div aria-live="polite" aria-label="Pemeriksaan berjalan">
                      {liveSteps ? (
                        <StepsTimeline steps={liveSteps} />
                      ) : (
                        <div className="space-y-2" aria-hidden="true">
                          <div className="skeleton h-4 w-32" />
                          <div className="skeleton h-10 w-full" />
                          <div className="skeleton h-10 w-full" />
                          <div className="skeleton h-10 w-full hidden sm:block" />
                        </div>
                      )}
                    </div>
                  )}

                  {!result && !isLoading && (
                    <div className="border border-slash-graphite rounded-lg p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3 bg-slash-carbon/30">
                      <p className="text-base font-sans font-medium text-slash-paper">
                        Pemeriksaan Aliran Broker &amp; Free Float BEI
                      </p>
                      <p className="text-sm text-slash-mist font-serif max-w-[50ch] leading-relaxed">
                        Ketik kode efek IDX untuk menganalisis konsentrasi sekuritas pembeli/penjual terbesar serta rasio kepemilikan publik.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleInvestigate('BBCA')}
                        className="pressable mt-2 px-4 py-2 rounded-md bg-slash-paper hover:bg-slash-bone text-slash-obsidian font-sans text-xs font-medium cursor-pointer transition-colors duration-150"
                      >
                        Periksa contoh: BBCA
                      </button>
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
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-5 flex flex-col">
                              <FreeFloatCard data={result.free_float} className="h-full" />
                            </div>
                            <div className="lg:col-span-7 flex flex-col">
                              <NarrativePanel
                                narrative={result.narrative}
                                ticker={result.ticker}
                                className="h-full"
                                onCopySuccess={() => setToastMessage(COPY.toast_copied)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
          </main>

          <footer className="border-t border-slash-graphite mt-auto">
            <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
              <span className="font-serif text-base tracking-tight text-slash-paper italic select-none shrink-0">
                Aegis <span className="not-italic text-xs font-serif font-medium text-slash-copper">IDX</span>
              </span>
              <span className="hidden sm:inline w-px h-3.5 bg-slash-slate" aria-hidden="true" />
              <p className="text-xs text-slash-mist font-serif italic m-0">
                Bukan rekomendasi investasi.
              </p>
            </div>
          </footer>

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
