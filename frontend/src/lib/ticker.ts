import { COPY } from '@/constants/copy';

export type TickerParse =
  | { ok: true; ticker: string }
  | { ok: false; reason: 'empty' | 'chars' | 'length' };

export function parseTicker(raw: string): TickerParse {
  const ticker = raw.trim().toUpperCase();
  if (!ticker) return { ok: false, reason: 'empty' };
  if (!/^[A-Z0-9]+$/.test(ticker)) return { ok: false, reason: 'chars' };
  if (ticker.length < 2 || ticker.length > 5) return { ok: false, reason: 'length' };
  return { ok: true, ticker };
}

export function tickerErrorCopy(reason: 'empty' | 'chars' | 'length'): string {
  if (reason === 'empty') return 'Masukkan kode efek, contoh BBCA';
  if (reason === 'chars') return COPY.search_error_chars;
  return COPY.search_error_length;
}
