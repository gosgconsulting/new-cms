import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MigrationResult {
  page: string;
  success: boolean;
  id?: number;
  url?: string;
  type?: 'post' | 'page';
  error?: string;
}

interface PageMigrationData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  status: 'publish' | 'draft';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request received:', req.method)
    const body = await req.json()
    console.log('Request body:', body)
    const { action, pageData } = body
    
    // Get WordPress credentials from Supabase secrets
    const username = Deno.env.get('WORDPRESS_USERNAME')
    const password = Deno.env.get('WORDPRESS_PASSWORD')
    
    console.log('Username available:', !!username)
    console.log('Password available:', !!password)
    
    if (!username || !password) {
      console.error('WordPress credentials missing')
      throw new Error('WordPress credentials not found in environment')
    }

    const credentials = btoa(`${username}:${password}`)
    const wpApiUrl = 'https://gosgconsulting.com/wp-json/wp/v2'

    if (action === 'test-connection') {
      // Test WordPress connection using posts API
      const response = await fetch(`${wpApiUrl}/posts?per_page=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      })

      if (response.ok) {
        const posts = await response.json()
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Connection successful! Found ${posts.length} existing posts` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        const errorText = await response.text()
        throw new Error(`Connection failed: ${response.status} - ${errorText}`)
      }
    }

    if (action === 'test-create') {
      // Test post creation
      const testPostData = {
        title: 'Test Post - Delete Me',
        content: '<p>This is a test post created to verify permissions.</p>',
        status: 'draft',
        slug: 'test-post-delete-me'
      }

      const response = await fetch(`${wpApiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(testPostData)
      })

      if (response.ok) {
        const result = await response.json()
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Post creation successful! Created: ${result.title.rendered}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        const errorText = await response.text()
        throw new Error(`Post creation failed: ${response.status} - ${errorText}`)
      }
    }

    if (action === 'create-post' && pageData) {
      // Create a WordPress post
      const response = await fetch(`${wpApiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(pageData)
      })

      if (response.ok) {
        const result = await response.json()
        return new Response(
          JSON.stringify({ 
            success: true, 
            post: result,
            message: `Successfully created: ${result.title.rendered}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        const errorText = await response.text()
        throw new Error(`Failed to create post: ${response.status} - ${errorText}`)
      }
    }

    if (action === 'migrate-all') {
      // Migrate all pages with full HTML content
      const pages: PageMigrationData[] = [
        {
          title: 'Home',
          slug: 'home',
          content: `
            <div style="width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center;">
                <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">Welcome to GOSG Consulting</h1>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Your digital marketing partner for growth and success</p>
                <a href="/contact" style="background: white; color: #667eea; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Get Started</a>
              </div>
              
              <!-- Services Section -->
              <div style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333;">Our Services</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">Website Design</h3>
                    <p style="color: #666; line-height: 1.6;">Custom websites that convert visitors into customers</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">SEO Services</h3>
                    <p style="color: #666; line-height: 1.6;">Boost your online visibility and organic traffic</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">Paid Advertising</h3>
                    <p style="color: #666; line-height: 1.6;">Strategic ad campaigns that deliver results</p>
                  </div>
                </div>
              </div>
            </div>
          `,
          excerpt: 'Welcome to GOSG Consulting - Your digital marketing partner',
          meta_description: 'GOSG Consulting - Expert digital marketing services to grow your business online',
          status: 'publish'
        },
        {
          title: 'Website Design Services',
          slug: 'website-design',
          content: `
            <div style="width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 80px 20px; text-align: center;">
                <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">Professional Website Design</h1>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Custom websites that convert visitors into customers</p>
                <a href="/contact" style="background: white; color: #4f46e5; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Get Your Website</a>
              </div>
              
              <!-- Features Section -->
              <div style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333;">What We Offer</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #4f46e5; margin-bottom: 1rem;">Responsive Design</h3>
                    <p style="color: #666; line-height: 1.6;">Mobile-first designs that look perfect on all devices</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #4f46e5; margin-bottom: 1rem;">SEO Optimized</h3>
                    <p style="color: #666; line-height: 1.6;">Built for search engine visibility from day one</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #4f46e5; margin-bottom: 1rem;">Fast Performance</h3>
                    <p style="color: #666; line-height: 1.6;">Optimized for speed and user experience</p>
                  </div>
                </div>
              </div>
            </div>
          `,
          excerpt: 'Professional website design services',
          meta_description: 'Professional website design services that convert visitors into customers',
          status: 'publish'
        },
        {
          title: 'SEO Services',
          slug: 'seo-services',
          content: `
            <div style="width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 80px 20px; text-align: center;">
                <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">Search Engine Optimization</h1>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Boost your online visibility and organic traffic</p>
                <a href="/contact" style="background: white; color: #059669; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Improve Your Rankings</a>
              </div>
              
              <!-- Services Section -->
              <div style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333;">SEO Solutions</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #059669; margin-bottom: 1rem;">Keyword Research</h3>
                    <p style="color: #666; line-height: 1.6;">Find the right keywords to target your audience</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #059669; margin-bottom: 1rem;">On-Page SEO</h3>
                    <p style="color: #666; line-height: 1.6;">Optimize your content and technical elements</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #059669; margin-bottom: 1rem;">Link Building</h3>
                    <p style="color: #666; line-height: 1.6;">Build authority with quality backlinks</p>
                  </div>
                </div>
              </div>
            </div>
          `,
          excerpt: 'Professional SEO services',
          meta_description: 'Professional SEO services to boost your online visibility and organic traffic',
          status: 'publish'
        },
        {
          title: 'Paid Advertising',
          slug: 'paid-ads',
          content: `
            <div style="width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 80px 20px; text-align: center;">
                <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">Paid Advertising Services</h1>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Strategic ad campaigns that deliver measurable results</p>
                <a href="/contact" style="background: white; color: #dc2626; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Start Advertising</a>
              </div>
              
              <!-- Platforms Section -->
              <div style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333;">Advertising Platforms</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #dc2626; margin-bottom: 1rem;">Google Ads</h3>
                    <p style="color: #666; line-height: 1.6;">Reach customers when they're searching for your services</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #dc2626; margin-bottom: 1rem;">Facebook Ads</h3>
                    <p style="color: #666; line-height: 1.6;">Target your ideal audience on social media</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #dc2626; margin-bottom: 1rem;">LinkedIn Ads</h3>
                    <p style="color: #666; line-height: 1.6;">Connect with professionals and B2B prospects</p>
                  </div>
                </div>
              </div>
            </div>
          `,
          excerpt: 'Strategic paid advertising services',
          meta_description: 'Strategic paid advertising services that deliver measurable results',
          status: 'publish'
        },
        {
          title: 'Social Media Marketing',
          slug: 'social-media',
          content: `
            <div style="width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; padding: 80px 20px; text-align: center;">
                <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">Social Media Marketing</h1>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Build your brand presence across social platforms</p>
                <a href="/contact" style="background: white; color: #8b5cf6; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Grow Your Presence</a>
              </div>
              
              <!-- Services Section -->
              <div style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333;">Social Media Services</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #8b5cf6; margin-bottom: 1rem;">Content Creation</h3>
                    <p style="color: #666; line-height: 1.6;">Engaging content that resonates with your audience</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #8b5cf6; margin-bottom: 1rem;">Community Management</h3>
                    <p style="color: #666; line-height: 1.6;">Build relationships and engage with your followers</p>
                  </div>
                  <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color: #8b5cf6; margin-bottom: 1rem;">Analytics & Reporting</h3>
                    <p style="color: #666; line-height: 1.6;">Track performance and optimize your strategy</p>
                  </div>
                </div>
              </div>
            </div>
          `,
          excerpt: 'Social media marketing services',
          meta_description: 'Social media marketing services to build your brand presence',
          status: 'publish'
        },
        {
          title: 'Contact Us',
          slug: 'contact',
          content: `
            <div style="width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 80px 20px; text-align: center;">
                <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">Contact GOSG Consulting</h1>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Get in touch with our team of digital marketing experts</p>
              </div>
              
              <!-- Contact Info Section -->
              <div style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem;">
                  <div style="text-align: center;">
                    <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem;">Get In Touch</h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 2rem;">Ready to grow your business? Contact us today for a free consultation.</p>
                    <div style="background: #f9fafb; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <p style="color: #1f2937; font-weight: 600; margin-bottom: 0.5rem;">Email</p>
                      <p style="color: #666;">contact@gosgconsulting.com</p>
                    </div>
                  </div>
                  <div style="text-align: center;">
                    <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem;">Our Services</h3>
                    <ul style="list-style: none; padding: 0; color: #666; line-height: 1.8;">
                      <li>• Website Design & Development</li>
                      <li>• Search Engine Optimization</li>
                      <li>• Paid Advertising Campaigns</li>
                      <li>• Social Media Marketing</li>
                      <li>• Digital Marketing Strategy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          `,
          excerpt: 'Contact GOSG Consulting',
          meta_description: 'Contact GOSG Consulting - Get in touch with our digital marketing experts',
          status: 'publish'
        }
      ]

      const results: MigrationResult[] = []
      
      for (const page of pages) {
        try {
          // Create as WordPress posts instead of pages
          const response = await fetch(`${wpApiUrl}/posts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify(page)
          })

          if (response.ok) {
            const result = await response.json()
            results.push({
              page: page.title,
              success: true,
              id: result.id,
              url: result.link,
              type: 'post'
            })
          } else {
            const errorText = await response.text()
            results.push({
              page: page.title,
              success: false,
              error: `${response.status}: ${errorText}`
            })
          }
        } catch (error) {
          results.push({
            page: page.title,
            success: false,
            error: error.message
          })
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Edge function error:', error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})