import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DemoDataInitializer from "@/components/DemoDataInitializer";
import PortalFooter from "@/components/PortalFooter";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
        <DemoDataInitializer />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <PortalFooter />
      </body>
    </html>
  );
}
