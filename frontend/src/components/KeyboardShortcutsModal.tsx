'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useOverlayTransition } from '@/lib/useOverlayTransition';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

const SHORTCUTS: readonly ShortcutItem[] = [
  { keys: ['/'], description: 'Fokus ke kolom kode' },
  { keys: ['Ctrl/⌘', 'K'], description: 'Cari emiten' },
  { keys: ['1'], description: 'Mode simulasi' },
  { keys: ['2'], description: 'Mode tersimpan' },
  { keys: ['3'], description: 'Mode langsung' },
  { keys: ['O'], description: 'Buka jejak' },
  { keys: ['?'], description: 'Pintasan ini' },
  { keys: ['Esc'], description: 'Tutup' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { mounted, open } = useOverlayTransition(isOpen);

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
    const el = panelRef.current;
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
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pintasan keyboard"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-dim"
      data-open={open ? 'true' : 'false'}
      onClick={onClose}
    >
      {/* Escape is handled by the window listener above; stopping keydown
          propagation on the panel prevented it from ever arriving. */}
      <div
        ref={panelRef}
        role="document"
        className="modal-panel w-full max-w-md bg-slash-onyx border border-slash-graphite rounded-lg p-5 sm:p-6 space-y-4"
        data-open={open ? 'true' : 'false'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-sans font-medium text-slash-paper tracking-[-0.01em] m-0">Pintasan keyboard</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pintasan keyboard"
            className="pressable inline-flex items-center justify-center rounded-md text-slash-mist hover:text-slash-paper cursor-pointer w-11 h-11 -mr-2 -mt-1 shrink-0 transition-colors duration-150"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <ul className="divide-y divide-slash-graphite/50 list-none m-0 p-0">
          {SHORTCUTS.map((sc) => (
            <li key={sc.description} className="py-2 flex items-center justify-between gap-4 min-h-[44px]">
              <span className="text-sm text-slash-mist">{sc.description}</span>
              <div className="flex items-center gap-1 shrink-0">
                {sc.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 rounded-sm font-mono text-[11px] bg-slash-carbon border border-slash-graphite text-slash-paper min-w-[24px] text-center"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
