import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Is this suitable for complete beginners?",
      answer: "Absolutely! Our visual approach makes complex business and investment concepts accessible to everyone, regardless of your background. We start with the fundamentals and build up progressively."
    },
    {
      question: "How long does it take to complete the course?",
      answer: "The complete curriculum takes about 3 hours of focused learning time. However, lessons are designed to be bite-sized (5-10 minutes each) so you can learn at your own pace and fit it into your busy creative schedule."
    },
    {
      question: "What makes this different from other business courses?",
      answer: "We specifically designed this for creative professionals who think visually. Instead of dense text and boring presentations, we use infographics, animations, and real-world creative industry examples that actually make sense."
    },
    {
      question: "Do I get lifetime access?",
      answer: "Yes! Once you enroll, you have lifetime access to all current and future course materials. We regularly update content to reflect market changes and add new modules based on student feedback."
    },
    {
      question: "Is there any live support or community?",
      answer: "Yes! You get access to our private Discord community where you can ask questions, share insights, and connect with other creative professionals on their business journey. We also host monthly Q&A sessions."
    },
    {
      question: "What if I don't see results?",
      answer: "We're confident you'll gain valuable insights that boost your business confidence. However, if you're not satisfied within 30 days, we offer a full money-back guarantee. No questions asked."
    },
    {
      question: "Can I use this knowledge immediately?",
      answer: "Definitely! Each lesson includes practical frameworks and actionable steps you can implement right away. Many students report feeling more confident in business conversations within the first week."
    },
    {
      question: "Is the investment advice personalized?",
      answer: "The course covers general investment principles and strategies. While not personalized financial advice, you'll learn how to evaluate investments and make informed decisions. We always recommend consulting with a financial advisor for personal situations."
    }
  ];

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about transforming your business knowledge
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="bg-card border border-border rounded-lg px-6 hover:border-primary/20 transition-colors"
          >
            <AccordionTrigger className="text-left hover:no-underline py-6">
              <span className="font-semibold text-foreground pr-4">
                {faq.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-0">
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Still have questions? <span className="text-primary font-semibold cursor-pointer hover:underline">Contact our support team</span>
        </p>
      </div>
    </section>
  );
};

export default FAQ;