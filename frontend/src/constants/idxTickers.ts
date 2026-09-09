export interface IDXTicker {
  code: string;
  name: string;
  sector: 'Perbankan' | 'Telko & Teknologi' | 'Energi & Tambang' | 'Konglomerasi' | 'Konsumer' | 'Diagnostik';
  marketCapTier: 'Mega Cap' | 'Large Cap' | 'Mid Cap' | 'Pengujian';
  note?: string;
}

export const IDX_TICKERS: readonly IDXTicker[] = [
  {
    code: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    sector: 'Perbankan',
    marketCapTier: 'Mega Cap',
    note: 'Kapitalisasi Pasar Terbesar IDX · Likuiditas Tinggi',
  },
  {
    code: 'BBRI',
    name: 'PT Bank Rakyat Indonesia (Persero) Tbk',
    sector: 'Perbankan',
    marketCapTier: 'Mega Cap',
    note: 'BUMN Perbankan Mikro Terbesar',
  },
  {
    code: 'BMRI',
    name: 'PT Bank Mandiri (Persero) Tbk',
    sector: 'Perbankan',
    marketCapTier: 'Mega Cap',
    note: 'Aset Konsolidasi Terbesar Perbankan BUMN',
  },
  {
    code: 'BBNI',
    name: 'PT Bank Negara Indonesia (Persero) Tbk',
    sector: 'Perbankan',
    marketCapTier: 'Large Cap',
    note: 'Fokus Pembiayaan Korporasi & Internasional',
  },
  {
    code: 'BRIS',
    name: 'PT Bank Syariah Indonesia Tbk',
    sector: 'Perbankan',
    marketCapTier: 'Large Cap',
    note: 'Perbankan Syariah Terbesar Nasional',
  },
  {
    code: 'TLKM',
    name: 'PT Telkom Indonesia (Persero) Tbk',
    sector: 'Telko & Teknologi',
    marketCapTier: 'Mega Cap',
    note: 'Infrastruktur Digital & Jaringan Seluler Nasional',
  },
  {
    code: 'ISAT',
    name: 'PT Indosat Tbk (Indosat Ooredoo Hutchison)',
    sector: 'Telko & Teknologi',
    marketCapTier: 'Large Cap',
    note: 'Penyedia Layanan Seluler & Data Korporasi',
  },
  {
    code: 'GOTO',
    name: 'PT GoTo Gojek Tokopedia Tbk',
    sector: 'Telko & Teknologi',
    marketCapTier: 'Large Cap',
    note: 'Ekosistem Digital On-Demand & E-Commerce',
  },
  {
    code: 'BREN',
    name: 'PT Barito Renewables Energy Tbk',
    sector: 'Energi & Tambang',
    marketCapTier: 'Mega Cap',
    note: 'Pembangkit Listrik Tenaga Panas Bumi (Geotermal)',
  },
  {
    code: 'AMMN',
    name: 'PT Amman Mineral Internasional Tbk',
    sector: 'Energi & Tambang',
    marketCapTier: 'Mega Cap',
    note: 'Tambang Tembaga & Emas Terpadu',
  },
  {
    code: 'ADRO',
    name: 'PT Adaro Energy Indonesia Tbk',
    sector: 'Energi & Tambang',
    marketCapTier: 'Large Cap',
    note: 'Produsen Batubara Termal & Logistik Energi Terintegrasi',
  },
  {
    code: 'PGAS',
    name: 'PT Perusahaan Gas Negara Tbk',
    sector: 'Energi & Tambang',
    marketCapTier: 'Large Cap',
    note: 'Distribusi Gas Bumi Nasional (Subholding Gas Pertamina)',
  },
  {
    code: 'ASII',
    name: 'PT Astra International Tbk',
    sector: 'Konglomerasi',
    marketCapTier: 'Mega Cap',
    note: 'Otomotif, Jasa Keuangan, Alat Berat & Agribisnis',
  },
  {
    code: 'ICBP',
    name: 'PT Indofood CBP Sukses Makmur Tbk',
    sector: 'Konsumer',
    marketCapTier: 'Large Cap',
    note: 'Produsen Makanan Olahan (Indomie) & Minuman Kemasan',
  },
  {
    code: 'INDF',
    name: 'PT Indofood Sukses Makmur Tbk',
    sector: 'Konsumer',
    marketCapTier: 'Large Cap',
    note: 'Holding Industri Pangan Terintegrasi & Tepung Terigu',
  },
  {
    code: 'XXXX',
    name: 'INSTRUMEN TIDAK TERDAFTAR (KODE UJI)',
    sector: 'Diagnostik',
    marketCapTier: 'Pengujian',
    note: 'Uji Penanganan Error & Papan Tidak Ditemukan',
  },
];
