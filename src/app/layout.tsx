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
      <body className="min-h-screen bg-ink-950 text-slate-100 antialiased selection:bg-seal-500 selection:text-ink-950 flex flex-col">
        <DemoDataInitializer />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <footer className="border-t border-ink-800/80 bg-ink-900/90 py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-seal-500 animate-pulse"></span>
              <span className="font-semibold text-slate-200">Vouch Engine v1.0</span>
              <span className="text-slate-600">|</span>
              <span>Browser Web Crypto (ECDSA P-256 / SHA-256)</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400">
              <span>Zero Raw Health Report Exposure</span>
              <span>•</span>
              <span>Revocable Time-Bound Attestations</span>
              <span>•</span>
              <span>Tamper-Evident Audit Trails</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
