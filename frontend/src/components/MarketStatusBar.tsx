'use client';

import React, { useState, useEffect } from 'react';

export const MarketStatusBar: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<{
    label: string;
    isOpen: boolean;
    session: string;
  }>({
    label: 'Pasar tutup',
    isOpen: false,
    session: 'Buka 09:00 WIB',
  });

  useEffect(() => {
    const updateMarketHours = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wibDate = new Date(utc + 3600000 * 7);

      const day = wibDate.getDay();
      const hour = wibDate.getHours();
      const min = wibDate.getMinutes();
      const timeVal = hour * 100 + min;

      if (day === 0 || day === 6) {
        setMarketStatus({
          label: 'Libur akhir pekan',
          isOpen: false,
          session: 'Tutup',
        });
        return;
      }

      const isFriday = day === 5;

      if (timeVal >= 845 && timeVal < 900) {
        setMarketStatus({
          label: 'Pra-pembukaan',
          isOpen: false,
          session: '08:45–09:00 WIB',
        });
      } else if (
        (!isFriday && timeVal >= 900 && timeVal < 1200) ||
        (isFriday && timeVal >= 900 && timeVal < 1130)
      ) {
        setMarketStatus({
          label: 'Sesi I',
          isOpen: true,
          session: isFriday ? '09:00–11:30 WIB' : '09:00–12:00 WIB',
        });
      } else if (
        (!isFriday && timeVal >= 1200 && timeVal < 1330) ||
        (isFriday && timeVal >= 1130 && timeVal < 1400)
      ) {
        setMarketStatus({
          label: 'Jeda siang',
          isOpen: false,
          session: isFriday ? '11:30–14:00 WIB' : '12:00–13:30 WIB',
        });
      } else if (
        (!isFriday && timeVal >= 1330 && timeVal < 1550) ||
        (isFriday && timeVal >= 1400 && timeVal < 1550)
      ) {
        setMarketStatus({
          label: 'Sesi II',
          isOpen: true,
          session: isFriday ? '14:00–15:50 WIB' : '13:30–15:50 WIB',
        });
      } else if (timeVal >= 1550 && timeVal <= 1600) {
        setMarketStatus({
          label: 'Pra-penutupan',
          isOpen: false,
          session: '15:50–16:00 WIB',
        });
      } else {
        setMarketStatus({
          label: 'Pasar tutup',
          isOpen: false,
          session: 'Buka 09:00 WIB',
        });
      }
    };

    updateMarketHours();
    const interval = setInterval(updateMarketHours, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      aria-label={`Status pasar: ${marketStatus.label}, ${marketStatus.session}`}
      aria-live="off"
      className="flex items-center gap-2 min-w-0 text-[11px] font-sans text-slash-fog"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          marketStatus.isOpen ? 'bg-status-success' : 'bg-slash-steel'
        }`}
        aria-hidden="true"
      />
      <span className={marketStatus.isOpen ? 'text-slash-paper font-medium' : 'text-slash-mist'}>
        {marketStatus.label}
      </span>
      <span className="font-mono-numbers text-slash-mist truncate hidden sm:inline">{marketStatus.session}</span>
      <span className="text-slash-graphite hidden sm:inline" aria-hidden="true">·</span>
      <span
        className="text-slash-mist shrink-0 font-mono-numbers hidden sm:inline"
        title="Penyelesaian transaksi 2 hari bursa"
      >
        T+2
      </span>
    </p>
  );
};
