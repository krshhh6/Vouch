import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DemoDataInitializer from "@/components/DemoDataInitializer";

export const metadata: Metadata = {
  title: "Vouch — Zero-Knowledge Medical Leave Protocol",
  description: "Selective-disclosure leave attestation verifier. Prove medical & pregnancy leave eligibility to HR without exposing sensitive raw health reports.",
  keywords: [
    "privacy",
    "selective disclosure",
    "verifiable credentials",
    "Web Crypto",
    "ECDSA P-256",
    "medical leave",
    "HR compliance",
    "zero knowledge"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-black text-zinc-100 font-sans antialiased selection:bg-white selection:text-black flex flex-col">
        <DemoDataInitializer />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <footer className="border-t border-zinc-900 bg-black py-6 text-xs text-zinc-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span className="font-semibold text-zinc-300 uppercase tracking-wider font-condensed">Vouch Engine v1.0</span>
              <span className="text-zinc-700">|</span>
              <span className="text-zinc-500">ECDSA P-256 / SHA-256 • Neon Lakebase Postgres</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-500 uppercase tracking-wider font-condensed">
              <span>Zero PHI Retention</span>
              <span>/</span>
              <span>Time-Bound Attestations</span>
              <span>/</span>
              <span>Append-Only Ledger</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
