import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Play, BookOpen } from "lucide-react";

const CourseCurriculum = () => {
  const modules = [
    {
      number: "01",
      title: "Business Fundamentals",
      duration: "45 min",
      lessons: 8,
      topics: [
        "Understanding profit & loss basics",
        "Cash flow vs revenue explained",
        "Break-even analysis made simple",
        "Key performance indicators (KPIs)"
      ]
    },
    {
      number: "02", 
      title: "Financial Planning",
      duration: "60 min",
      lessons: 12,
      topics: [
        "Budgeting for creative projects",
        "Investment planning basics",
        "Risk management strategies",
        "Financial goal setting"
      ]
    },
    {
      number: "03",
      title: "Market Analysis",
      duration: "35 min", 
      lessons: 6,
      topics: [
        "Understanding your target audience",
        "Competitive landscape analysis",
        "Market sizing and opportunities",
        "Trend identification techniques"
      ]
    },
    {
      number: "04",
      title: "Growth Strategies",
      duration: "50 min",
      lessons: 10,
      topics: [
        "Scaling your creative business",
        "Partnership and collaboration",
        "Digital marketing essentials",
        "Brand positioning fundamentals"
      ]
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Complete <span className="text-primary">Business Curriculum</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master essential business concepts through our structured, visual learning modules designed specifically for creative professionals.
        </p>
      </div>

      <div className="grid gap-6">
        {modules.map((module, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/20 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary/20 transition-colors">
                    {module.number}
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{module.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{module.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{module.lessons} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Play className="w-8 h-8 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {module.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{topic}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          <span className="font-semibold text-primary">Total: 36 lessons</span> • 
          <span className="ml-1">190 minutes of focused learning</span>
        </p>
      </div>
    </section>
  );
};

export default CourseCurriculum;