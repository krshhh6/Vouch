import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import DemoSection from '@/components/landing/DemoSection';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Vouch — Privacy-Preserving Medical Leave Attestation Protocol',
  description: 'Prove your leave eligibility with cryptographic zero-knowledge credentials while protecting sensitive health diagnoses from HR databases.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900 text-white font-sans selection:bg-primary-600 selection:text-white flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DemoSection />
      </main>
      <Footer />
    </div>
  );
}
