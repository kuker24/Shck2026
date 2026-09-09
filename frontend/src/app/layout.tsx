import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serifDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sansUi = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const monoNumbers = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Aegis-IDX — Aliran broker BEI",
  description: "Pemeriksaan aliran broker Bursa Efek Indonesia. Bukan saran investasi.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${serifDisplay.variable} ${sansUi.variable} ${monoNumbers.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slash-obsidian text-slash-bone selection:bg-slash-copper/20 selection:text-slash-paper">
        {children}
      </body>
    </html>
  );
}
