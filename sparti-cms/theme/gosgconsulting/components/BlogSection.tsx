import React from 'react';
import { Button } from './ui/button';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  image?: string;
  category?: string;
}

interface BlogSectionProps {
  title?: string;
  subtitle?: string;
  posts?: BlogPost[];
  onPostClick?: (slug: string) => void;
  onViewAllClick?: () => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  title = 'Latest SEO Insights',
  subtitle = 'Stay ahead with our expert tips and strategies',
  posts = [],
  onPostClick,
  onViewAllClick
}) => {
  // Default blog posts if none provided
  const defaultPosts: BlogPost[] = [
    {
      id: 1,
      title: '10 Essential SEO Strategies for 2024',
      excerpt: 'Discover the latest SEO techniques that will help your website rank higher in search results.',
      slug: '10-essential-seo-strategies-2024',
      date: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      category: 'SEO Strategy'
    },
    {
      id: 2,
      title: 'How to Optimize Your Website for Local SEO',
      excerpt: 'Learn the key tactics to improve your local search visibility and attract more customers.',
      slug: 'optimize-website-local-seo',
      date: '2024-01-10',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      category: 'Local SEO'
    },
    {
      id: 3,
      title: 'The Complete Guide to Technical SEO',
      excerpt: 'Master the technical aspects of SEO to ensure your website is properly optimized.',
      slug: 'complete-guide-technical-seo',
      date: '2024-01-05',
      image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop',
      category: 'Technical SEO'
    }
  ];

  const displayPosts = posts.length > 0 ? posts.slice(0, 3) : defaultPosts;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {displayPosts.map((post) => (
            <div
              key={post.id}
              className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => onPostClick?.(post.slug)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.category && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="text-sm text-muted-foreground mb-3">
                  {formatDate(post.date)}
                </div>
                
                <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    GO SG Consulting
                  </span>
                  
                  <span className="inline-flex items-center text-primary group-hover:text-secondary font-medium text-sm transition-colors duration-300">
                    Read More →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            onClick={onViewAllClick}
            variant="outline"
            size="lg"
          >
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
