import HeroSection from "@/components/hero-section";
import WhyKundliSection from "@/components/why-kundli-section";
import SectionDivider from "@/components/section-divider";
import HowItWorksSection from "@/components/how-it-works-section";
import CreateAccountSection from "@/components/create-account-section";
import FooterSection from "@/components/footer-section";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhyKundliSection />
      <SectionDivider fromColor="#ffffff" toColor="#fff5fa" />
      <HowItWorksSection />
      <SectionDivider fromColor="#fff5fa" toColor="#ffffff" />
      <CreateAccountSection />
      <SectionDivider fromColor="#ffffff" toColor="#fff5fa" />
      <FooterSection />
    </main>
  );
}
