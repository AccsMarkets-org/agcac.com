import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import Popup from '@/components/ui/Popup';

import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import CTASection from '@/components/sections/CTASection';
import AMCSection from '@/components/sections/AMCSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectStats from '@/components/sections/ProjectStats';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import ContactSection from '@/components/sections/ContactSection';
import FAQSection from '@/components/sections/FAQSection';

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="pb-16 md:pb-0">
        <HeroSection />

        <ServicesSection />

        <CTASection
          variant="dark"
          title="Get a Free HVAC Quote for Your Project"
          subtitle="Fill our quick quote form and receive a response on WhatsApp within minutes."
        />

        <AboutSection />

        <ProjectStats />

        <FeaturedProjects />

        <AMCSection />

        <CTASection
          variant="red"
          title="Trusted by Clients Across Abu Dhabi Since 2005"
          subtitle="Join our growing list of satisfied residential, commercial, and industrial clients."
        />

        <ContactSection />

        <FAQSection />
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
      <Popup />
    </>
  );
}
