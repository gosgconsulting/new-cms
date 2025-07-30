
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWordPressPosts } from "@/hooks/use-wordpress";
import { Calendar, User } from "lucide-react";

const Blog = () => {
  const { data: posts, isLoading, error } = useWordPressPosts({
    status: 'publish',
    per_page: 10,
    orderby: 'date',
    order: 'desc'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">Loading blog posts...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading blog posts. Please try again later.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights, tips, and updates from our team
            </p>
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="md:flex">
                    {post.featured_media && (
                      <div className="md:w-1/3">
                        <img
                          src={`/wp-content/uploads/${post.featured_media}`}
                          alt={post.title.rendered}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={post.featured_media ? "md:w-2/3" : "w-full"}>
                      <CardHeader>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                           <div className="flex items-center">
                             <User className="h-4 w-4 mr-1" />
                             {post.author || 'Unknown Author'}
                           </div>
                        </div>
                        <CardTitle className="text-2xl hover:text-coral transition-colors">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title.rendered}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-base">
                          {post.excerpt?.rendered ? 
                            post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
                            post.content.rendered.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="text-coral hover:text-coral/80 font-medium"
                        >
                          Read more →
                        </Link>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No blog posts yet</h2>
              <p className="text-muted-foreground">
                Check back soon for updates and insights from our team.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
