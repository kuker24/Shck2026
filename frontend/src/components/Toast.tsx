'use client';

import React, { useEffect } from 'react';
import { COPY } from '@/constants/copy';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 4000 }) => {
  const [paused, setPaused] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration <= 0 || paused) return;
    timerRef.current = setTimeout(onClose, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onClose, paused, message]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="toast-panel fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slash-carbon border border-slash-graphite text-slash-paper pl-4 pr-2 py-2 rounded-lg text-xs max-w-[calc(100vw-2rem)] sm:max-w-sm shadow-lg shadow-black/20"
    >
      <span className="font-sans text-sm text-slash-bone">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="pressable text-[11px] font-sans text-slash-mist hover:text-slash-paper px-3 min-h-[44px] min-w-[44px] inline-flex items-center justify-center border-l border-slash-graphite cursor-pointer focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:outline-none shrink-0"
        aria-label={`${COPY.cta_close} notifikasi`}
      >
        {COPY.cta_close}
      </button>
    </div>
  );
};
