import HeroSection from "@/components/HeroSection";
import CompanyLogos from "@/components/CompanyLogos";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import AIChat from "@/components/AIChat";
import Footer from "@/components/Footer";
import CourseCurriculum from "@/components/CourseCurriculum";
import InvestmentBasics from "@/components/InvestmentBasics";
import FAQ from "@/components/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CompanyLogos />
      <FeaturesSection />
      <CourseCurriculum />
      <InvestmentBasics />
      <TestimonialsSection />
      <FAQ />
      <PricingSection />
      <AIChat />
      <Footer />
    </div>
  );
};

export default Index;
