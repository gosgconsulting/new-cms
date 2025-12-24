import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CMSAuthor {
  id: number;
  name: string;
  slug: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching CMS authors');
    
    const { brandId } = await req.json();
    
    if (!brandId) {
      console.error('Missing brandId parameter');
      return new Response(
        JSON.stringify({ error: 'brandId is required' }),
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
      .single();

    if (wpError) {
      console.error('WordPress integration fetch error:', wpError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch WordPress integration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let authors: CMSAuthor[] = [];

    // Fetch WordPress authors
    if (wpIntegration && wpIntegration.site_url && wpIntegration.username && wpIntegration.application_password && wpIntegration.is_connected) {
      try {
        console.log('Fetching WordPress authors from:', wpIntegration.site_url);
        
        const credentials = btoa(`${wpIntegration.username}:${wpIntegration.application_password}`);
        const wpResponse = await fetch(`${wpIntegration.site_url}/wp-json/wp/v2/users?roles=administrator`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        });

        if (wpResponse.ok) {
          const wpUsers = await wpResponse.json();
          authors = wpUsers.map((user: any) => ({
            id: user.id,
            name: user.name,
            slug: user.slug
          }));
          console.log(`Found ${authors.length} WordPress admin users`);
        } else {
          const errorText = await wpResponse.text();
          console.error('WordPress API error:', wpResponse.status, errorText);
        }
      } catch (error) {
        console.error('WordPress authors fetch error:', error);
      }
    }

    // Add default admin author if none found
    if (authors.length === 0) {
      authors = [
        { id: 1, name: 'Admin', slug: 'admin' }
      ];
      console.log('Using default admin author');
    }

    console.log(`Returning ${authors.length} authors`);
    
    return new Response(
      JSON.stringify({ authors }),
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