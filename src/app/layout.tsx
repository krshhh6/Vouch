import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DemoDataInitializer from "@/components/DemoDataInitializer";
import PortalFooter from "@/components/PortalFooter";

const oswald = localFont({
  src: "../../public/fonts/oswald/Oswald-VariableFont_wght.ttf",
  variable: "--font-oswald",
  display: "swap",
});

const bowlby = localFont({
  src: "../../public/fonts/bowlby-one-sc/BowlbyOneSC-Regular.ttf",
  variable: "--font-bowlby",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vouch — Neumorphic Medical Leave Protocol",
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
    <html lang="en" className={`${oswald.variable} ${bowlby.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${oswald.variable} ${bowlby.variable} ${oswald.className} min-h-screen bg-[#e8ecf4] text-[#192132] font-sans antialiased selection:bg-blue-200 selection:text-blue-900 flex flex-col`}>
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
