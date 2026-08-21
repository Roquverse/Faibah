import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Solutions from '@/components/Solutions';
import Features from '@/components/Features';
import Invoicing from '@/components/Invoicing';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa', position: 'relative', overflow: 'hidden', width: '100%' }}>
      <Navbar />
      <Hero />
      <Solutions />
      <Features />
      <Invoicing />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}
