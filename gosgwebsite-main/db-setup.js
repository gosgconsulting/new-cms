import { Pool } from 'pg';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL
});

// Home page schema data
const homePageData = {
  slug: 'home',
  meta: {
    title: 'Home - GOSG Consulting',
    description: 'Professional SEO services in Singapore',
    keywords: 'SEO, Singapore, digital marketing',
    ogImage: '/assets/seo-results-1.png'
  },
  components: [
    {
      "key": "MainHeroSection",
      "name": "Hero",
      "type": "HeroSection",
      "items": [
        {
          "key": "badge",
          "icon": "clock",
          "type": "heading",
          "content": "Get Results in 3 Months"
        },
        {
          "key": "title",
          "type": "heading",
          "level": 1,
          "content": "Rank #1 on Google In 3 Months"
        },
        {
          "key": "description",
          "type": "text",
          "content": "We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website."
        },
        {
          "key": "button",
          "icon": "arrowRight",
          "type": "button",
          "content": "Get a Quote"
        }
      ]
    },
    {
      "key": "PainPointSection",
      "name": "PainPoint",
      "type": "PainPointSection",
      "items": [
        {
          "key": "badge",
          "type": "heading",
          "content": "You have a website but it's not generating clicks?"
        },
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "You Invest... But Nothing Happens?"
        },
        {
          "key": "painPoints",
          "type": "array",
          "items": [
            {
              "key": "point1",
              "icon": "x",
              "type": "text",
              "content": "Organic traffic stuck at 0"
            },
            {
              "key": "point2",
              "icon": "mousePointerClick",
              "type": "text",
              "content": "No clicks, no leads, no sales"
            },
            {
              "key": "point3",
              "icon": "barChart3",
              "type": "text",
              "content": "Competitors ranking above you"
            }
          ]
        }
      ]
    },
    {
      "key": "SEOResultsSection",
      "name": "Results",
      "type": "ResultsSection",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "Real SEO Results"
        },
        {
          "key": "subtitle",
          "type": "text",
          "content": "See how we've helped businesses like yours achieve remarkable growth through strategic SEO implementation."
        },
        {
          "key": "Result Slider",
          "type": "array",
          "items": [
            {
              "key": "Result slide 1",
              "type": "array",
              "items": [
                {
                  "alt": "",
                  "key": "Result slide 1 Image",
                  "src": "uploads/file-1761550152863-136823141.png",
                  "type": "image",
                  "settings": {
                    "layout": "full"
                  }
                },
                {
                  "key": "Result slide 1 Caption",
                  "type": "heading",
                  "level": 3,
                  "content": "+245% Organic Traffic in 6 months"
                }
              ]
            },
            {
              "key": "Result slide 2",
              "type": "array",
              "items": [
                {
                  "alt": "",
                  "key": "Result slide 2 Image",
                  "src": "uploads/file-1761550158362-325528087.png",
                  "type": "image",
                  "settings": {
                    "layout": "full"
                  }
                },
                {
                  "key": "Result slide 2 Caption",
                  "type": "heading",
                  "level": 3,
                  "content": "+180% Organic Traffic in 4 months"
                }
              ]
            }
          ]
        },
        {
          "key": "button",
          "type": "button",
          "content": "Become Our Next Case Study"
        }
      ]
    },
    {
      "key": "WhatIsSEOSection",
      "name": "What is SEO",
      "type": "SEOExplanation",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "What is SEO?"
        },
        {
          "key": "description",
          "type": "text",
          "content": "Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search results. Here's how we make it work for your business:"
        },
        {
          "key": "services",
          "type": "array",
          "items": [
            {
              "key": "service1",
              "type": "array",
              "items": [
                {
                  "key": "service1_title",
                  "icon": "search",
                  "type": "heading",
                  "level": 3,
                  "content": "Keyword Research"
                },
                {
                  "key": "service1_description",
                  "type": "text",
                  "content": "In-depth analysis to identify high-value keywords that drive qualified traffic to your business."
                }
              ]
            },
            {
              "key": "service2",
              "type": "array",
              "items": [
                {
                  "key": "service2_title",
                  "icon": "fileText",
                  "type": "heading",
                  "level": 3,
                  "content": "On-Page Optimization"
                },
                {
                  "key": "service2_description",
                  "type": "text",
                  "content": "Optimize your website content, meta tags, and structure for maximum search engine visibility."
                }
              ]
            }
          ]
        },
        {
          "key": "ctaText",
          "type": "text",
          "content": "Ready to see how SEO can transform your business?"
        },
        {
          "key": "ctaButton",
          "type": "button",
          "content": "Start Your SEO Partnership"
        }
      ]
    },
    {
      "key": "TestimonialsSection",
      "name": "Testimonials",
      "type": "Testimonials",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "What our clients say"
        },
        {
          "key": "subtitle",
          "type": "text",
          "content": "See what our customers have to say about our SEO services and results."
        },
        {
          "key": "testimonials",
          "type": "array",
          "items": [
            {
              "key": "testimonial1",
              "type": "array",
              "items": [
                {
                  "alt": "Sarah Chen",
                  "key": "testimonial1_image",
                  "src": "https://randomuser.me/api/portraits/women/1.jpg",
                  "type": "image"
                },
                {
                  "key": "testimonial1_text",
                  "type": "text",
                  "content": "GoSG's SEO strategies boosted our organic traffic by 400% in just 3 months. Our website now ranks #1 for our main keywords."
                },
                {
                  "key": "testimonial1_name",
                  "type": "heading",
                  "level": 4,
                  "content": "Sarah Chen"
                },
                {
                  "key": "testimonial1_role",
                  "type": "text",
                  "content": "Marketing Director"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "key": "ContactSection",
      "name": "Contact",
      "type": "ContactForm",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "Get In Touch"
        },
        {
          "key": "description",
          "type": "text",
          "content": "Have questions about our services or want to discuss your marketing needs? Fill out the form, and we'll get back to you shortly."
        },
        {
          "key": "contactInfo",
          "type": "array",
          "items": [
            {
              "key": "phone",
              "type": "text",
              "content": "+65 8024 6850"
            },
            {
              "key": "calendar",
              "link": "https://calendly.com/gosgconsulting/oliver-shih",
              "type": "text",
              "content": "Schedule a meeting"
            }
          ]
        }
      ]
    }
  ]
};

// Create database schema and insert initial data
const setupDatabase = async () => {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Create page_schemas table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_schemas (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        meta JSONB NOT NULL DEFAULT '{}',
        components JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Table page_schemas created or already exists');
    
    // Insert home page data
    await client.query(
      'INSERT INTO page_schemas (slug, meta, components) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET meta = $2, components = $3, updated_at = NOW()',
      [homePageData.slug, homePageData.meta, homePageData.components]
    );
    
    console.log('Home page data inserted or updated');
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Database setup completed successfully');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error setting up database:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
};

// Run setup
setupDatabase();