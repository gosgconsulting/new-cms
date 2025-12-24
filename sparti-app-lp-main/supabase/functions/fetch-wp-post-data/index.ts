import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WPPostData {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  status: string;
  title: {
    rendered: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching WordPress post data');
    
    const { brandId, postId } = await req.json();
    
    if (!brandId || !postId) {
      console.error('Missing brandId or postId parameter');
      return new Response(
        JSON.stringify({ error: 'brandId and postId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get WordPress integration configuration
    console.log(`Fetching WordPress integration for brand: ${brandId}`);
    
    const { data: wpIntegration, error: wpError } = await supabase
      .from('wordpress_integrations')
      .select('site_url, username, application_password, is_connected')
      .eq('brand_id', brandId)
      .maybeSingle();

    if (wpError) {
      console.error('WordPress integration fetch error:', wpError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch WordPress integration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!wpIntegration || !wpIntegration.is_connected) {
      return new Response(
        JSON.stringify({ error: 'WordPress integration not found or not connected' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let postData: WPPostData | null = null;

    try {
      console.log(`Fetching WordPress post ${postId} from:`, wpIntegration.site_url);
      
      const credentials = btoa(`${wpIntegration.username}:${wpIntegration.application_password}`);
      const wpResponse = await fetch(`${wpIntegration.site_url}/wp-json/wp/v2/posts/${postId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (wpResponse.ok) {
        postData = await wpResponse.json();
        console.log(`Found WordPress post data for ID: ${postId}`);
      } else {
        const errorText = await wpResponse.text();
        console.error('WordPress API error:', wpResponse.status, errorText);
      }
    } catch (error) {
      console.error('WordPress post data fetch error:', error);
    }

    if (!postData) {
      return new Response(
        JSON.stringify({ error: 'Post not found in WordPress' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Returning WordPress post data for ID: ${postId}`);
    
    return new Response(
      JSON.stringify({ 
        postData: {
          id: postData.id,
          publishedDate: postData.date,
          publishedDateGMT: postData.date_gmt,
          modifiedDate: postData.modified,
          modifiedDateGMT: postData.modified_gmt,
          status: postData.status,
          title: postData.title.rendered
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});