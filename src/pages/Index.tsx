import HeroSection from "@/components/HeroSection";
import CompanyLogos from "@/components/CompanyLogos";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import AIChat from "@/components/AIChat";
import ImageGenerator from "@/components/ImageGenerator";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CompanyLogos />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <AIChat />
      <ImageGenerator />
      <Footer />
    </div>
  );
};

export default Index;
