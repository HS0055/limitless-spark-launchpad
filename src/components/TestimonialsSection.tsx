import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import testimonial1 from "@/assets/testimonial-sarah.jpg";
import testimonial2 from "@/assets/testimonial-marcus.jpg";
import testimonial3 from "@/assets/testimonial-emily.jpg";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Creative Director",
      company: "Design Studio",
      content: "The visual approach to business concepts completely transformed how I understand finance and strategy. Now I can confidently discuss budgets and growth plans with my team.",
      rating: 5,
      image: testimonial1
    },
    {
      name: "Marcus Rodriguez",
      role: "Freelance Designer",
      company: "Independent",
      content: "I went from avoiding business conversations to leading them. The bite-sized lessons fit perfectly into my busy schedule, and the visual format just clicks.",
      rating: 5,
      image: testimonial2
    },
    {
      name: "Emily Chen",
      role: "UX Designer",
      company: "Tech Startup",
      content: "Finally, business education that doesn't put me to sleep! The concepts are explained so clearly that I actually look forward to each lesson.",
      rating: 5,
      image: testimonial3
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          What our <span className="text-primary">students say</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join hundreds of creative professionals who've already transformed their business confidence
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <Quote className="w-6 h-6 text-primary mb-4" />
              
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
               <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;