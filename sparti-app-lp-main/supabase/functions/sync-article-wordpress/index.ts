import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordPressPostData {
  title: string;
  content: string;
  status: string;
  excerpt?: string;
  featured_media?: number;
  date?: string;
  author?: number;
  categories?: number[];
  meta?: {
    description?: string;
  };
}

interface WordPressMediaResponse {
  id: number;
  source_url: string;
  alt_text?: string;
}

// Helper function to get WordPress author ID by name
async function getWordPressAuthorId(
  authorName: string,
  siteUrl: string,
  authHeader: string
): Promise<number | null> {
  try {
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(authorName)}`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch WordPress authors:', response.status);
      return null;
    }

    const users = await response.json();
    if (users.length > 0) {
      console.log('Found WordPress author:', users[0].name, 'ID:', users[0].id);
      return users[0].id;
    }
    
    console.warn('No WordPress author found matching:', authorName);
    return null;
  } catch (error) {
    console.error('Error fetching WordPress author:', error);
    return null;
  }
}

// Helper function to get WordPress category IDs by names
async function getWordPressCategoryIds(
  categoryNames: string[],
  siteUrl: string,
  authHeader: string
): Promise<number[]> {
  try {
    console.log('Fetching WordPress categories from API...');
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/categories?per_page=100`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch WordPress categories:', response.status);
      return [];
    }

    const categories = await response.json();
    console.log('Available WordPress categories:', categories.map((cat: any) => cat.name));
    
    const categoryIds: number[] = [];
    
    for (const categoryName of categoryNames) {
      console.log('Looking for category:', categoryName);
      const category = categories.find((cat: any) => 
        cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (category) {
        categoryIds.push(category.id);
        console.log('Found WordPress category:', category.name, 'ID:', category.id);
      } else {
        console.warn('No WordPress category found matching:', categoryName);
        console.log('Available category names:', categories.map((cat: any) => cat.name));
      }
    }
    
    console.log('Final category IDs to sync:', categoryIds);
    return categoryIds;
  } catch (error) {
    console.error('Error fetching WordPress categories:', error);
    return [];
  }
}

