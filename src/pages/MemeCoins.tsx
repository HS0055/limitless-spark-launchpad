import SectionLayout from "@/components/SectionLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MessageSquare, Share2, Eye, Heart, DollarSign, Zap, Activity } from "lucide-react";

const MemeCoins = () => {
  const trendingCoins = [
    {
      name: "DogeCoin",
      symbol: "DOGE",
      price: "$0.087",
      change: "+15.2%",
      isPositive: true,
      marketCap: "$12.3B",
      volume: "$892M",
      description: "The original meme coin that started it all"
    },
    {
      name: "Shiba Inu",
      symbol: "SHIB", 
      price: "$0.000009",
      change: "+8.7%",
      isPositive: true,
      marketCap: "$5.2B",
      volume: "$234M",
      description: "The Dogecoin killer with a strong community"
    },
    {
      name: "Pepe Coin",
      symbol: "PEPE",
      price: "$0.000001",
      change: "-3.1%",
      isPositive: false,
      marketCap: "$420M",
      volume: "$45M",
      description: "Based on the popular Pepe the Frog meme"
    },
    {
      name: "Floki Inu",
      symbol: "FLOKI",
      price: "$0.000156",
      change: "+12.4%",
      isPositive: true,
      marketCap: "$1.5B",
      volume: "$89M",
      description: "Named after Elon Musk's dog"
    }
  ];

  const articles = [
    {
      title: "The Psychology Behind Meme Coin Investing",
      author: "CryptoExpert",
      readTime: "5 min read",
      likes: 142,
      comments: 28,
      image: "psychology-article",
      category: "Analysis"
    },
    {
      title: "How to Spot the Next Big Meme Coin",
      author: "TokenHunter",
      readTime: "8 min read", 
      likes: 89,
      comments: 15,
      image: "spotting-article",
      category: "Strategy"
    },
    {
      title: "Community Power: What Makes Meme Coins Successful",
      author: "CommunityGuru",
      readTime: "6 min read",
      likes: 205,
      comments: 43,
      image: "community-article", 
      category: "Community"
    }
  ];

  const forumPosts = [
    {
      title: "🚀 DOGE to the moon? Technical analysis inside",
      author: "CryptoTrader99",
      replies: 156,
      likes: 89,
      timeAgo: "2h ago",
      isHot: true
    },
    {
      title: "New meme coin just launched - BONK potential?",
      author: "MemeHunter",
      replies: 73,
      likes: 45,
      timeAgo: "4h ago",
      isHot: false
    },
    {
      title: "Portfolio review: 70% meme coins, am I crazy?",
      author: "YOLOInvestor",
      replies: 234,
      likes: 112,
      timeAgo: "6h ago",
      isHot: true
    }
  ];

  const stats = [
    { number: "$45.2B", label: "Total Meme Market", icon: DollarSign, color: "text-primary" },
    { number: "2,847", label: "Active Coins", icon: Activity, color: "text-accent-secondary" },
    { number: "15.7%", label: "Weekly Growth", icon: TrendingUp, color: "text-accent-tertiary" },
    { number: "892K", label: "Community Members", icon: Zap, color: "text-primary" }
  ];

  return (
    <SectionLayout 
      sectionName="Meme Coins" 
      sectionIcon={TrendingUp}
      sectionColor="from-accent-secondary to-accent-tertiary"
    >
      
      {/* Hero Section */}
      <section className="content-section pt-24 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-accent-secondary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-tertiary/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="content-container">
          <div className="section-header">
            <div className="inline-flex items-center bg-gradient-to-r from-accent-secondary/10 to-accent-tertiary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-accent-secondary/20 shadow-lg animate-scale-in">
              <TrendingUp className="w-4 h-4 text-accent-secondary mr-2" />
              <span className="text-sm font-semibold text-gradient">🚀 Meme Coin Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Meme Coin
              <br />
              <span className="text-gradient">Central</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
              Stay updated with the latest meme coin trends, analysis, and community discussions. 
              <span className="text-accent-secondary font-bold"> Track, learn, and connect</span> with fellow meme coin enthusiasts.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Feed Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header mb-16">
            <h2 className="section-title animate-slide-up">
              <span className="text-gradient">Live</span> Meme Coin Feed
            </h2>
            <p className="section-subtitle animate-fade-in">
              Real-time prices and market data for trending meme cryptocurrencies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            {trendingCoins.map((coin, index) => (
              <Card 
                key={coin.symbol} 
                className="card-elevated hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <CardTitle className="text-lg font-bold">{coin.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                    </div>
                    <Badge variant={coin.isPositive ? 'default' : 'destructive'} className="font-semibold">
                      {coin.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-bold text-xl">{coin.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Market Cap</span>
                      <span className="font-semibold">{coin.marketCap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volume</span>
                      <span className="font-semibold">{coin.volume}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-muted-foreground mb-4">{coin.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      {coin.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      Analyze
                    </Button>
                    <Button size="sm" variant="outline" className="hover-glow">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Articles & Forum Section */}
      <section className="content-section">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Articles */}
            <div>
              <h3 className="text-3xl font-display font-bold mb-8 text-gradient-secondary">Latest Articles</h3>
              <div className="space-y-6">
                {articles.map((article, index) => (
                  <Card key={index} className="card-glass hover-lift">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline">{article.category}</Badge>
                        <span className="text-sm text-muted-foreground">{article.readTime}</span>
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-foreground">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">by {article.author}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{article.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{article.comments}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Read
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Forum */}
            <div>
              <h3 className="text-3xl font-display font-bold mb-8 text-gradient-secondary">Community Forum</h3>
              <div className="space-y-4">
                {forumPosts.map((post, index) => (
                  <Card key={index} className="card-glass hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-base font-semibold text-foreground pr-2">{post.title}</h4>
                        {post.isHot && <Badge variant="destructive" className="text-xs">HOT</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">by {post.author} • {post.timeAgo}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.replies} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Join Discussion</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button className="w-full mt-6 btn-hero">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Start New Discussion
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SectionLayout>
  );
};

export default MemeCoins;