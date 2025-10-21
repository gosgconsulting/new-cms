-- Blog Posts Schema

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private', 'trash')),
  post_type VARCHAR(50) DEFAULT 'post',
  author_id INTEGER,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

-- Create terms table for categories and tags
CREATE TABLE IF NOT EXISTS terms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  taxonomy VARCHAR(50) NOT NULL, -- 'category', 'post_tag', etc.
  description TEXT,
  parent_id INTEGER REFERENCES terms(id) ON DELETE SET NULL,
  UNIQUE(slug, taxonomy)
);

-- Create post_terms table for relationships between posts and terms
CREATE TABLE IF NOT EXISTS post_terms (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  term_id INTEGER REFERENCES terms(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, term_id)
);

-- Create post_meta table for custom fields
CREATE TABLE IF NOT EXISTS post_meta (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  meta_key VARCHAR(255) NOT NULL,
  meta_value TEXT,
  UNIQUE(post_id, meta_key)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  author_url VARCHAR(255),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'spam', 'trash')),
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO terms (name, slug, taxonomy, description) VALUES
('SEO Strategy', 'seo-strategy', 'category', 'Articles about SEO strategy and planning'),
('Local SEO', 'local-seo', 'category', 'Articles about local SEO optimization'),
('Technical SEO', 'technical-seo', 'category', 'Articles about technical SEO implementation'),
('Content Marketing', 'content-marketing', 'category', 'Articles about content marketing strategies'),
('Link Building', 'link-building', 'category', 'Articles about link building techniques'),
('Mobile SEO', 'mobile-seo', 'category', 'Articles about mobile SEO optimization')
ON CONFLICT (slug, taxonomy) DO NOTHING;

-- Insert sample tags
INSERT INTO terms (name, slug, taxonomy, description) VALUES
('SEO', 'seo', 'post_tag', 'Search Engine Optimization'),
('Digital Marketing', 'digital-marketing', 'post_tag', 'Digital Marketing strategies'),
('Strategy', 'strategy', 'post_tag', 'Strategic planning'),
('Google Business', 'google-business', 'post_tag', 'Google Business Profile'),
('Reviews', 'reviews', 'post_tag', 'Customer reviews'),
('Website Speed', 'website-speed', 'post_tag', 'Website performance optimization'),
('Mobile', 'mobile', 'post_tag', 'Mobile optimization'),
('Content', 'content', 'post_tag', 'Content creation'),
('Marketing', 'marketing', 'post_tag', 'Marketing techniques'),
('Backlinks', 'backlinks', 'post_tag', 'Backlink strategies')
ON CONFLICT (slug, taxonomy) DO NOTHING;

-- Insert sample blog posts
INSERT INTO posts (title, slug, excerpt, content, featured_image, status, post_type, author_id, view_count, published_at) VALUES
(
  '10 Essential SEO Strategies for 2024',
  '10-essential-seo-strategies-2024',
  'Discover the latest SEO techniques that will help your website rank higher in search results and drive more organic traffic.',
  '<h2>Introduction</h2>
<p>Search Engine Optimization continues to evolve, and staying ahead of the curve is crucial for online success. In this comprehensive guide, we'll explore the most effective SEO strategies that will help your website dominate search results in 2024.</p>

<h2>1. Focus on User Experience (UX)</h2>
<p>Google's algorithms increasingly prioritize websites that provide excellent user experiences. This means fast loading times, mobile responsiveness, intuitive navigation, and engaging content that keeps visitors on your site.</p>

<h2>2. Optimize for Core Web Vitals</h2>
<p>Core Web Vitals are essential metrics that Google uses to measure user experience. Focus on improving your Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS) scores.</p>

<h2>3. Create High-Quality, E-E-A-T Content</h2>
<p>Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) are crucial ranking factors. Create content that demonstrates your expertise and builds trust with your audience.</p>

<h2>4. Implement Structured Data</h2>
<p>Schema markup helps search engines understand your content better and can lead to rich snippets in search results, improving your click-through rates.</p>

<h2>5. Optimize for Voice Search</h2>
<p>With the rise of voice assistants, optimizing for conversational queries and long-tail keywords is more important than ever.</p>

