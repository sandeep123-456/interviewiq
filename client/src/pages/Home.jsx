import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Pricing from '../components/Pricing';

// Home page = alag-alag sections ka jod
export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
    </>
  );
}