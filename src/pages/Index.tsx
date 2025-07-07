import SectionLayout from "@/components/SectionLayout";
import HeroSection from "@/components/HeroSection";
import CompanyLogos from "@/components/CompanyLogos";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import AIChat from "@/components/AIChat";
import CourseCurriculum from "@/components/CourseCurriculum";
import InvestmentBasics from "@/components/InvestmentBasics";
import InteractiveCompounding from "@/components/InteractiveCompounding";
import FAQ from "@/components/FAQ";
import { Target } from "lucide-react";

const Index = () => {
  return (
    <SectionLayout 
      sectionName="Business Fundamentals" 
      sectionIcon={Target}
      sectionColor="from-primary to-accent-secondary"
    >
      <HeroSection />
      <CompanyLogos />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="curriculum">
        <CourseCurriculum />
      </div>
      <InteractiveCompounding />
      <InvestmentBasics />
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <FAQ />
      <div id="pricing">
        <PricingSection />
      </div>
      <AIChat />
    </SectionLayout>
  );
};

export default Index;
