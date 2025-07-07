import SectionLayout from '@/components/SectionLayout';
import PythonCompute from '@/components/PythonCompute';
import { Calculator, Code, BarChart3, TrendingUp } from 'lucide-react';

const PythonToolsPage = () => {
  return (
    <SectionLayout 
      sectionName="Python Tools" 
      sectionIcon={Calculator}
      sectionColor="from-primary to-accent-secondary"
    >
      <div className="py-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
            <Code className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-semibold text-gradient">Python-like Computing</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
            Instant
            <br />
            <span className="text-gradient">Computation Engine</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
            Perform complex calculations, statistical analysis, and data processing with
            <span className="text-primary font-bold"> instant results</span>
          </p>
        </div>

        {/* Main Tool */}
        <div className="max-w-4xl mx-auto">
          <PythonCompute />
        </div>
      </div>
    </SectionLayout>
  );
};

export default PythonToolsPage;