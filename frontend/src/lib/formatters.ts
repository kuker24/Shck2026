export function formatIDR(val: number, compact = false): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (compact) {
    if (abs >= 1e12) {
      return `${sign}Rp ${(abs / 1e12).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} T`;
    }
    if (abs >= 1e9) {
      return `${sign}Rp ${(abs / 1e9).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} M`;
    }
    if (abs >= 1e6) {
      return `${sign}Rp ${(abs / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Jt`;
    }
  }
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-';
  return val.toLocaleString('id-ID');
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    // Invalid dates do not throw; they yield NaN time and render "Invalid Date".
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
