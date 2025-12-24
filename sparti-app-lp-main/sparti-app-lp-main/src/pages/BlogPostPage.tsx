import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import SpartiLogo from '@/components/LeadmapLogo';

// Extended blog post interface with full content
interface BlogPost {
  id: string;
  tag: string;
  title: string;
  date: Date;
  readTime: number;
  snippet: string;
  author: string;
  thumbnail: string;
  featuredImage: string;
  content: string;
}

// Mock data - in real app, this would come from API/database
const mockPost: BlogPost = {
  id: '1',
  tag: 'Technology',
  title: 'Planning a Website Redesign? Your Singapore Business Checklist',
  date: new Date('2025-11-26'),
  readTime: 4,
  snippet: 'Introduction: Why Strategy Matters More Than Design A website redesign Singapore project can strengthen yo',
  author: 'GOSG Consulting',
  thumbnail: '/placeholder.svg',
  featuredImage: '/placeholder.svg',
  content: `Introduction: Why Strategy Matters More Than Design

A website redesign Singapore project can strengthen your online presence, but only if you approach it strategically. Many businesses jump straight into design without considering the foundational elements that drive real results.

## 1. Start With a Performance Audit

Before you redesign, understand what's working and what isn't. Analyze your current website's performance metrics, user behavior, and conversion rates. This data will inform every decision you make.

**Key metrics to track:**
- Page load speed
- Bounce rate
- Conversion rate
- User engagement
- Mobile responsiveness

## 2. Set Clear Business Goals for the Redesign

What do you want to achieve with your redesign? Common goals include:
- Increasing lead generation
- Improving user experience
- Boosting search engine rankings
- Modernizing brand image
- Enhancing mobile experience

## 3. Create a Comprehensive Sitemap

A well-structured sitemap is crucial for both user navigation and SEO. Plan your information architecture before you start designing.

## 4. Prioritize Mobile-First Design

With mobile traffic dominating web usage in Singapore, your redesign must be mobile-first. Ensure all features work seamlessly on smaller screens.

## 5. Plan Your Content Refresh

Don't just move old content to a new design. Use the redesign as an opportunity to refresh, update, and optimize your content for both users and search engines.

## 6. Optimize for Page Speed

Fast-loading pages are essential for user experience and SEO. Optimize images, minimize code, and leverage caching strategies.

## 7. Set Up Proper Tracking

Before launching, ensure you have proper analytics and tracking in place. You'll want to measure the impact of your redesign.

## 8. Plan for 301 Redirects

If you're changing URLs, set up proper 301 redirects to preserve SEO value and prevent broken links.

## 9. Conduct Thorough QA Testing

Test everything before launch: forms, links, mobile responsiveness, cross-browser compatibility, and all interactive elements.

## Conclusion

A successful website redesign requires careful planning and strategic thinking. By following this checklist, you'll ensure your Singapore business gets maximum value from your redesign investment.`
};

// Related articles mock data
const relatedArticles = [
  {
    id: '2',
    tag: 'SINGAPORE',
    title: 'Looker Studio vs Traditional Reporting: What Singapore Marketers Need to Know',
    snippet: 'Introduction: Why Reporting Needs a Rethink in 2025 As campaigns become more complex across SEO, Google',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '3',
    tag: 'REPORTING',
    title: 'Google Analytics 4: Is It Right for Your Singapore Business?',
    snippet: 'Introduction: Why GA4 Matters for Singapore Businesses As businesses shift toward performance-driven',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '4',
    tag: 'OPTIMISATION SINGAPORE',
    title: 'Speed Up Your Singapore Website: Complete Optimization Guide',
    snippet: 'Introduction: Why Website Speed Optimisation Matters for Singapore Businesses Slow loading pages and',
    thumbnail: '/placeholder.svg'
  }
];

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    'Technology': 'bg-purple-100 text-purple-800',
    'SEO': 'bg-purple-100 text-purple-800',
    'SEM': 'bg-green-100 text-green-800',
    'SMA': 'bg-orange-100 text-orange-800',
    'Meta Ad': 'bg-pink-100 text-pink-800',
    'Google Ads': 'bg-red-100 text-red-800',
    'SINGAPORE': 'bg-blue-100 text-blue-800',
    'REPORTING': 'bg-gray-100 text-gray-800',
    'OPTIMISATION SINGAPORE': 'bg-blue-100 text-blue-800',
  };
  return colors[tag] || 'bg-gray-100 text-gray-800';
};

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const post = mockPost; // In real app, fetch by id

  const handleGetStarted = () => {
    window.location.href = 'https://app.sparti.ai/seo-copilot-trial';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.snippet,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

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

      {/* Hero Banner */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <div className="mb-4">
              <Badge 
                variant="outline" 
                className={`${getTagColor(post.tag)} border-0 text-sm font-medium px-3 py-1`}
              >
                {post.tag}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>{format(post.date, 'MMMM dd, yyyy')}</span>
              <span>•</span>
              <span>{post.readTime} min read</span>
              <span>•</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed space-y-6">
                {post.content.split('\n\n').map((paragraph, index) => {
                  // Skip empty paragraphs
                  if (!paragraph.trim()) return null;
                  
                  // Handle headings
                  if (paragraph.trim().startsWith('##')) {
                    const level = paragraph.match(/^#+/)?.[0].length || 2;
                    const text = paragraph.replace(/^#+\s/, '').trim();
                    const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                    return (
                      <HeadingTag 
                        key={index}
                        className={`font-bold text-foreground ${
                          level === 1 ? 'text-3xl mt-8 mb-4' :
                          level === 2 ? 'text-2xl mt-8 mb-4' :
                          level === 3 ? 'text-xl mt-6 mb-3' :
                          'text-lg mt-4 mb-2'
                        }`}
                      >
                        {text}
                      </HeadingTag>
                    );
                  }
                  
                  // Handle lists
                  if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
                    const items = paragraph.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'));
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 ml-4">
                        {items.map((item, itemIndex) => {
                          const text = item.replace(/^[-*]\s/, '').trim();
                          const processedText = text
                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.+?)\*/g, '<em>$1</em>');
                          return (
                            <li 
                              key={itemIndex}
                              className="text-foreground/90"
                              dangerouslySetInnerHTML={{ __html: processedText }}
                            />
                          );
                        })}
                      </ul>
                    );
                  }
                  
                  // Handle regular paragraphs with bold/italic
                  const processedParagraph = paragraph
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>');
                  
                  return (
                    <p 
                      key={index}
                      className="text-foreground/90 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: processedParagraph }}
                    />
                  );
                })}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="bg-white py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <Link key={article.id} to={`/blog/post/${article.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-border/50 bg-white h-full">
                    <div className="relative">
                      {/* Tag */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge 
                          variant="outline" 
                          className={`${getTagColor(article.tag)} border-0 text-xs font-medium px-2.5 py-0.5`}
                        >
                          {article.tag}
                        </Badge>
                      </div>
                      
                      {/* Thumbnail */}
                      <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                        <img 
                          src={article.thumbnail} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Title */}
                      <h3 className="text-lg font-semibold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>

                      {/* Snippet */}
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {article.snippet}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
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

export default BlogPostPage;

