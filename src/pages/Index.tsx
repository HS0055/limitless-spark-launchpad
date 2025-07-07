import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Target, Users, Star, CheckCircle, ArrowRight, Zap, BarChart3, Briefcase, TrendingUp, BookOpen, GraduationCap, Award, Clock, Trophy, Calendar, DollarSign, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState({
    revenue: '',
    costs: '',
    marketing: '',
    growth: ''
  });

  const handleJoinNow = () => {
    navigate('/dashboard');
  };

  const handleInputChange = (field: string, value: string) => {
    setFinancialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // League Data
  const leagueStats = [
    { name: "Revenue Champions", participants: "1,247", prize: "$50,000", status: "Active" },
    { name: "Growth Masters", participants: "892", prize: "$25,000", status: "Starting Soon" },
    { name: "Profit Builders", participants: "654", prize: "$15,000", status: "Registration Open" }
  ];

  const leaderboard = [
    { rank: 1, name: "Alex Chen", company: "TechFlow", revenue: "$2.4M", growth: "+340%" },
    { rank: 2, name: "Sarah Martinez", company: "GrowthCo", revenue: "$1.8M", growth: "+285%" },
    { rank: 3, name: "David Park", company: "ScaleUp", revenue: "$1.2M", growth: "+210%" },
    { rank: 4, name: "Emma Wilson", company: "InnovateLab", revenue: "$980K", growth: "+180%" },
    { rank: 5, name: "Michael Johnson", company: "VentureX", revenue: "$750K", growth: "+165%" }
  ];

  // Business Fundamentals Spreadsheet Data
  const financialMetrics = [
    { metric: "Monthly Revenue", q1: 50000, q2: 65000, q3: 78000, q4: 95000 },
    { metric: "Operating Costs", q1: 30000, q2: 38000, q3: 42000, q4: 48000 },
    { metric: "Marketing Spend", q1: 8000, q2: 12000, q3: 15000, q4: 20000 },
    { metric: "Net Profit", q1: 12000, q2: 15000, q3: 21000, q4: 27000 },
    { metric: "Customer Acquisition", q1: 120, q2: 180, q3: 240, q4: 320 }
  ];

  const calculateROI = () => {
    const revenue = parseFloat(financialData.revenue) || 0;
    const costs = parseFloat(financialData.costs) || 0;
    const marketing = parseFloat(financialData.marketing) || 0;
    const totalCosts = costs + marketing;
    return totalCosts > 0 ? ((revenue - totalCosts) / totalCosts * 100).toFixed(1) : '0';
  };

  // Psychological urgency stats
  const urgencyStats = [
    { number: "1,247", text: "Professionals enrolled this week", subtext: "Limited seats remaining", color: "text-blue-500" },
    { number: "$45K", text: "Average salary increase", subtext: "Within 6 months completion", color: "text-green-500" },
    { number: "12 hrs", text: "Left for early bird pricing", subtext: "Save 70% today only", color: "text-red-500" }
  ];

  const features = [
    {
      icon: Target,
      title: "Strategic Business Thinking",
      description: "Master the frameworks used by Fortune 500 executives to make million-dollar decisions with confidence"
    },
    {
      icon: BarChart3,
      title: "Financial Intelligence", 
      description: "Understand P&L, cash flow, and financial metrics that separate successful leaders from the rest"
    },
    {
      icon: Users,
      title: "Leadership Psychology",
      description: "Learn the hidden psychology of influence and leadership that top executives use to drive results"
    },
    {
      icon: TrendingUp,
      title: "Growth Strategies",
      description: "Proven methodologies to scale businesses, increase profits, and create sustainable competitive advantages"
    }
  ];

  const benefits = [
    "MBA-level business education without the degree",
    "Real case studies from Fortune 500 companies", 
    "Interactive financial modeling and analysis tools",
    "Personal mentorship from industry executives",
    "Exclusive network of ambitious professionals",
    "Lifetime access to updated content and resources"
  ];

  const testimonials = [
    {
      name: "David Kumar",
      role: "Senior Manager",
      company: "Tech Corp",
      content: "This program gave me the strategic thinking skills that got me promoted to Director level with a 40% salary increase.",
      avatar: "DK",
      rating: 5,
      growth: "+$32K salary increase"
    },
    {
      name: "Lisa Zhang", 
      role: "Entrepreneur",
      company: "Startup Founder",
      content: "The financial intelligence module helped me secure $2M in Series A funding. The ROI calculations were spot-on.",
      avatar: "LZ",
      rating: 5,
      growth: "Raised $2M funding"
    },
    {
      name: "Robert Chen",
      role: "Business Consultant", 
      company: "McKinsey & Co",
      content: "Even as a consultant, I learned frameworks here that I now use with Fortune 500 clients. Absolutely transformative.",
      avatar: "RC",
      rating: 5,
      growth: "Promoted to Principal"
    }
  ];

  return (
    <PublicLayout 
      sectionName="Business Fundamentals" 
      sectionIcon={Target}
      sectionColor="from-blue-500 to-purple-500"
    >
      {/* Psychological Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Urgency Badge */}
            <div className="inline-flex items-center bg-red-500/10 text-red-600 px-6 py-3 rounded-full border border-red-500/20 animate-pulse">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-bold">CAREER ACCELERATION: Limited Time 70% OFF!</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Think Like a <span className="text-gradient bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">CEO</span>
              <br />
              Get Paid Like <span className="text-gradient bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">One</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              While others struggle with basic business concepts, you'll master the 
              <span className="text-blue-500 font-bold"> strategic frameworks</span> that Fortune 500 executives use to make million-dollar decisions.
            </p>

            {/* Psychological Social Proof */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
              {urgencyStats.map((stat, index) => (
                <Card key={index} className="text-center p-6 border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-0">
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                    <div className="font-semibold mb-1">{stat.text}</div>
                    <div className="text-sm text-muted-foreground">{stat.subtext}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main CTA */}
            <div className="space-y-6">
              <Button 
                onClick={handleJoinNow}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-black text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group animate-pulse"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 group-hover:animate-bounce" />
                  START YOUR CEO TRANSFORMATION FREE
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <p className="text-sm text-muted-foreground">
                🎓 MBA-Level Education • 💼 No Degree Required • ⚡ Start Today
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business League Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <Trophy className="w-10 h-10 inline-block mr-3 text-yellow-500" />
              Business Fundamentals <span className="text-blue-500">League</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Compete with fellow entrepreneurs and win real prizes while mastering business skills
            </p>
          </div>

          <Tabs defaultValue="leagues" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="leagues">Active Leagues</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="calculator">Financial Calculator</TabsTrigger>
            </TabsList>

            <TabsContent value="leagues" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {leagueStats.map((league, index) => (
                  <Card key={index} className="p-6 hover:scale-105 transition-all duration-300 border-border/30 hover:border-primary/30">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{league.name}</CardTitle>
                      <Badge variant={league.status === 'Active' ? 'default' : 'secondary'}>
                        {league.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-semibold">{league.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="font-bold text-green-500">{league.prize}</span>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Join League
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Current Leaderboard - Revenue Champions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((player) => (
                        <TableRow key={player.rank}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {player.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                              {player.rank === 2 && <Trophy className="w-4 h-4 text-gray-400" />}
                              {player.rank === 3 && <Trophy className="w-4 h-4 text-amber-600" />}
                              #{player.rank}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>{player.company}</TableCell>
                          <TableCell className="font-semibold text-green-600">{player.revenue}</TableCell>
                          <TableCell className="font-semibold text-blue-600">{player.growth}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle>Business Calculator</CardTitle>
                    <p className="text-muted-foreground">Calculate your ROI and business metrics</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Monthly Revenue ($)</label>
                      <Input 
                        type="number" 
                        placeholder="50000"
                        value={financialData.revenue}
                        onChange={(e) => handleInputChange('revenue', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Operating Costs ($)</label>
                      <Input 
                        type="number" 
                        placeholder="30000"
                        value={financialData.costs}
                        onChange={(e) => handleInputChange('costs', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Marketing Spend ($)</label>
                      <Input 
                        type="number" 
                        placeholder="8000"
                        value={financialData.marketing}
                        onChange={(e) => handleInputChange('marketing', e.target.value)}
                      />
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Return on Investment</p>
                        <p className="text-2xl font-bold text-green-600">{calculateROI()}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader>
                    <CardTitle>Financial Metrics Spreadsheet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Q1</TableHead>
                          <TableHead>Q2</TableHead>
                          <TableHead>Q3</TableHead>
                          <TableHead>Q4</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financialMetrics.map((metric, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{metric.metric}</TableCell>
                            <TableCell>${metric.q1.toLocaleString()}</TableCell>
                            <TableCell>${metric.q2.toLocaleString()}</TableCell>
                            <TableCell>${metric.q3.toLocaleString()}</TableCell>
                            <TableCell>${metric.q4.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Master What <span className="text-blue-500">Top Executives</span> Know
            </h2>
            <p className="text-xl text-muted-foreground">
              The same strategic frameworks taught in $200,000 MBA programs, now accessible to you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-0">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories with Growth Stats */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Real Results from <span className="text-green-500">Real Professionals</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See how business fundamentals transformed these careers in months, not years
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                {/* Success Badge */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {testimonial.growth}
                </div>
                
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 italic text-lg">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final Urgency CTA */}
      <section className="py-20 bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center bg-red-500/10 text-red-600 px-6 py-3 rounded-full border border-red-500/20">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-bold">Your Competition Is Already Learning</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Don't Let This
              <br />
              <span className="text-gradient">Moment Pass</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every day you wait, someone else is getting the promotion, the raise, or starting the business you've been dreaming about. 
              Your future self will thank you for starting today.
            </p>
          </div>

          <Button 
            onClick={handleJoinNow}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 group animate-pulse"
          >
            <span className="flex items-center gap-3">
              <Award className="w-6 h-6 group-hover:animate-bounce" />
              TRANSFORM YOUR CAREER NOW - FREE
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            ⚡ Instant access • 🎯 No risk • 🚀 Start your transformation today
          </p>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
