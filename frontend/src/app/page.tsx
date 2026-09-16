'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScrollText } from 'lucide-react';
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

      // Overlays are mutually exclusive, matching the button handlers below.
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => {
          if (!prev) setIsAuditDrawerOpen(false);
          return !prev;
        });
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setIsAuditDrawerOpen((prev) => {
          if (!prev) setIsShortcutsOpen(false);
          return !prev;
        });
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
      <header className="border-b border-slash-graphite bg-slash-onyx/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-0 min-h-14 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <div className="flex items-center gap-2 shrink-0 select-none">
              <span className="font-sans text-sm font-bold tracking-[0.08em] uppercase text-slash-paper">
                Aegis
              </span>
              <span className="text-slash-gilded font-mono text-[11px] font-semibold border border-slash-graphite px-1.5 py-0.5 rounded">
                IDX
              </span>
            </div>

            <ModeBadge
              mode={selectedMode}
              creditEstimate={result?.credit_estimate}
              interactive={!isLoading}
              onModeChange={(m) => setSelectedMode(m)}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsCommandOpen(false);
              setIsShortcutsOpen(false);
              setIsAuditDrawerOpen(true);
            }}
            className="pressable text-[11px] font-sans px-2.5 min-h-[32px] rounded-md border border-slash-graphite text-slash-mist hover:border-slash-slate hover:text-slash-paper focus-visible:ring-1 focus-visible:ring-slash-copper focus-visible:outline-none cursor-pointer transition-colors duration-150 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <ScrollText size={13} strokeWidth={2} aria-hidden="true" />
            <span className="hidden sm:inline">{COPY.audit_title}</span>
            <span className="sm:hidden">Jejak</span>
          </button>
        </div>
      </header>

          <main className="page-fade-in max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-24 w-full flex-1 flex flex-col">
            <div className="w-full flex flex-col gap-9">
                  <div className="max-w-[62ch]">
                    <h1 className="font-serif text-[26px] sm:text-[32px] text-slash-paper font-medium italic tracking-tight leading-[1.15] pb-1 m-0">
                      Aktivitas broker &amp; kepemilikan publik
                    </h1>
                    <p className="text-[15px] text-slash-mist font-sans leading-relaxed mt-3 mb-0">
                      Masukkan kode efek IDX untuk memeriksa sekuritas mana yang paling banyak
                      membeli dan menjual, serta berapa porsi saham yang beredar di publik.
                    </p>
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

                  {/* StepsTimeline owns its own polite live region, so this
                      wrapper stays silent to avoid double announcements. */}
                  {isLoading && (
                    <div>
                      {liveSteps ? (
                        <StepsTimeline steps={liveSteps} />
                      ) : (
                        <div className="space-y-3" role="status" aria-label="Menyiapkan pemeriksaan">
                          <div className="skeleton h-4 w-40" aria-hidden="true" />
                          <div className="skeleton h-3 w-full max-w-[52ch]" aria-hidden="true" />
                          <div className="pt-2 space-y-3" aria-hidden="true">
                            <div className="skeleton h-9 w-full" />
                            <div className="skeleton h-9 w-full" />
                            <div className="skeleton h-9 w-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Idle: focused invitation to run investigation with keyboard or quick chips. */}
                  {!result && !isLoading && (
                    <div className="border-t border-slash-graphite pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans text-slash-fog">
                      <p className="m-0">
                        Tekan <kbd className="font-mono text-[11px] text-slash-paper bg-slash-carbon border border-slash-graphite px-1.5 py-0.5 rounded select-none">Enter</kbd> atau pilih kode efek untuk memulai investigasi agen.
                      </p>
                      <span className="font-mono text-[11px] text-slash-steel shrink-0 hidden sm:inline">
                        Orkestrasi: Perencana → Eksekutor → Peninjau
                      </span>
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
            <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-start gap-x-6 gap-y-3">
              <span className="font-serif text-base tracking-tight text-slash-paper italic select-none shrink-0">
                Aegis <span className="not-italic text-xs font-serif font-medium text-slash-copper">IDX</span>
              </span>
              <p className="text-xs text-slash-fog font-sans leading-relaxed m-0 max-w-[76ch]">
                {COPY.disclaimer_long}
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
