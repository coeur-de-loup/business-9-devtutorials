import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import ProblemSection from '@/components/landing/ProblemSection';
import ValueProps from '@/components/landing/ValueProps';
import TutorialShowcase from '@/components/landing/TutorialShowcase';
import CreatorSection from '@/components/landing/CreatorSection';
import Pricing from '@/components/landing/Pricing';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <SocialProof />
      <ProblemSection />
      <ValueProps />
      <TutorialShowcase />
      <CreatorSection />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