<h2>Conclusion</h2>
<p>Implementing these SEO strategies will position your website for success in 2024 and beyond. Remember, SEO is a long-term game that requires consistent effort and adaptation to algorithm changes.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
  'published',
  'post',
  1,
  245,
  '2024-01-15 08:30:00'
),
(
  'How to Optimize Your Website for Local SEO',
  'optimize-website-local-seo',
  'Learn the key tactics to improve your local search visibility and attract more customers from your area.',
  '<h2>Why Local SEO Matters</h2>
<p>Local SEO helps businesses promote their products and services to local customers at the exact time they're looking for them online. With mobile searches for "near me" queries growing exponentially, local SEO is more critical than ever.</p>

<h2>Optimize Your Google Business Profile</h2>
<p>Your Google Business Profile is the cornerstone of local SEO. Ensure all information is accurate, complete, and regularly updated with posts, photos, and customer reviews.</p>

<h2>Build Local Citations</h2>
<p>Consistent NAP (Name, Address, Phone) information across all online directories and platforms helps establish trust and authority with search engines.</p>

<h2>Create Location-Specific Content</h2>
<p>Develop content that speaks to your local audience, including local news, events, and community involvement.</p>

<h2>Get Customer Reviews</h2>
<p>Positive reviews not only influence potential customers but also signal to search engines that your business is trustworthy and relevant.</p>',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
  'published',
  'post',
  1,
  187,
  '2024-01-10 10:15:00'
),
(
  'The Complete Guide to Technical SEO',
  'complete-guide-technical-seo',
  'Master the technical aspects of SEO to ensure your website is properly optimized for search engines.',
  '<h2>What is Technical SEO?</h2>
<p>Technical SEO refers to optimizing your website's infrastructure to help search engines crawl, index, and understand your content more effectively.</p>

<h2>Site Speed Optimization</h2>
<p>Page speed is a critical ranking factor. Compress images, minify code, leverage browser caching, and use a Content Delivery Network (CDN) to improve load times.</p>

<h2>Mobile-First Indexing</h2>
<p>Google now primarily uses the mobile version of content for indexing and ranking. Ensure your site is fully responsive and provides an excellent mobile experience.</p>

<h2>XML Sitemaps and Robots.txt</h2>
<p>Submit an XML sitemap to help search engines discover your pages, and use robots.txt to control which pages should be crawled.</p>

<h2>HTTPS Security</h2>
<p>Secure your website with HTTPS. It's a ranking signal and builds trust with visitors.</p>

<h2>Fix Crawl Errors</h2>
<p>Regularly check Google Search Console for crawl errors and fix broken links, redirect chains, and 404 errors.</p>',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&h=600&fit=crop',
  'published',
  'post',
  1,
  213,
  '2024-01-05 14:45:00'
)
ON CONFLICT (slug) DO NOTHING;

-- Associate posts with categories and tags
-- First, get the IDs
DO $$
DECLARE
    post1_id INTEGER;
    post2_id INTEGER;
    post3_id INTEGER;
    cat1_id INTEGER;
    cat2_id INTEGER;
    cat3_id INTEGER;
    tag1_id INTEGER;
    tag2_id INTEGER;
    tag3_id INTEGER;
    tag4_id INTEGER;
    tag5_id INTEGER;
    tag6_id INTEGER;
    tag7_id INTEGER;
BEGIN
    -- Get post IDs
    SELECT id INTO post1_id FROM posts WHERE slug = '10-essential-seo-strategies-2024';
    SELECT id INTO post2_id FROM posts WHERE slug = 'optimize-website-local-seo';
    SELECT id INTO post3_id FROM posts WHERE slug = 'complete-guide-technical-seo';
    
    -- Get category IDs
    SELECT id INTO cat1_id FROM terms WHERE slug = 'seo-strategy' AND taxonomy = 'category';
    SELECT id INTO cat2_id FROM terms WHERE slug = 'local-seo' AND taxonomy = 'category';
    SELECT id INTO cat3_id FROM terms WHERE slug = 'technical-seo' AND taxonomy = 'category';
    
    -- Get tag IDs
    SELECT id INTO tag1_id FROM terms WHERE slug = 'seo' AND taxonomy = 'post_tag';
    SELECT id INTO tag2_id FROM terms WHERE slug = 'digital-marketing' AND taxonomy = 'post_tag';
    SELECT id INTO tag3_id FROM terms WHERE slug = 'strategy' AND taxonomy = 'post_tag';
    SELECT id INTO tag4_id FROM terms WHERE slug = 'google-business' AND taxonomy = 'post_tag';
    SELECT id INTO tag5_id FROM terms WHERE slug = 'reviews' AND taxonomy = 'post_tag';
    SELECT id INTO tag6_id FROM terms WHERE slug = 'website-speed' AND taxonomy = 'post_tag';
    SELECT id INTO tag7_id FROM terms WHERE slug = 'mobile' AND taxonomy = 'post_tag';
    
    -- Associate posts with categories
    IF post1_id IS NOT NULL AND cat1_id IS NOT NULL THEN
        INSERT INTO post_terms (post_id, term_id) VALUES (post1_id, cat1_id) ON CONFLICT DO NOTHING;
    END IF;
    
    IF post2_id IS NOT NULL AND cat2_id IS NOT NULL THEN
        INSERT INTO post_terms (post_id, term_id) VALUES (post2_id, cat2_id) ON CONFLICT DO NOTHING;
    END IF;
    
    IF post3_id IS NOT NULL AND cat3_id IS NOT NULL THEN
        INSERT INTO post_terms (post_id, term_id) VALUES (post3_id, cat3_id) ON CONFLICT DO NOTHING;
    END IF;
    
    -- Associate posts with tags
    IF post1_id IS NOT NULL THEN
        IF tag1_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post1_id, tag1_id) ON CONFLICT DO NOTHING;
        END IF;
        IF tag2_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post1_id, tag2_id) ON CONFLICT DO NOTHING;
        END IF;
        IF tag3_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post1_id, tag3_id) ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    IF post2_id IS NOT NULL THEN
        IF tag1_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post2_id, tag1_id) ON CONFLICT DO NOTHING;
        END IF;
        IF tag4_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post2_id, tag4_id) ON CONFLICT DO NOTHING;
        END IF;
        IF tag5_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post2_id, tag5_id) ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    IF post3_id IS NOT NULL THEN
        IF tag1_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post3_id, tag1_id) ON CONFLICT DO NOTHING;
        END IF;
        IF tag6_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post3_id, tag6_id) ON CONFLICT DO NOTHING;
        END IF;
        IF tag7_id IS NOT NULL THEN
            INSERT INTO post_terms (post_id, term_id) VALUES (post3_id, tag7_id) ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;