// Helper function to upload featured image to WordPress
async function uploadFeaturedImageToWordPress(
  imageUrl: string,
  altText: string,
  siteUrl: string,
  authHeader: string
): Promise<number | null> {
  try {
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to download image:', imageResponse.status);
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer]);
    
    // Create form data for WordPress media upload
    const formData = new FormData();
    formData.append('file', imageBlob, 'featured-image.jpg');
    formData.append('alt_text', altText || '');

    // Upload to WordPress media library
    const mediaResponse = await fetch(`${siteUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      },
      body: formData
    });

    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text();
      console.error('Failed to upload image to WordPress:', errorText);
      return null;
    }

    const mediaData: WordPressMediaResponse = await mediaResponse.json();
    console.log('Image uploaded to WordPress media library:', mediaData.id);
    return mediaData.id;
  } catch (error) {
    console.error('Error uploading featured image:', error);
    return null;
  }
}

// Helper function to validate and format scheduled date
function formatScheduledDateForWordPress(scheduledDateString: string): { success: boolean; date?: string; error?: string } {
  try {
    // Parse the scheduled date
    const scheduledDate = new Date(scheduledDateString);
    
    // Validate the date
    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: 'Invalid date format' };
    }
    
    // Check if the date is in the future
    const now = new Date();
    if (scheduledDate <= now) {
      return { success: false, error: 'Scheduled date must be in the future' };
    }
    
    // Convert to WordPress format (ISO 8601)
    // WordPress expects the date in UTC format
    const wpDate = scheduledDate.toISOString();
    
    return { success: true, date: wpDate };
  } catch (error) {
    return { success: false, error: `Date processing error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Helper function to check if post already exists
async function getExistingWordPressPost(
  articleId: string,
  supabaseClient: any
): Promise<{ exists: boolean; postId?: number; postUrl?: string }> {
  try {
    const { data: existingSync, error } = await supabaseClient
      .from('blog_posts')
      .select('wordpress_post_id, cms_url')
      .eq('id', articleId)
      .single();

    if (error || !existingSync?.wordpress_post_id) {
      return { exists: false };
    }

    return {
      exists: true,
      postId: existingSync.wordpress_post_id,
      postUrl: existingSync.cms_url
    };
  } catch (error) {
    console.error('Error checking existing post:', error);
    return { exists: false };
  }
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

    console.log('Starting WordPress sync for article:', articleId);

    // Get sync data from database function
    const { data: syncData, error: syncError } = await supabaseClient
      .rpc('sync_article_to_wordpress', {
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
    console.log('Article status:', article.status);
    console.log('Scheduled date:', article.scheduled_date);
    console.log('WordPress site:', integration.site_url);
    
    // Log timezone information for debugging
    if (article.scheduled_date) {
      const testDate = new Date(article.scheduled_date);
      console.log('Date parsing test:');
      console.log('- Original string:', article.scheduled_date);
      console.log('- Parsed date:', testDate.toString());
      console.log('- ISO string:', testDate.toISOString());
      console.log('- UTC string:', testDate.toUTCString());
      console.log('- Timezone offset (minutes):', testDate.getTimezoneOffset());
    }

    // Check if post already exists
    const existingPost = await getExistingWordPressPost(articleId, supabaseClient);
    const authHeader = `Basic ${btoa(`${integration.username}:${integration.application_password}`)}`;

    // Handle featured image upload if available
    let featuredMediaId: number | null = null;
    if (article.featured_image) {
      console.log('Uploading featured image:', article.featured_image);
      featuredMediaId = await uploadFeaturedImageToWordPress(
        article.featured_image,
        article.featured_image_alt || '',
        integration.site_url,
        authHeader
      );
    }

    // Get WordPress author ID if author is specified
    let authorId: number | null = null;
    if (article.author) {
      console.log('Finding WordPress author for:', article.author);
      authorId = await getWordPressAuthorId(article.author, integration.site_url, authHeader);
    }

    // Get WordPress category IDs if keywords are specified (using keywords as categories)
    let categoryIds: number[] = [];
    if (article.keywords && Array.isArray(article.keywords) && article.keywords.length > 0) {
      console.log('Finding WordPress categories for:', article.keywords);
      console.log('Keywords type:', typeof article.keywords, 'Is array:', Array.isArray(article.keywords));
      categoryIds = await getWordPressCategoryIds(article.keywords, integration.site_url, authHeader);
      console.log('Mapped category IDs:', categoryIds);
    } else {
      console.log('No keywords found or invalid format:', article.keywords);
    }

    // Prepare WordPress post data
    const postData: WordPressPostData = {
      title: article.title,
      content: article.content,
      status: article.status === 'published' ? 'publish' : 
              article.status === 'scheduled' ? 'future' : 'draft',
      excerpt: article.meta_description || '',
      meta: {
        description: article.meta_description || ''
      }
    };

    // Add scheduled date if status is scheduled
    if (article.status === 'scheduled' && article.scheduled_date) {
      console.log('Processing scheduled date:', article.scheduled_date);
      
      const dateResult = formatScheduledDateForWordPress(article.scheduled_date);
      
      if (dateResult.success && dateResult.date) {
        postData.date = dateResult.date;
        console.log('Successfully formatted date for WordPress:', dateResult.date);
      } else {
        console.error('Failed to process scheduled date:', dateResult.error);
        // If date processing fails, fall back to draft status
        postData.status = 'draft';
        console.log('Falling back to draft status due to date error:', dateResult.error);
      }
    }

    // Add featured media if available
    if (featuredMediaId) {
      postData.featured_media = featuredMediaId;
    }

    // Add author if available
    if (authorId) {
      postData.author = authorId;
    }

    // Add categories if available
    if (categoryIds.length > 0) {
      postData.categories = categoryIds;
      console.log('Adding categories to WordPress post:', categoryIds);
    } else {
      console.log('No category IDs to add to WordPress post');
    }

    let wpResponse: Response;
    let wpPost: any;

    if (existingPost.exists) {
      // Update existing post
      console.log('Updating existing WordPress post:', existingPost.postId);
      wpResponse = await fetch(`${integration.site_url}/wp-json/wp/v2/posts/${existingPost.postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(postData)
      });
    } else {
      // Create new post
      console.log('Creating new WordPress post');
      wpResponse = await fetch(`${integration.site_url}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(postData)
      });
    }

    if (!wpResponse.ok) {
      const errorText = await wpResponse.text();
      console.error('WordPress API error:', errorText);
      
      // Update sync status to error
      await supabaseClient.rpc('update_article_sync_status', {
        p_article_id: articleId,
        p_platform: 'wordpress',
        p_status: 'sync_error',
        p_error_message: `WordPress API error: ${wpResponse.status} - ${errorText}`
      });

      throw new Error(`WordPress API error: ${wpResponse.status} - ${errorText}`);
    }

    wpPost = await wpResponse.json();
    console.log(`WordPress post ${existingPost.exists ? 'updated' : 'created'}:`, wpPost.id);

    // Update sync status to synced
    await supabaseClient.rpc('update_article_sync_status', {
      p_article_id: articleId,
      p_platform: 'wordpress',
      p_status: 'synced',
      p_external_id: wpPost.id.toString(),
      p_url: wpPost.link
    });

    console.log('Article successfully synced to WordPress');

    return new Response(JSON.stringify({
      success: true,
      wordpressPostId: wpPost.id,
      wordpressUrl: wpPost.link
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error syncing article to WordPress:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});