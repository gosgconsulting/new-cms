import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogPost } from "@/hooks/useBlogData";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost({ slug: slug || "" });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {error ? "Failed to load blog post." : "The blog post you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Format date
  const formattedDate = post.date || post.created_at
    ? new Date(post.date || post.created_at || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // Calculate read time if not provided
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = post.readTime || `${Math.ceil(wordCount / 200)} min read`;

  // Get category badge color
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Company Incorporation":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "Accounting & Tax":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "Corporate Secretary":
        return "bg-pink-100 text-pink-700 hover:bg-pink-200";
      case "Compliance & Regulations":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-6 pt-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/blog" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className="container mx-auto px-6 mb-8">
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.style.background = 'linear-gradient(135deg, hsl(263 70% 59%), hsl(263 60% 45%))';
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <article className="container mx-auto px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Category Badge */}
          {post.category && (
            <div className="mb-4">
              <Badge className={getCategoryBadgeColor(post.category)}>
                {post.category}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            )}
            {readTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readTime}</span>
              </div>
            )}
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
              prose-h1:text-4xl prose-h1:font-bold prose-h1:mt-10 prose-h1:mb-6
              prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
              prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2
              prose-h5:text-lg prose-h5:font-semibold prose-h5:mt-4 prose-h5:mb-2
              prose-h6:text-base prose-h6:font-semibold prose-h6:mt-4 prose-h6:mb-2
              prose-p:text-muted-foreground prose-p:mb-4 prose-p:leading-7 prose-p:text-base
              prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80
              prose-strong:text-foreground prose-strong:font-bold
              prose-em:text-foreground prose-em:italic
              prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:mb-4
              prose-pre code:bg-transparent prose-pre code:p-0
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:text-muted-foreground prose-blockquote:italic
              prose-img:rounded-lg prose-img:my-6 prose-img:shadow-md prose-img:w-full prose-img:h-auto
              prose-ul:text-muted-foreground prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
              prose-ol:text-muted-foreground prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
              prose-li:my-1 prose-li:leading-7
              prose-hr:my-8 prose-hr:border-t prose-hr:border-border
              prose-table:w-full prose-table:my-4 prose-table:border-collapse
              prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:bg-muted prose-th:text-foreground prose-th:font-semibold prose-th:text-left
              prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-td:text-muted-foreground
              prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-2 prose-figcaption:text-center
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;

