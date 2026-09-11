'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps an overlay mounted through its exit transition.
 *
 * Overlays that unmount the instant `isOpen` flips to false pop out of
 * existence, which reads as a glitch next to a drawer that slides away.
 * This returns `mounted` (render or not) and `open` (drive `data-open`),
 * holding the node in the tree for `exitMs` after close so CSS can animate.
 *
 * Exit is deliberately shorter than enter: entering is the interface
 * presenting itself, leaving is the system getting out of the way.
 */
export function useOverlayTransition(isOpen: boolean, exitMs = 160) {
  const [mounted, setMounted] = useState(isOpen);
  const [open, setOpen] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Adjusted during render, not in an effect: mounting has to happen before
  // paint, and closing should begin on the same commit as the state change.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMounted(true);
    } else {
      setOpen(false);
    }
  }

  // Enter one frame after mount, so the element renders closed first and the
  // transition has a starting point to run from.
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen, mounted]);

  // Unmount only once the exit transition has had time to finish.
  useEffect(() => {
    if (isOpen || !mounted) return;
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [isOpen, mounted, exitMs]);

  return { mounted, open };
}
