import { wordpressApi } from '@/lib/wordpress-api';

interface PageMigrationData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'publish';
  template?: string;
}

export const migrateReactPagesToWordPress = async () => {
  const pagesToMigrate: PageMigrationData[] = [
    {
      title: 'Homepage',
      slug: 'homepage',
      content: `
        <h1>Digital Marketing Excellence</h1>
        <p>Transform your business with our comprehensive digital marketing solutions.</p>
        
        <h2>Our Services</h2>
        <ul>
          <li>Website Design & Development</li>
          <li>SEO Optimization</li>
          <li>Paid Advertising</li>
          <li>Cloud Hosting Services</li>
        </ul>
        
        <h2>Why Choose Us</h2>
        <p>Expert team, proven results, and dedicated support for your digital success.</p>
      `,
      excerpt: 'Transform your business with our comprehensive digital marketing solutions.',
      meta_title: 'GO SG - Digital Marketing Agency Singapore',
      meta_description: 'Leading digital marketing agency in Singapore offering SEO, web design, and paid advertising services.',
      status: 'publish',
      template: 'page-homepage.php'
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      content: `
        <h1>Get In Touch</h1>
        <p>Ready to grow your business? Contact our team of digital marketing experts.</p>
        
        <h2>Contact Information</h2>
        <p>Email: hello@gosg.com</p>
        <p>Phone: +65 1234 5678</p>
        
        <h2>Office Location</h2>
        <p>Singapore Business Hub<br>
        123 Marketing Street<br>
        Singapore 123456</p>
      `,
      excerpt: 'Ready to grow your business? Contact our team of digital marketing experts.',
      meta_title: 'Contact GO SG | Digital Marketing Agency Singapore',
      meta_description: 'Get in touch with GO SG for your digital marketing needs. We\'re here to help grow your business online.',
      status: 'publish'
    },
    {
      title: 'Website Design Services',
      slug: 'website-design',
      content: `
        <h1>Professional Website Design</h1>
        <p>Custom, responsive websites that convert visitors into customers.</p>
        
        <h2>Our Website Design Process</h2>
        <ol>
          <li>Discovery & Planning</li>
          <li>Design & Wireframing</li>
          <li>Development & Testing</li>
          <li>Launch & Optimization</li>
        </ol>
        
        <h2>Features Included</h2>
        <ul>
          <li>Responsive Design</li>
          <li>SEO Optimization</li>
          <li>Fast Loading Speed</li>
          <li>Mobile-First Approach</li>
        </ul>
      `,
      excerpt: 'Custom, responsive websites that convert visitors into customers.',
      meta_title: 'Website Design Services Singapore | GO SG',
      meta_description: 'Professional website design and development services in Singapore. Custom, responsive websites that convert.',
      status: 'publish'
    },
    {
      title: 'SEO Services',
      slug: 'seo-services',
      content: `
        <h1>Search Engine Optimization</h1>
        <p>Boost your website rankings and increase organic traffic with our expert SEO services.</p>
        
        <h2>SEO Services Include</h2>
        <ul>
          <li>Keyword Research & Analysis</li>
          <li>On-Page Optimization</li>
          <li>Technical SEO Audit</li>
          <li>Link Building</li>
          <li>Content Marketing</li>
        </ul>
        
        <h2>Results You Can Expect</h2>
        <p>Higher search rankings, increased organic traffic, and improved online visibility.</p>
      `,
      excerpt: 'Boost your website rankings and increase organic traffic with our expert SEO services.',
      meta_title: 'SEO Services Singapore | Search Engine Optimization',
      meta_description: 'Boost your website rankings with our expert SEO services in Singapore. Increase organic traffic and visibility.',
      status: 'publish'
    },
    {
      title: 'Paid Advertising Services',
      slug: 'paid-advertising',
      content: `
        <h1>Paid Advertising Campaigns</h1>
        <p>Drive immediate results with targeted paid advertising campaigns across multiple platforms.</p>
        
        <h2>Advertising Platforms</h2>
        <ul>
          <li>Google Ads</li>
          <li>Facebook Ads</li>
          <li>Instagram Advertising</li>
          <li>LinkedIn Ads</li>
        </ul>
        
        <h2>Campaign Management</h2>
        <p>Full campaign setup, optimization, and performance tracking for maximum ROI.</p>
      `,
      excerpt: 'Drive immediate results with targeted paid advertising campaigns across multiple platforms.',
      meta_title: 'Paid Advertising Services Singapore | PPC Management',
      meta_description: 'Professional paid advertising services in Singapore. Google Ads, Facebook Ads, and more for maximum ROI.',
      status: 'publish'
    },
    {
      title: 'Cloud Hosting Services',
      slug: 'cloud-hosting',
      content: `
        <h1>Reliable Cloud Hosting</h1>
        <p>Secure, fast, and scalable cloud hosting solutions for your business needs.</p>
        
        <h2>Hosting Features</h2>
        <ul>
          <li>99.9% Uptime Guarantee</li>
          <li>SSD Storage</li>
          <li>Free SSL Certificates</li>
          <li>Daily Backups</li>
          <li>24/7 Support</li>
        </ul>
        
        <h2>Hosting Plans</h2>
        <p>Flexible hosting plans to suit businesses of all sizes.</p>
      `,
      excerpt: 'Secure, fast, and scalable cloud hosting solutions for your business needs.',
      meta_title: 'Cloud Hosting Services Singapore | Reliable Web Hosting',
      meta_description: 'Professional cloud hosting services in Singapore. 99.9% uptime, SSD storage, and 24/7 support.',
      status: 'publish'
    }
  ];

  const results = [];

  for (const pageData of pagesToMigrate) {
    try {
      console.log(`Migrating page: ${pageData.title}`);
      
      // WordPress REST API with Application Password authentication
      const username = 'admin'; // Your WordPress username
      const password = '1n5q WknY lU1C hGXI 3Yzm 8dah'; // Your application password
      const credentials = btoa(`${username}:${password}`);
      
      const response = await fetch(`https://gosgconsulting.com/cms/wp-json/wp/v2/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({
          title: pageData.title,
          slug: pageData.slug,
          content: pageData.content,
          excerpt: pageData.excerpt,
          status: pageData.status,
          meta: {
            _yoast_wpseo_title: pageData.meta_title,
            _yoast_wpseo_metadesc: pageData.meta_description,
          }
        })
      });

      if (response.ok) {
        const createdPage = await response.json();
        results.push({
          success: true,
          page: pageData.title,
          wordpressId: createdPage.id,
          url: createdPage.link
        });
        console.log(`✅ Successfully created: ${pageData.title}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      results.push({
        success: false,
        page: pageData.title,
        error: error.message
      });
      console.error(`❌ Failed to create ${pageData.title}:`, error);
    }
  }

  return results;
};

// Alternative: Generate WordPress export XML
export const generateWordPressExportXML = () => {
  const pages = [
    // Same page data as above
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <title>GO SG Pages Export</title>
    <description>Migrated pages from React app</description>
    ${pages.map(page => `
    <item>
      <title><![CDATA[${page.title}]]></title>
      <wp:post_name><![CDATA[${page.slug}]]></wp:post_name>
      <wp:post_type><![CDATA[page]]></wp:post_type>
      <wp:status><![CDATA[${page.status}]]></wp:status>
      <content:encoded><![CDATA[${page.content}]]></content:encoded>
      <excerpt:encoded><![CDATA[${page.excerpt}]]></excerpt:encoded>
    </item>
    `).join('')}
  </channel>
</rss>`;

  return xml;
};