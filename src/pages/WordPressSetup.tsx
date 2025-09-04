import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WordPressConnectionTester from '@/components/WordPressConnectionTester';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Globe, Database, Settings } from 'lucide-react';

const WordPressSetup = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">WordPress API Integration</h1>
            <p className="text-xl text-muted-foreground">
              Connect your WordPress blog to display content seamlessly in your app
            </p>
          </div>

          <Tabs defaultValue="tester" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tester" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Connection Test
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Usage Examples
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="setup" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Setup Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tester">
              <WordPressConnectionTester />
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Using WordPress Data in Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Fetch WordPress Posts</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { useWordPressPosts } from '@/hooks/use-wordpress';

const BlogSection = () => {
  const { data: posts, isLoading } = useWordPressPosts({
    per_page: 10,
    status: 'publish'
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {posts?.map(post => (
        <article key={post.id}>
          <h2>{post.title.rendered}</h2>
          <div dangerouslySetInnerHTML={{ 
            __html: post.excerpt.rendered 
          }} />
        </article>
      ))}
    </div>
  );
};`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Fetch Single Post by Slug</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { useWordPressPostBySlug } from '@/hooks/use-wordpress';

const BlogPost = ({ slug }) => {
  const { data: post, isLoading } = useWordPressPostBySlug(slug);

  if (isLoading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <article>
      <h1>{post.title.rendered}</h1>
      <div dangerouslySetInnerHTML={{ 
        __html: post.content.rendered 
      }} />
    </article>
  );
};`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Custom WordPress URL</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { configureWordPressAPI } from '@/lib/wordpress-api';

// Create a custom API instance for a different WordPress site
const customApi = configureWordPressAPI('https://your-other-site.com');
const posts = await customApi.getPosts({ per_page: 5 });`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Public Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Published posts and pages</li>
                      <li>• Categories and tags</li>
                      <li>• Featured images</li>
                      <li>• Custom fields (ACF support)</li>
                      <li>• Search and filtering</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      WordPress Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• All published content</li>
                      <li>• Media and attachments</li>
                      <li>• SEO metadata</li>
                      <li>• Pagination support</li>
                      <li>• Real-time content updates</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• React Query caching (5min stale time)</li>
                      <li>• Optimistic updates</li>
                      <li>• Background refetching</li>
                      <li>• Error boundaries</li>
                      <li>• Loading states</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security & Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Public API - no credentials needed</li>
                      <li>• CORS-friendly requests</li>
                      <li>• Built-in rate limiting</li>
                      <li>• Error sanitization</li>
                      <li>• Lightweight and fast</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>WordPress REST API Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. Enable WordPress REST API</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      The WordPress REST API is enabled by default in WordPress 4.7+. Verify it's working:
                    </p>
                    <pre className="bg-muted p-2 rounded text-sm">
                      https://your-site.com/wp-json/wp/v2/posts
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Public Content Access</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      This integration accesses only public WordPress content:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Published posts and pages</li>
                      <li>• Categories and tags</li>
                      <li>• Featured images and media</li>
                      <li>• Public custom fields</li>
                      <li>• No authentication required</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. CORS Configuration (If Needed)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      If you encounter CORS issues, add this to your WordPress theme's functions.php:
                    </p>
                    <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
{`add_action('rest_api_init', function() {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function($value) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    return $value;
  });
});`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">4. Test Your Setup</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the Connection Tester tab above to verify your WordPress API is accessible and working correctly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WordPressSetup;