'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InvestigateResponse } from '@/types/investigate';
import { COPY } from '@/constants/copy';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: InvestigateResponse | null;
  selectedMode: string;
}

type TabId = 'architecture' | 'steps' | 'json';

const STATUS_CLASS = {
  done: 'text-status-success',
  running: 'text-slash-copper',
  error: 'text-status-error',
  skipped: 'text-slash-steel',
  pending: 'text-slash-steel/70',
} satisfies Record<string, string>;

export const AuditDrawer: React.FC<AuditDrawerProps> = ({
  isOpen,
  onClose,
  result,
  selectedMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('architecture');
  const [copied, setCopied] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const el = drawerRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener('keydown', trap);
    first?.focus();
    return () => el.removeEventListener('keydown', trap);
  }, [isOpen, activeTab]);

  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const STATUS_LABEL = {
    done: 'Selesai',
    running: 'Proses',
    error: 'Gagal',
    skipped: 'Dilewati',
    pending: 'Menunggu',
  } satisfies Record<string, string>;

  const tabClass = (id: TabId) =>
    `flex-1 py-2.5 px-3 min-h-[44px] text-center cursor-pointer text-xs font-sans transition-colors duration-150 inline-flex items-center justify-center ${
      activeTab === id
        ? 'text-slash-paper border-b border-slash-copper font-medium'
        : 'text-slash-fog hover:text-slash-bone'
    }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        role="presentation"
        className="overlay-dim absolute inset-0"
        data-open={isOpen ? 'true' : 'false'}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal={isOpen}
        inert={!isOpen}
        aria-label="Jejak pemeriksaan"
        className="drawer-panel relative w-full max-w-xl h-full bg-slash-onyx border-l border-slash-graphite flex flex-col overflow-hidden text-slash-bone"
        data-open={isOpen ? 'true' : 'false'}
      >
        <div className="p-5 border-b border-slash-graphite flex items-center justify-between">
          <h2 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em]">Jejak pemeriksaan</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jejak pemeriksaan"
            className="pressable text-xs font-sans px-3 py-1 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md text-slash-mist hover:text-slash-paper cursor-pointer"
          >
            {COPY.cta_close}
          </button>
        </div>

        <div className="flex border-b border-slash-graphite" role="tablist" aria-label="Jejak tab">
          <button type="button" role="tab" aria-selected={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')} className={tabClass('architecture')}>
            Arsitektur
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'steps'} onClick={() => setActiveTab('steps')} className={tabClass('steps')}>
            Tahapan ({result?.steps.length ?? 0})
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'json'} onClick={() => setActiveTab('json')} className={tabClass('json')}>
            JSON
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4" role="tabpanel">
          {activeTab === 'architecture' && (
            <div className="space-y-5 text-sm font-sans">
              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-slash-fog">Pengembang</dt>
                  <dd className="text-slash-paper mt-0.5">Fahmi · SKT7-R2C4</dd>
                </div>
                <div>
                  <dt className="text-slash-fog">Kompetisi</dt>
                  <dd className="text-slash-paper mt-0.5">Sectors 2026 · Jalur 1</dd>
                </div>
              </dl>

              <div className="space-y-3 text-xs leading-relaxed max-w-[60ch]">
                <div>
                  <h3 className="font-medium text-slash-paper mb-0.5">Perencana</h3>
                  <p className="text-slash-fog max-w-[60ch]">Alokasi kuota Sectors API.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slash-paper mb-0.5">Eksekutor</h3>
                  <p className="text-slash-fog max-w-[60ch]">Pengambilan broker summary &amp; free float.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slash-paper mb-0.5">Peninjau</h3>
                  <p className="text-slash-fog max-w-[60ch]">Verifikasi integritas data &amp; penafian kepatuhan.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-0 text-xs divide-y divide-slash-graphite/50">
              {result?.steps.map((s, i) => (
                <div key={s.id || i} className="py-3 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slash-copper">
                      {String(i + 1).padStart(2, '0')} · {s.role}
                    </span>
                    <span className={STATUS_CLASS[s.status] || 'text-slash-steel'}>{STATUS_LABEL[s.status] ?? s.status}</span>
                  </div>
                  <div className="text-slash-paper font-sans">{s.title}</div>
                </div>
              )) ?? (
                <p className="text-slash-fog py-10 text-center font-sans">
                  Belum ada tahapan.
                </p>
              )}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slash-mist font-sans">Respons</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  disabled={!result}
                  className="pressable px-3 py-1 min-h-[44px] sm:min-h-[32px] rounded-md border border-slash-graphite text-slash-paper font-sans text-xs cursor-pointer hover:border-slash-slate disabled:opacity-40 transition-colors duration-150"
                >
                  <span className="copy-label" data-swapping={copied}>
                    {copied ? COPY.cta_copied : 'Salin JSON'}
                  </span>
                </button>
              </div>

              <pre className="p-4 rounded-md bg-slash-carbon border border-slash-graphite text-[11px] font-mono text-slash-mist overflow-x-auto max-h-[450px] leading-relaxed select-text">
                {result
                  ? JSON.stringify(result, null, 2)
                  : `{\n  "mode": "${selectedMode}",\n  "status": "idle"\n}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
