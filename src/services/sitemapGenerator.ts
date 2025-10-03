/**
 * Dynamic Sitemap Generator Service
 * Automatically generates XML sitemap with WordPress blog posts
 */

import { wordpressApi, WordPressPost } from './wordpressApi';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

class SitemapGeneratorService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://gosgconsulting.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate static URLs for the sitemap
   */
  private getStaticUrls(): SitemapUrl[] {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return [
      {
        loc: `${this.baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/services/seo`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/services/website-design`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/services/paid-ads`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/services/social-media`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/services/reporting`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/contact`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/blog`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/sitemap`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.3
      }
    ];
  }

  /**
   * Fetch WordPress blog posts and convert to sitemap URLs
   */
  private async getBlogPostUrls(): Promise<SitemapUrl[]> {
    try {
      const posts = await wordpressApi.getPosts({
        per_page: 100, // Get all posts
        orderby: 'date',
        order: 'desc'
      });

      return posts.map(post => ({
        loc: `${this.baseUrl}/blog/${post.slug}`,
        lastmod: new Date(post.modified).toISOString().split('T')[0],
        changefreq: 'monthly' as const,
        priority: 0.7
      }));
    } catch (error) {
      console.error('[testing] Error fetching blog posts for sitemap:', error);
      return [];
    }
  }

  /**
   * Generate complete XML sitemap
   */
  async generateXmlSitemap(): Promise<string> {
    const staticUrls = this.getStaticUrls();
    const blogUrls = await this.getBlogPostUrls();
    const allUrls = [...staticUrls, ...blogUrls];

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    const urlElements = allUrls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    const xmlFooter = `
</urlset>`;

    return xmlHeader + urlElements + xmlFooter;
  }

  /**
   * Generate sitemap data for React components
   */
  async getSitemapData(): Promise<{
    static: SitemapUrl[];
    blog: SitemapUrl[];
    total: number;
    lastUpdated: string;
  }> {
    const staticUrls = this.getStaticUrls();
    const blogUrls = await this.getBlogPostUrls();

    return {
      static: staticUrls,
      blog: blogUrls,
      total: staticUrls.length + blogUrls.length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Check if sitemap needs updating based on latest blog post
   */
  async needsUpdate(currentSitemapDate?: string): Promise<boolean> {
    if (!currentSitemapDate) return true;

    try {
      const latestPosts = await wordpressApi.getPosts({
        per_page: 1,
        orderby: 'modified',
        order: 'desc'
      });

      if (latestPosts.length === 0) return false;

      const latestPostDate = new Date(latestPosts[0].modified);
      const sitemapDate = new Date(currentSitemapDate);

      return latestPostDate > sitemapDate;
    } catch (error) {
      console.error('[testing] Error checking sitemap update needs:', error);
      return false;
    }
  }

  /**
   * Download XML sitemap as file (for manual updates)
   */
  async downloadSitemap(): Promise<void> {
    try {
      const xmlContent = await this.generateXmlSitemap();
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[testing] Error downloading sitemap:', error);
    }
  }
}

// Export singleton instance
export const sitemapGenerator = new SitemapGeneratorService();
export default sitemapGenerator;
