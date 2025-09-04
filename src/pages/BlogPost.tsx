
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, User, ArrowLeft, Clock, Share2, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BlogPost {
  id: string;
  tenant_id: string;
  author_id: string | null;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  status: 'published';
  published_at: string;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      
      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });

  // Set SEO meta tags when post loads
  useEffect(() => {
    if (post) {
      document.title = post.meta_title || `${post.title} - GO SG Blog`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.meta_description || post.excerpt || 'Read this article on GO SG Blog');
      }
      
      // Update meta keywords
      if (post.meta_keywords) {
        const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        metaKeywords.setAttribute('content', post.meta_keywords);
        if (!document.querySelector('meta[name="keywords"]')) {
          document.head.appendChild(metaKeywords);
        }
      }
    }
  }, [post]);

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        // You could add a toast notification here
      }
    } else if (post) {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">Loading blog post...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <Button variant="ghost" asChild>
                <Link to="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/blog/archive">
                    View Archive
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {post.author_id || 'GO SG Team'}
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {estimateReadingTime(post.content)} min read
              </div>
            </div>
            
            <Separator className="mt-6" />
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('#')) {
                const level = paragraph.match(/^#+/)?.[0].length || 1;
                const text = paragraph.replace(/^#+\s*/, '');
                const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                return (
                  <HeadingTag key={index} className={`text-${4 - Math.min(level - 1, 2)}xl font-bold mt-8 mb-4 first:mt-0`}>
                    {text}
                  </HeadingTag>
                );
              }
              return (
                <p key={index} className="mb-6 leading-relaxed text-lg">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Article Footer */}
          <footer className="mt-16 pt-8 border-t">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Button asChild>
                  <Link to="/blog">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    More Articles
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link to="/blog/archive">
                    Browse Archive
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Share this article:</span>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="mt-12 p-6 bg-primary/5 rounded-lg border">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to Grow Your Business?</h3>
                <p className="text-muted-foreground mb-4">
                  Get expert digital marketing solutions tailored to your needs.
                </p>
                <Button asChild>
                  <Link to="/contact">
                    Get Started Today
                  </Link>
                </Button>
              </div>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
