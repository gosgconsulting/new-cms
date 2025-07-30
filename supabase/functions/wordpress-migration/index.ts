import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { action, pageData } = await req.json()
    
    // Get WordPress credentials from Supabase secrets
    const username = Deno.env.get('WORDPRESS_USERNAME')
    const password = Deno.env.get('WORDPRESS_PASSWORD')
    
    if (!username || !password) {
      throw new Error('WordPress credentials not found in environment')
    }

    const credentials = btoa(`${username}:${password}`)
    const wpApiUrl = 'https://gosgconsulting.com/cms/wp-json/wp/v2'

    if (action === 'test-connection') {
      // Test WordPress connection
      const response = await fetch(`${wpApiUrl}/pages?per_page=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      })

      if (response.ok) {
        const pages = await response.json()
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Connection successful! Found ${pages.length} existing pages` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        const errorText = await response.text()
        throw new Error(`Connection failed: ${response.status} - ${errorText}`)
      }
    }

    if (action === 'test-create') {
      // Test page creation
      const testPageData = {
        title: 'Test Page - Delete Me',
        content: '<p>This is a test page created to verify permissions.</p>',
        status: 'draft',
        slug: 'test-page-delete-me'
      }

      const response = await fetch(`${wpApiUrl}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(testPageData)
      })

      if (response.ok) {
        const result = await response.json()
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Page creation successful! Created: ${result.title.rendered}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        const errorText = await response.text()
        throw new Error(`Page creation failed: ${response.status} - ${errorText}`)
      }
    }

    if (action === 'create-page' && pageData) {
      // Create a WordPress page
      const response = await fetch(`${wpApiUrl}/pages`, {
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
            page: result,
            message: `Successfully created: ${result.title.rendered}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        const errorText = await response.text()
        throw new Error(`Failed to create page: ${response.status} - ${errorText}`)
      }
    }

    if (action === 'migrate-all') {
      // Migrate all pages
      const pages: PageMigrationData[] = [
        {
          title: 'Home',
          slug: 'home',
          content: '<div class="home-page"><h1>Welcome to GOSG Consulting</h1><p>Your digital marketing partner for growth and success.</p></div>',
          excerpt: 'Welcome to GOSG Consulting - Your digital marketing partner',
          meta_description: 'GOSG Consulting - Expert digital marketing services to grow your business online',
          status: 'publish'
        },
        {
          title: 'Website Design Services',
          slug: 'website-design',
          content: '<div class="service-page"><h1>Professional Website Design</h1><p>Custom websites that convert visitors into customers.</p></div>',
          excerpt: 'Professional website design services',
          meta_description: 'Professional website design services that convert visitors into customers',
          status: 'publish'
        },
        {
          title: 'SEO Services',
          slug: 'seo-services',
          content: '<div class="service-page"><h1>Search Engine Optimization</h1><p>Boost your online visibility and organic traffic.</p></div>',
          excerpt: 'Professional SEO services',
          meta_description: 'Professional SEO services to boost your online visibility and organic traffic',
          status: 'publish'
        },
        {
          title: 'Paid Advertising',
          slug: 'paid-ads',
          content: '<div class="service-page"><h1>Paid Advertising Services</h1><p>Strategic ad campaigns that deliver results.</p></div>',
          excerpt: 'Strategic paid advertising services',
          meta_description: 'Strategic paid advertising services that deliver measurable results',
          status: 'publish'
        },
        {
          title: 'Social Media Marketing',
          slug: 'social-media',
          content: '<div class="service-page"><h1>Social Media Marketing</h1><p>Build your brand presence across social platforms.</p></div>',
          excerpt: 'Social media marketing services',
          meta_description: 'Social media marketing services to build your brand presence',
          status: 'publish'
        },
        {
          title: 'Contact Us',
          slug: 'contact',
          content: '<div class="contact-page"><h1>Contact GOSG Consulting</h1><p>Get in touch with our team of experts.</p></div>',
          excerpt: 'Contact GOSG Consulting',
          meta_description: 'Contact GOSG Consulting - Get in touch with our digital marketing experts',
          status: 'publish'
        }
      ]

      const results = []
      
      for (const page of pages) {
        try {
          const response = await fetch(`${wpApiUrl}/pages`, {
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
              url: result.link
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})