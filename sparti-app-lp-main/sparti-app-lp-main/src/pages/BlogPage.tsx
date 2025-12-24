import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import SpartiLogo from '@/components/LeadmapLogo';

// Mock data for blog posts
interface BlogPost {
  id: string;
  tag: string;
  title: string;
  date: Date;
  readTime: number;
  snippet: string;
  author: string;
  thumbnail: string;
}

const mockPosts: BlogPost[] = [
  {
    id: '1',
    tag: 'Technology',
    title: 'Planning a Website Redesign? Your Singapore...',
    date: new Date('2025-11-26'),
    readTime: 4,
    snippet: 'Introduction: Why Strategy Matters More Than Design A website redesign Singapore project can strengthen yo',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '2',
    tag: 'Meta Ad',
    title: '7 Meta Ad Creative Mistakes Singapore Brands Keep...',
    date: new Date('2025-11-25'),
    readTime: 3,
    snippet: 'Introduction: Why Creative Is the Real Driver of Meta Ads Performance As Meta becomes increasingly automat.',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '3',
    tag: 'SEO',
    title: 'What Does SEO Actually Cost in Singapore? [2025...',
    date: new Date('2025-11-24'),
    readTime: 3,
    snippet: 'Introduction: Why SEO Pricing Confuses Most Singapore Businesses One of the most common questions',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '4',
    tag: 'Technology',
    title: 'Looker Studio vs Traditional Reporting: What Singapor...',
    date: new Date('2025-11-23'),
    readTime: 3,
    snippet: 'Introduction: Why Reporting Needs a Rethink in 2025 As campaigns become more complex across SEO, Google',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '5',
    tag: 'Google Ads',
    title: 'Google Ads in 2025: What\'s Changing for Singapore..',
    date: new Date('2025-11-22'),
    readTime: 3,
    snippet: 'Introduction: Navigating the New Google Ads Landscape With rising CPCs, stricter privacy regulations, a',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '6',
    tag: 'SEO',
    title: 'Building Quality Backlinks: A Singapore Business Owne...',
    date: new Date('2025-11-21'),
    readTime: 4,
    snippet: 'Introduction: Why Backlinks Matter for Singapore Businesses If you\'ve ever wondered why your competitors rank',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '7',
    tag: 'Technology',
    title: 'Google Analytics 4: Is It Right for Your Singapore Business?',
    date: new Date('2025-11-20'),
    readTime: 3,
    snippet: 'Introduction: Why GA4 Matters for Singapore Businesses As businesses shift toward performance-driven',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '8',
    tag: 'Technology',
    title: 'Speed Up Your Singapore Website: Complete...',
    date: new Date('2025-11-19'),
    readTime: 3,
    snippet: 'Introduction: Why Website Speed Optimisation Matters for Singapore Businesses Slow loading pages and',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '9',
    tag: 'Meta Ad',
    title: 'How Much Do Meta Ads Really Cost in Singapore?',
    date: new Date('2025-11-17'),
    readTime: 4,
    snippet: 'Introduction: Understanding What Drives Meta Ads Cost in Singapore "Why are my Meta Ads getting more',
    author: 'GOSG Consulting',
    thumbnail: '/placeholder.svg'
  },
];

const categories = [
  { name: 'All', count: null },
  { name: 'SEM', count: 14 },
  { name: 'SEO', count: 18 },
  { name: 'SMA', count: 12 },
  { name: 'Technology', count: 11 },
];

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    'Technology': 'bg-blue-100 text-blue-800',
    'SEO': 'bg-purple-100 text-purple-800',
    'SEM': 'bg-green-100 text-green-800',
    'SMA': 'bg-orange-100 text-orange-800',
    'Meta Ad': 'bg-pink-100 text-pink-800',
    'Google Ads': 'bg-red-100 text-red-800',
    'NPM': 'bg-yellow-100 text-yellow-800',
  };
  return colors[tag] || 'bg-gray-100 text-gray-800';
};

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleGetStarted = () => {
    // Redirect to external Sparti app
    window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
  };

  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.tag === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Navigation */}
      <nav className="w-full py-4 px-6 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <SpartiLogo size="md" showText />
          <div className="flex items-center gap-4">
            <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              SEO Insights &{' '}
              <span className="text-primary">Expert Tips</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-muted-foreground text-base md:text-lg mb-8">
              Stay ahead of the curve with our latest SEO strategies, industry insights, and actionable tips to grow your online presence.
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <h2 className="text-xl font-semibold mb-6 text-foreground">Categories</h2>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.name}>
                    <button
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-blue-50 text-primary font-medium border border-blue-200'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {category.name}
                      {category.count !== null && (
                        <span className="ml-2 text-sm">({category.count})</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Section - Article Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={`/blog/post/${post.id}`}>
                <Card 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-border/50 bg-white h-full"
                >
                  <div className="relative">
                    {/* Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge 
                        variant="outline" 
                        className={`${getTagColor(post.tag)} border-0 text-xs font-medium px-2.5 py-0.5`}
                      >
                        {post.tag}
                      </Badge>
                    </div>
                    
                    {/* Thumbnail */}
                    <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                    {/* Date and Reading Time */}
                    <p className="text-sm text-muted-foreground mb-4">
                      {format(post.date, 'MMMM dd, yyyy')} • {post.readTime} min read
                    </p>

                    {/* Snippet */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                      {post.snippet}
                    </p>

                    {/* Author */}
                    <p className="text-sm text-muted-foreground mb-4 font-medium">
                      {post.author}
                    </p>

                    {/* Read More Link */}
                    <div className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <SpartiLogo size="sm" showText />
              <span className="text-muted-foreground">© 2024 Sparti. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="https://app.sparti.ai/seo-copilot-trial" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;

