import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!firecrawlApiKey || !openRouterApiKey) {
      throw new Error('API keys not configured');
    }

    const supabaseHeaders = {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json'
    };

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey
      }
    });

    if (!userResponse.ok) {
      throw new Error('Authentication failed');
    }

    const user = await userResponse.json();
    const requestData = await req.json();
    const { topic, language, wordCount, tone, includeIntro, includeConclusion, includeFAQ, featuredImage, customPrompt, brandId, brandName, userId, model = 'anthropic/claude-3.5-sonnet', contentSettings: passedContentSettings } = requestData;

    // Use passed content settings or fetch from database
    let contentSettings = passedContentSettings;
    
    if (!contentSettings) {
      // Fetch content settings from database if not passed
      const settingsResponse = await fetch(`${supabaseUrl}/rest/v1/content_settings?brand_id=eq.${brandId}`, {
        headers: supabaseHeaders
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        contentSettings = settingsData.length > 0 ? settingsData[0] : null;
      }

      // If no brand-specific settings, try to get user-specific settings
      if (!contentSettings) {
        const userSettingsResponse = await fetch(`${supabaseUrl}/rest/v1/content_settings?user_id=eq.${userId}`, {
          headers: supabaseHeaders
        });

        if (userSettingsResponse.ok) {
          const userSettingsData = await userSettingsResponse.json();
          contentSettings = userSettingsData.length > 0 ? userSettingsData[0] : null;
        }
      }
    }

    // Generate article with Claude
    const settings = contentSettings || {
      use_brand_info: true,
      brand_mentions: 'regular',
      competitor_mentions: 'minimal',
      internal_links: 'few',
      external_search: true,
      external_links: 'few',
      custom_instructions: '',
      exclusions: '',
      image_style: 'modern, clean, professional'
    };

    // Get source URL from suggested_topics
    const topicResponse = await fetch(`${supabaseUrl}/rest/v1/suggested_topics?id=eq.${topic.suggested_topic_id}&select=source`, {
      headers: supabaseHeaders
    });

    let sourceUrl = '';
    if (topicResponse.ok) {
      const topicData = await topicResponse.json();
      if (topicData.length > 0) {
        const source = topicData[0].source || "{}";
        sourceUrl = JSON.parse(source).url || '';
      }
    }

    // Scrape content from source URL
    let scrapedContent: { title: string; content: string; url?: string }[] = [];
    if (sourceUrl) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: sourceUrl,
            formats: ['markdown'],
            onlyMainContent: true
          })
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          if (scrapeData.success && scrapeData.data?.content) {
            scrapedContent.push({
              title: scrapeData.data.metadata?.title || 'Untitled',
              content: scrapeData.data.content.substring(0, 400)
            });
          }
        }
      } catch (error) {
        console.warn('Scraping failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Perform Google search if external_search is enabled
    if (settings && settings.external_search) {
      try {
        console.log('[testing] Performing Google search for topic:', topic.title);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${topic.title} ${topic.keyword_focus || topic.keywords[0] || ''}`,
            limit: 3 // Get top 3 results
          })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.success && searchData.data?.results) {
            console.log('[testing] Found', searchData.data.results.length, 'search results');
            
            // Process each search result
            for (const result of searchData.data.results.slice(0, 3)) {
              try {
                // Scrape the content from each search result
                const resultScrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${firecrawlApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    url: result.url,
                    formats: ['markdown'],
                    onlyMainContent: true
                  })
                });

                if (resultScrapeResponse.ok) {
                  const resultScrapeData = await resultScrapeResponse.json();
                  if (resultScrapeData.success && resultScrapeData.data?.content) {
                    scrapedContent.push({
                      title: result.title || 'Search Result',
                      content: resultScrapeData.data.content.substring(0, 500), // Limit to 500 chars per result
                      url: result.url
                    });
                    console.log('[testing] Added content from:', result.url);
                  }
                }
              } catch (scrapeError) {
                console.warn('[testing] Failed to scrape search result:', result.url, scrapeError);
                // Continue with other results even if one fails
              }
            }
          }
        } else {
          console.warn('[testing] Google search failed:', await searchResponse.text());
        }
      } catch (error) {
        console.warn('[testing] External search failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Fetch internal links for backlinks
    let internalLinks: Array<{url: string, title: string, description?: string}> = [];
    try {
      console.log('[testing] Fetching internal links for brand:', brandId);
      
      const linksResponse = await fetch(`${supabaseUrl}/rest/v1/seo_internal_links?brand_id=eq.${brandId}&type=eq.Internal&select=url,title,description`, {
        headers: supabaseHeaders
      });

      if (linksResponse.ok) {
        const linksData = await linksResponse.json();
        internalLinks = linksData || [];
        console.log('[testing] Found', internalLinks.length, 'internal links for backlinks');
      } else {
        console.warn('[testing] Failed to fetch internal links:', await linksResponse.text());
      }
    } catch (error) {
      console.warn('[testing] Error fetching internal links:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Build competitor mention instructions
    let competitorInstructions = '';
    switch (settings.competitor_mentions) {
      case 'none':
        competitorInstructions = 'Do NOT mention any competitors or competing brands. Focus only on the topic without referencing other companies in the same industry.';
        break;
      case 'minimal':
        competitorInstructions = 'Keep competitor mentions to a minimum - only when absolutely necessary for context.';
        break;
      case 'regular':
        competitorInstructions = 'You may mention competitors naturally when relevant to provide context or comparisons.';
        break;
      case 'maximal':
        competitorInstructions = 'Include competitor comparisons and references where they add value to the content.';
        break;
      default:
        competitorInstructions = 'Keep competitor mentions to a minimum - only when absolutely necessary for context.';
    }

    // Build brand mention instructions
    let brandInstructions = '';
    if (settings.use_brand_info && settings.brand_mentions !== 'none') {
      switch (settings.brand_mentions) {
        case 'minimal':
          brandInstructions = `Mention "${brandName}" sparingly (1-2 times) when naturally relevant.`;
          break;
        case 'regular':
          brandInstructions = `Mention "${brandName}" naturally throughout the content (3-4 times).`;
          break;
        case 'maximal':
          brandInstructions = `Frequently mention "${brandName}" and its benefits (5+ times) to establish brand authority.`;
          break;
        default:
          brandInstructions = `Mention "${brandName}" naturally throughout the content.`;
      }
    }

    // Build link instructions
    let linkInstructions = '';
    if (settings.internal_links !== 'none' && internalLinks.length > 0) {
      linkInstructions += `Include ${settings.internal_links} internal links to other pages of the website. `;
      linkInstructions += `Available internal links to use: ${internalLinks.map(link => `${link.title} (${link.url})`).join(', ')}. `;
    }
    if (settings.external_links !== 'none') {
      linkInstructions += `Include ${settings.external_links} external links to authoritative sources, research, or related content. `;
    }

    const systemPrompt = `Generate a concise, high-quality SEO article.
Requirements: Target ${wordCount} words (±50 words acceptable, MAX 1000 words), ${tone} tone, ${language}
${includeIntro ? 'INCLUDE INTRODUCTION: Start with a compelling introduction that hooks the reader and introduces the main topic.' : 'DO NOT include a separate introduction section. Start directly with the main content.'}
${includeConclusion ? 'INCLUDE CONCLUSION: End with a conclusion that summarizes key points and provides actionable takeaways.' : 'DO NOT include a separate conclusion section. End with your last main content section.'}
${includeFAQ 
  ? 'INCLUDE FAQ SECTION: Add a "Frequently Asked Questions" section at the end of the article with 5-7 relevant Q&A pairs in HTML format using <h3> for questions and <p> for answers.' 
  : 'DO NOT include any FAQ section, questions and answers format, or Q&A section in the article.'}
${brandInstructions}
${competitorInstructions}
${linkInstructions}
${settings.custom_instructions ? `Custom Instructions: ${settings.custom_instructions}` : ''}
${settings.exclusions ? `Avoid: ${settings.exclusions}` : ''}
${settings.external_search ? 'EXTERNAL RESEARCH: Use the provided reference context from Google search results to enhance your article with current, accurate information. Synthesize insights from multiple sources while maintaining originality.' : ''}
${internalLinks.length > 0 ? `INTERNAL LINKING: Use the provided internal links strategically throughout the article to improve SEO and user experience. Link to relevant pages when they add value to the content.` : ''}
CRITICAL WORD COUNT REQUIREMENT: 
- Target word count: ${wordCount} words
- Acceptable range: ${Math.max(500, wordCount - 50)} to ${Math.min(1000, wordCount + 50)} words
- ABSOLUTE MAXIMUM: 1000 words - DO NOT EXCEED
- Keep content concise and focused - quality over quantity
- Remove any unnecessary elaboration to stay within limits
IMPORTANT FORMATTING REQUIREMENTS: 
- Return ONLY the article content with NO structural HTML tags
- DO NOT include DOCTYPE, html, head, body, title, meta, link, script, or style tags
- DO NOT include the main title as H1 since it's already provided separately
- Start article content with paragraphs, H2 headings, etc.
- Use proper HTML tags for content structure: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>
- Never use <h1> tags - use <h2> for main sections and <h3> for subsections
CRITICAL - META DESCRIPTION:
- DO NOT include any "META_DESCRIPTION:" text in the article content
- DO NOT generate meta descriptions as part of the article body
- Meta descriptions are generated separately after article completion
- Focus only on the article body content`;

    // Build reference context from all scraped content
    let referenceContext = '';
    if (scrapedContent.length > 0) {
      referenceContext = '\n\nReference Context:\n';
      scrapedContent.forEach((item, index) => {
        referenceContext += `\n${index + 1}. ${item.title}${item.url ? ` (${item.url})` : ''}:\n${item.content}\n`;
      });
    }

    const userPrompt = `Topic: ${topic.title}
Primary Keyword Focus: ${topic.keyword_focus || topic.keywords[0] || topic.title}
Keywords: ${topic.keywords.join(', ')}${referenceContext}`;

    const claudeResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 6000, // Increased for longer articles (1500+ words)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error('Claude API failed');
    }

    const claudeData = await claudeResponse.json();
    let rawResponse = claudeData.choices[0].message.content;
    
    // Meta description will be generated in a separate step
    const articleContent = rawResponse
      .replace(/```html\s*/g, '')
      .replace(/```\s*$/g, '')
      // Remove DOCTYPE, html, head, body tags and their content
      .replace(/<!DOCTYPE[^>]*>|<\/?html[^>]*>|<\/?head[^>]*>|<\/?body[^>]*>/gi, '')
      // Remove any meta tags
      .replace(/<meta[^>]*>/gi, '')
      // Remove any link tags
      .replace(/<link[^>]*>/gi, '')
      // Remove any script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove any style tags and their content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove title tags and their content
      .replace(/<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi, '')
      // Remove H1 title at the beginning of the content
      .replace(/^\s*<h1[^>]*>.*?<\/h1>\s*/i, '')
      // Remove any remaining H1 tags (convert to H2)
      .replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>')
      // Remove any HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();

    // Save article
    const blogPostResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: topic.title,
        content: articleContent,
        meta_description: null,
        keywords: topic.keywords,
        status: 'draft',
        user_id: userId,
        brand_id: brandId,
        featured_image: '',
      })
    });

    if (!blogPostResponse.ok) {
      throw new Error('Failed to save article');
    }

    const blogPost = await blogPostResponse.json();

    // Generate featured image based on selection
    let featureImageUrl = null;
    if (featuredImage === 'ai_generation') {
      try {
        const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-featured-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: topic.title,
            keywords: topic.keywords,
            content: articleContent,
            user_id: userId,
            image_style: settings.image_style || 'photorealistic'
          })
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.success && imageData.imageUrl) {
            const base64Image = imageData.imageUrl;
            
            // Convert base64 to buffer
            const base64Data = base64Image.split(',')[1]; // Remove data:image/...;base64, prefix
            const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            // Generate unique filename
            const timestamp = Date.now();
            const sanitizedTitle = topic.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
            const fileName = `${sanitizedTitle}_${timestamp}.png`;
            const filePath = `images/brands/${brandId}/articles/${fileName}`;
            
            // Upload to Supabase Storage
            try {
              const supabase = createClient(supabaseUrl, supabaseServiceKey);
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, imageBuffer, {
                  contentType: 'image/png',
                  upsert: false
                });
              
              if (uploadError) {
                console.error('Error uploading image to storage:', uploadError);
                throw new Error('Failed to upload image to storage');
              }
              
              // Get public URL
              const { data: urlData } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);
              
              featureImageUrl = urlData.publicUrl;
              console.log('Image uploaded to Supabase Storage:', featureImageUrl);
              
              // Update the blog post with the generated image
              const updateResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${blogPost[0].id}`, {
                method: 'PATCH',
                headers: supabaseHeaders,
                body: JSON.stringify({
                  featured_image: featureImageUrl
                })
              });

              if (updateResponse.ok) {
                console.log('Blog post updated with featured image');
              }
            } catch (storageError) {
              console.error('Storage error:', storageError);
              // Continue without image if storage fails
            }
          }
        } else {
          console.log('Image generation failed:', await imageResponse.text());
        }
      } catch (error) {
        console.log('Image generation error:', error);
      }
    } else if (featuredImage === 'gallery_selection') {
      // Select image from user's gallery
      try {
        console.log('[testing] Selecting image from gallery for brand:', brandId);
        
        // Fetch user's gallery images
        const galleryResponse = await fetch(`${supabaseUrl}/rest/v1/featured_image_gallery?brand_id=eq.${brandId}&select=id,image_url,name,topics,description`, {
          headers: supabaseHeaders
        });

        if (galleryResponse.ok) {
          const galleryData = await galleryResponse.json();
          
          if (galleryData && galleryData.length > 0) {
            // Use AI to select the most appropriate image
            const imageSelectionPrompt = `Select the most appropriate image from this gallery for an article titled "${topic.title}" with keywords: ${topic.keywords.join(', ')}. 
            
Available images:
${galleryData.map((img: any, index: number) => {
  const topics = img.topics && img.topics.length > 0 ? `Topics: ${img.topics.join(', ')}` : 'No topics specified';
  const description = img.description ? `Description: ${img.description}` : 'No description';
  return `${index + 1}. ${img.name || 'Untitled'}\n   ${topics}\n   ${description}`;
}).join('\n\n')}

Return only the number (1, 2, 3, etc.) of the most relevant image. Consider:
- Name relevance to article topic
- Topic overlap with article keywords
- Description relevance to article content
- Visual appropriateness for the content`;

            const selectionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'anthropic/claude-3-haiku',
                max_tokens: 10,
                messages: [{ role: 'user', content: imageSelectionPrompt }]
              })
            });

            if (selectionResponse.ok) {
              const selectionData = await selectionResponse.json();
              const selectedIndex = parseInt(selectionData.choices[0].message.content.trim()) - 1;
              
              if (selectedIndex >= 0 && selectedIndex < galleryData.length) {
                featureImageUrl = galleryData[selectedIndex].image_url;
                console.log('[testing] Selected image from gallery:', featureImageUrl);
                
                // Update the blog post with the selected image
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${blogPost[0].id}`, {
                  method: 'PATCH',
                  headers: supabaseHeaders,
                  body: JSON.stringify({
                    featured_image: featureImageUrl
                  })
                });

                if (updateResponse.ok) {
                  console.log('[testing] Blog post updated with gallery image');
                }
              } else {
                console.log('[testing] Invalid image selection index, using first image as fallback');
                featureImageUrl = galleryData[0].image_url;
                
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${blogPost[0].id}`, {
                  method: 'PATCH',
                  headers: supabaseHeaders,
                  body: JSON.stringify({
                    featured_image: featureImageUrl
                  })
                });
              }
            } else {
              console.log('[testing] AI selection failed, using first image as fallback');
              featureImageUrl = galleryData[0].image_url;
              
              const updateResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${blogPost[0].id}`, {
                method: 'PATCH',
                headers: supabaseHeaders,
                body: JSON.stringify({
                  featured_image: featureImageUrl
                })
              });
            }
          } else {
            console.log('[testing] No images found in gallery, falling back to AI generation');
            // Fallback to AI generation if no gallery images
            try {
              const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-featured-image`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title: topic.title,
                  keywords: topic.keywords,
                  content: articleContent,
                  user_id: userId,
                  image_style: settings.image_style || 'photorealistic'
                })
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.success && imageData.imageUrl) {
                  const base64Image = imageData.imageUrl;
                  
                  // Convert base64 to buffer and upload to storage
                  const base64Data = base64Image.split(',')[1];
                  const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                  
                  const timestamp = Date.now();
                  const sanitizedTitle = topic.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
                  const fileName = `${sanitizedTitle}_${timestamp}.png`;
                  const filePath = `images/brands/${brandId}/articles/${fileName}`;
                  
                  const supabase = createClient(supabaseUrl, supabaseServiceKey);
                  
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, imageBuffer, {
                      contentType: 'image/png',
                      upsert: false
                    });
                  
                  if (!uploadError) {
                    const { data: urlData } = supabase.storage
                      .from('images')
                      .getPublicUrl(filePath);
                    
                    featureImageUrl = urlData.publicUrl;
                    
                    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${blogPost[0].id}`, {
                      method: 'PATCH',
                      headers: supabaseHeaders,
                      body: JSON.stringify({
                        featured_image: featureImageUrl
                      })
                    });
                  }
                }
              }
            } catch (fallbackError) {
              console.log('[testing] Fallback AI generation failed:', fallbackError);
            }
          }
        } else {
          console.log('[testing] Failed to fetch gallery images:', await galleryResponse.text());
        }
      } catch (error) {
        console.log('[testing] Gallery selection error:', error);
      }
    }

    // Record token usage
    try {
      // Adjust cost based on external search usage
      let estimatedCost = 0.2; // Base cost for article generation
      if (settings.external_search && scrapedContent.length > 1) {
        estimatedCost += 0.05; // Additional cost for external search and scraping
      }
      
      const tokenResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/deduct_user_tokens`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          p_user_id: userId,
          p_service_name: 'generate-article-with-firecrawl',
          p_model_name: model,
          p_cost_usd: estimatedCost,
          p_brand_id: brandId,
          p_request_data: {
            topic: topic.title,
            word_count: wordCount,
            tone: tone,
            language: language,
            model: model,
            brand_mentions: settings.brand_mentions,
            competitor_mentions: settings.competitor_mentions,
            internal_links: settings.internal_links,
            internal_links_available: internalLinks.length,
            external_links: settings.external_links,
            external_search: settings.external_search,
            external_sources_count: scrapedContent.length,
            image_style: settings.image_style,
            has_featured_image: !!featureImageUrl,
            processed_by: 'generate-article-with-firecrawl-function'
          }
        })
      });

      if (tokenResponse.ok) {
        console.log(`Token usage recorded for user ${userId}: $${estimatedCost} for article generation${settings.external_search ? ' with external search' : ''}`);
      }
    } catch (tokenError) {
      console.error('Error recording token usage:', tokenError);
      // Don't fail the request if token tracking fails
    }

    return new Response(JSON.stringify({
      success: true,
      topic_id: topic.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper function to validate word count with margin of error
function validateWordCount(content: string, targetWordCount: number): { isValid: boolean; actualWords: number; targetRange: { min: number; max: number } } {
  // Remove HTML tags for accurate word count
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Count words by splitting on whitespace
  const words = textContent.split(/\s+/).filter(word => word.length > 0);
  const actualWords = words.length;
  
  const minWords = targetWordCount - 10;
  const maxWords = targetWordCount + 10;
  
  return {
    isValid: actualWords >= minWords && actualWords <= maxWords,
    actualWords,
    targetRange: { min: minWords, max: maxWords }
  };
}