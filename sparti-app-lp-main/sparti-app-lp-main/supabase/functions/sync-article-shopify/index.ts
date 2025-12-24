import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShopifyArticleData {
  article: {
    title: string;
    content: string;
    published: boolean;
    summary?: string;
    tags?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { articleId, brandId, userId } = await req.json();

    if (!articleId || !brandId || !userId) {
      throw new Error('Missing required parameters: articleId, brandId, or userId');
    }

    console.log('Starting Shopify sync for article:', articleId);

    // Get sync data from database function
    const { data: syncData, error: syncError } = await supabaseClient
      .rpc('sync_article_to_shopify', {
        p_article_id: articleId,
        p_brand_id: brandId,
        p_user_id: userId
      });

    if (syncError) {
      console.error('Database sync error:', syncError);
      throw new Error(`Database error: ${syncError.message}`);
    }

    if (!syncData.success) {
      throw new Error(syncData.error);
    }

    const article = syncData.article;
    const integration = syncData.integration;

    console.log('Article data:', article.title);
    console.log('Shopify store:', integration.store_url);

    // Ensure store_url has protocol
    const baseUrl = integration.store_url.startsWith('http') 
      ? integration.store_url 
      : `https://${integration.store_url}`;

    // Prepare Shopify article data
    const articleData: ShopifyArticleData = {
      article: {
        title: article.title,
        content: article.content,
        published: article.status === 'published',
        summary: article.meta_description || '',
        tags: article.keywords ? article.keywords.join(', ') : ''
      }
    };

    // For Shopify, we need a blog ID. Let's get the first available blog
    const blogsResponse = await fetch(`${baseUrl}/admin/api/2023-10/blogs.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': integration.api_secret_key,
        'Content-Type': 'application/json'
      }
    });

    if (!blogsResponse.ok) {
      const errorText = await blogsResponse.text();
      console.error('Shopify blogs API error:', errorText);
      
      await supabaseClient.rpc('update_article_sync_status', {
        p_article_id: articleId,
        p_platform: 'shopify',
        p_status: 'sync_error',
        p_error_message: `Shopify blogs API error: ${blogsResponse.status} - ${errorText}`
      });

      throw new Error(`Shopify blogs API error: ${blogsResponse.status} - ${errorText}`);
    }

    const blogsData = await blogsResponse.json();
    
    if (!blogsData.blogs || blogsData.blogs.length === 0) {
      await supabaseClient.rpc('update_article_sync_status', {
        p_article_id: articleId,
        p_platform: 'shopify',
        p_status: 'sync_error',
        p_error_message: 'No blogs found in Shopify store'
      });

      throw new Error('No blogs found in Shopify store');
    }

    const blogId = blogsData.blogs[0].id;
    console.log('Using Shopify blog ID:', blogId);

    // Create Shopify article
    const shopifyResponse = await fetch(`${baseUrl}/admin/api/2023-10/blogs/${blogId}/articles.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': integration.api_secret_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleData)
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error('Shopify API error:', errorText);
      
      await supabaseClient.rpc('update_article_sync_status', {
        p_article_id: articleId,
        p_platform: 'shopify',
        p_status: 'sync_error',
        p_error_message: `Shopify API error: ${shopifyResponse.status} - ${errorText}`
      });

      throw new Error(`Shopify API error: ${shopifyResponse.status} - ${errorText}`);
    }

    const shopifyArticle = await shopifyResponse.json();
    console.log('Shopify article created:', shopifyArticle.article.id);

    // Update sync status to synced
    await supabaseClient.rpc('update_article_sync_status', {
      p_article_id: articleId,
      p_platform: 'shopify',
      p_status: 'synced',
      p_external_id: shopifyArticle.article.id.toString()
    });

    console.log('Article successfully synced to Shopify');

    return new Response(JSON.stringify({
      success: true,
      shopifyArticleId: shopifyArticle.article.id,
      shopifyUrl: `${baseUrl}/blogs/${blogsData.blogs[0].handle}/${shopifyArticle.article.handle}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error syncing article to Shopify:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});