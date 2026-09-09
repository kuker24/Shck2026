export interface BrokerMetadata {
  code: string;
  name: string;
  type: 'F' | 'D'; // F = Foreign/Asing, D = Domestic/Domestik
  category: 'BUMN' | 'Asing Global' | 'Ritel Domestik' | 'Swasta Nasional';
  tier: string;
  note: string;
}

export const BROKER_CATALOG = {
  AK: {
    code: 'AK',
    name: 'UBS Sekuritas Indonesia',
    type: 'F',
    category: 'Asing Global',
    tier: 'Tier 1 Institusi Global',
    note: 'Sering mewakili aliran dana sovereign wealth fund dan manajer investasi global.',
  },
  BK: {
    code: 'BK',
    name: 'J.P. Morgan Sekuritas Indonesia',
    type: 'F',
    category: 'Asing Global',
    tier: 'Tier 1 Institusi Global',
    note: 'Fokus pada alokasi portofolio institusi global dan dana pensiun asing.',
  },
  CC: {
    code: 'CC',
    name: 'Mandiri Sekuritas',
    type: 'D',
    category: 'BUMN',
    tier: 'Tier 1 BUMN Perbankan',
    note: 'Broker BUMN dengan pangsa pasar penjamin emisi dan transaksi institusi terbesar.',
  },
  CS: {
    code: 'CS',
    name: 'Credit Suisse Sekuritas Indonesia',
    type: 'F',
    category: 'Asing Global',
    tier: 'Tier 1 Institusi Global',
    note: 'Afiliasi perbankan investasi global.',
  },
  NI: {
    code: 'NI',
    name: 'BNI Sekuritas',
    type: 'D',
    category: 'BUMN',
    tier: 'Tier 1 BUMN Perbankan',
    note: 'Penjamin emisi dan perantara efek institusi BUMN dan ritel nasional.',
  },
  PD: {
    code: 'PD',
    name: 'Indo Premier Sekuritas',
    type: 'D',
    category: 'Ritel Domestik',
    tier: 'Penyedia Platform Ritel Terbesar',
    note: 'Basis nasabah investor individu/ritel domestik terbesar di Indonesia.',
  },
  RX: {
    code: 'RX',
    name: 'Macquarie Sekuritas Indonesia',
    type: 'F',
    category: 'Asing Global',
    tier: 'Tier 1 Derivatif & Institusi',
    note: 'Penerbit waran terstruktur dan perantara ekuitas institusi global.',
  },
  YP: {
    code: 'YP',
    name: 'Mirae Asset Sekuritas Indonesia',
    type: 'D',
    category: 'Ritel Domestik',
    tier: 'Volume Transaksi Harian Teratas',
    note: 'Salah satu broker dengan volume transaksi harian tertinggi di BEI.',
  },
  ZP: {
    code: 'ZP',
    name: 'Maybank Sekuritas Indonesia',
    type: 'F',
    category: 'Asing Global',
    tier: 'Institusi Regional ASEAN',
    note: 'Jaringan perbankan investasi regional Asia Tenggara.',
  },
  MS: {
    code: 'MS',
    name: 'Morgan Stanley Sekuritas Indonesia',
    type: 'F',
    category: 'Asing Global',
    tier: 'Tier 1 Institusi Global',
    note: 'Aliran dana indeks acuan global MSCI & investor institusi AS.',
  },
  KZ: {
    code: 'KZ',
    name: 'CLSA Sekuritas Indonesia',
    type: 'F',
    category: 'Asing Global',
    tier: 'Institusi Asia & Internasional',
    note: 'Riset ekuitas dan eksekusi blok perdagangan institusi.',
  },
  LG: {
    code: 'LG',
    name: 'Trimegah Sekuritas Indonesia Tbk',
    type: 'D',
    category: 'Swasta Nasional',
    tier: 'Swasta Terkemuka',
    note: 'Layanan terpadu manajer investasi, penjamin emisi, dan wealth management.',
  },
  AI: {
    code: 'AI',
    name: 'UOB Kay Hian Sekuritas',
    type: 'F',
    category: 'Asing Global',
    tier: 'Regional ASEAN',
    note: 'Layanan broker institusi dan ritel jaringan Singapura.',
  },
  SQ: {
    code: 'SQ',
    name: 'BCA Sekuritas',
    type: 'D',
    category: 'Swasta Nasional',
    tier: 'Konglomerasi Perbankan Terbesar',
    note: 'Afiliasi PT Bank Central Asia Tbk untuk penjaminan emisi dan perantara efek.',
  },
  GR: {
    code: 'GR',
    name: 'Panin Sekuritas Tbk',
    type: 'D',
    category: 'Swasta Nasional',
    tier: 'Swasta Nasional Bersejarah',
    note: 'Fokus pada manajer investasi dan nasabah institusi/ritel berpenghasilan tinggi.',
  },
  XC: {
    code: 'XC',
    name: 'Ajaib Sekuritas Asia',
    type: 'D',
    category: 'Ritel Domestik',
    tier: 'Fintech Ritel Milenial',
    note: 'Platform investasi digital ritel generasi baru.',
  },
  AZ: {
    code: 'AZ',
    name: 'Sucor Sekuritas',
    type: 'D',
    category: 'Swasta Nasional',
    tier: 'Komunitas & Ritel Swasta',
    note: 'Fokus edukasi pasar modal dan perantara efek komunitas.',
  },
} satisfies Record<string, BrokerMetadata>;

export function getBrokerInfo(code: string, fallbackName?: string): BrokerMetadata {
  const upper = code.trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(BROKER_CATALOG, upper)) {
    // SAFETY: upper is verified to exist in BROKER_CATALOG by Object.prototype.hasOwnProperty
    return BROKER_CATALOG[upper as keyof typeof BROKER_CATALOG];
  }

  // Heuristic for unknown brokers
  return {
    code: upper,
    name: fallbackName || `Sekuritas Terdaftar (${upper})`,
    type: 'D',
    category: 'Swasta Nasional',
    tier: 'Anggota Bursa Terdaftar BEI',
    note: 'Anggota Bursa Efek Indonesia berizin OJK.',
  };
}
