import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CompanyLogos from "@/components/CompanyLogos";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import AIChat from "@/components/AIChat";
import Footer from "@/components/Footer";
import CourseCurriculum from "@/components/CourseCurriculum";
import InvestmentBasics from "@/components/InvestmentBasics";
import InteractiveCompounding from "@/components/InteractiveCompounding";
import FAQ from "@/components/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
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
      <Footer />
    </div>
  );
};

export default Index;
