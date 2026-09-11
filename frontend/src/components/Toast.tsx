'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 4000 }) => {
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);

  // Enter on the next frame so the transition has a starting point.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animate out, then unmount. Timer pauses on hover and focus so a message
  // cannot disappear while it is being read or reached for.
  useEffect(() => {
    if (duration <= 0 || paused) return;
    const dismiss = setTimeout(() => {
      setOpen(false);
      setTimeout(onClose, 160);
    }, duration);
    return () => clearTimeout(dismiss);
  }, [duration, onClose, paused, message]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 160);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      data-open={open ? 'true' : 'false'}
      className="toast-panel fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slash-carbon border border-slash-slate text-slash-paper pl-4 pr-1.5 py-1.5 rounded-lg max-w-[calc(100vw-2rem)] sm:max-w-md shadow-lg shadow-black/40"
    >
      <span className="font-sans text-[13px] text-slash-bone leading-snug py-1.5">{message}</span>
      <button
        type="button"
        onClick={handleClose}
        className="pressable text-slash-mist hover:text-slash-paper w-9 h-9 inline-flex items-center justify-center rounded-md cursor-pointer focus-visible:ring-2 focus-visible:ring-slash-copper focus-visible:outline-none shrink-0 transition-colors duration-150"
        aria-label="Tutup notifikasi"
      >
        <X size={15} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
};
