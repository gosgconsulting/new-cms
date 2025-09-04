
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft, Clock, Share2, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWordPressPostBySlug, useWordPressCategories, useWordPressTags } from "@/hooks/use-wordpress";

interface BlogPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  categories: number[];
  tags: number[];
  author: number;
  featured_media: number;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useWordPressPostBySlug(slug || '');
  const { data: categories } = useWordPressCategories();
  const { data: tags } = useWordPressTags();

  // Set SEO meta tags when post loads
  useEffect(() => {
    if (post) {
      document.title = `${post.title.rendered} - GO SG Blog`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
        metaDescription.setAttribute('content', excerpt || 'Read this article on GO SG Blog');
      }
    }
  }, [post]);

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title.rendered,
          text: post.excerpt.rendered.replace(/<[^>]*>/g, ''),
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else if (post) {
      navigator.clipboard.writeText(window.location.href);
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

          {/* Featured Image - WordPress doesn't have direct featured_image URL, skip for now */}
          
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title.rendered}
            </h1>
            
            {post.excerpt.rendered && (
              <div 
                className="text-xl text-muted-foreground mb-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              />
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                GO SG Team
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {estimateReadingTime(post.content.rendered)} min read
              </div>
            </div>

            {/* Categories and Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {post.categories.map(categoryId => {
                const category = categories?.find(cat => cat.id === categoryId);
                return category ? (
                  <Badge key={categoryId} variant="secondary" className="bg-coral/10 text-coral">
                    {category.name}
                  </Badge>
                ) : null;
              })}
              {post.tags.map(tagId => {
                const tag = tags?.find(t => t.id === tagId);
                return tag ? (
                  <Badge key={tagId} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ) : null;
              })}
            </div>
            
            <Separator className="mt-6" />
          </header>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

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
