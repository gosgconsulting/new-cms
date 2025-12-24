import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { 
      keywords, 
      searchTerms = [],
      sources = [], 
      fetchedSources = [],
      websiteUrl,
      language = 'English',
      existingBlogTopics = [],
      topicCount = 12,
      existingTopics = [],
    } = await req.json();
    
    console.log('Topic generation request:', { 
      keywordCount: keywords?.length,
      searchTermsCount: searchTerms?.length,
      sourceCount: sources?.length,
      fetchedSourcesCount: fetchedSources?.length,
      topicCount,
      existingTopicsCount: existingTopics?.length
    });

    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Use search terms if provided, otherwise fallback to keywords
    // CRITICAL: Extract string values if search terms are objects
    const searchTermsToUse = searchTerms && searchTerms.length > 0 
      ? searchTerms.map((st: any) => typeof st === 'string' ? st : st.search_term)
      : keywords.slice(0, Math.ceil(topicCount / 4));
    
    const numSearchTerms = searchTermsToUse.length;
    // ALWAYS generate 4 topics per search term (one for each intent)
    const topicsPerSearchTerm = 4;
    const expectedTopics = numSearchTerms * topicsPerSearchTerm;
    
    console.log(`Generating ${expectedTopics} topics from ${numSearchTerms} search terms (4 topics each with 4 different intents)`);
    
    // Batch processing for large search term sets
    const BATCH_SIZE = 5; // Process 5 search terms at a time (= 20 topics per batch)
    const searchTermBatches = [];
    
    for (let i = 0; i < searchTermsToUse.length; i += BATCH_SIZE) {
      searchTermBatches.push(searchTermsToUse.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Processing ${numSearchTerms} search terms in ${searchTermBatches.length} batches`);
    
    let allTopics: any[] = [];
    
    // Helper function to clean JSON strings before parsing
    const cleanJsonString = (str: string): string => {
      // Remove markdown code blocks if present
      str = str.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove comments (// or /* */ style)
      str = str.replace(/\/\*[\s\S]*?\*\//g, '');
      str = str.replace(/\/\/.*/g, '');
      
      // Remove trailing commas before closing brackets/braces
      str = str.replace(/,(\s*[}\]])/g, '$1');
      
      // Normalize whitespace
      str = str.trim();
      
      // CRITICAL FIX: Do NOT escape word boundaries (\b in regex)
      // Only escape actual control characters within JSON string values
      // This regex finds content between quotes and escapes literal control chars
      str = str.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (match) => {
        return match
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\f/g, '\\f');
        // NOTE: Removed \b replacement as it was matching word boundaries, not backspace chars
      });
      
      return str;
    };

    // Use fetched sources with content if available
    const sourcesToUse = fetchedSources || sources || [];
    console.log('Sources to use:', sourcesToUse.length, 'sources');

    // Helper function to generate fallback topics
    const generateFallbackTopics = (searchTerms: string[]): any[] => {
      const intents = ['informational', 'commercial', 'transactional', 'navigational'];
      const fallbackTopics: any[] = [];
      
      searchTerms.forEach((searchTerm, termIndex) => {
        intents.forEach((intent, intentIndex) => {
          fallbackTopics.push({
            search_term: searchTerm,
            title: `Complete Guide to ${searchTerm}`,
            primary_keyword: searchTerm.toLowerCase(),
            secondary_keywords: [],
            search_intent: intent,
            difficulty: 5,
            opportunity_score: 7,
            target_word_count: 1500,
            content_angle: `${intent} content about ${searchTerm}`,
            outline: ['Introduction', 'Main Content', 'Conclusion']
          });
        });
      });
      
      console.log(`✓ Generated ${fallbackTopics.length} fallback topics`);
      return fallbackTopics;
    };

    const generateTopicBatch = async (batchSearchTerms: string[], batchIndex: number, isRetry = false) => {
      const batchTopicCount = batchSearchTerms.length * topicsPerSearchTerm;
      console.log(`${isRetry ? 'RETRY: ' : ''}Generating ${batchTopicCount} topics for batch ${batchIndex + 1}/${searchTermBatches.length} (${batchSearchTerms.length} search terms)`);

      const sourcesContext = sources.length > 0
        ? `\n\nAvailable Sources for Context:\n${sources.slice(0, 20).map((s: any, idx: number) => 
            `${idx + 1}. ${s.title || 'Untitled'}\n   URL: ${s.url || 'N/A'}\n   Insights: ${s.insights || s.description || 'No insights available'}`
          ).join('\n\n')}`
        : '';

      const existingTopicsContext = existingTopics.length > 0
        ? `\n\nExisting Topics to Avoid Duplicating:\n${existingTopics.join('\n')}`
        : '';

      const systemPrompt = `You are an expert SEO content strategist creating topic ideas based on search terms.

CRITICAL WORKFLOW REQUIREMENT:
- For EACH search term, you MUST generate EXACTLY 4 topics
- Each of the 4 topics MUST have a DIFFERENT search intent
- The 4 search intents are: "informational", "commercial", "transactional", "navigational"

MANDATORY STRUCTURE:
For ${batchSearchTerms.length} search terms provided, you MUST return ${batchTopicCount} topics total.

For each search term:
- Topic 1: search_intent = "informational"
- Topic 2: search_intent = "commercial"  
- Topic 3: search_intent = "transactional"
- Topic 4: search_intent = "navigational"

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY 4 topics for EACH search term (${batchSearchTerms.length} search terms = ${batchTopicCount} total topics)
2. Each topic MUST include the "search_term" field (exact match to input search term)
3. Each topic MUST include the "search_intent" field with one of: informational, commercial, transactional, navigational
4. For each search term, use ALL 4 different intents (no duplicates, no missing intents)
5. ALWAYS include "primary_keyword" (main target keyword from the topic)
6. ALWAYS include "secondary_keywords" array (2-3 related keywords)
7. ALWAYS include "target_word_count" (suggested article length, typically 1500-3000)
8. Return ONLY valid JSON array format - no markdown, no comments, no extra text
9. Ensure all string values have properly escaped control characters
10. MUST generate all ${batchTopicCount} topics - no exceptions

Return a JSON array with this EXACT structure:
[
  {
    "search_term": "exact search term from input",
    "title": "compelling article title",
    "primary_keyword": "main target keyword phrase",
    "secondary_keywords": ["related keyword 1", "related keyword 2", "related keyword 3"],
    "search_intent": "informational|commercial|transactional|navigational",
    "difficulty": 5,
    "opportunity_score": 8,
    "target_word_count": 2000,
    "content_angle": "unique perspective or approach",
    "outline": ["Introduction", "Main Section 1", "Main Section 2", "Conclusion"]
  }
]`;

      const userPrompt = `Website: ${websiteUrl}
Language: ${language}

Search Terms (generate 4 topics for EACH with 4 different intents):
${batchSearchTerms.map((term, i) => `${i + 1}. "${term}" → Generate 4 topics (informational, commercial, transactional, navigational)`).join('\n')}
${sourcesContext}
${existingTopicsContext}

REMEMBER: Return ${batchTopicCount} topics total (4 per search term, each with different intent).`;

      try {
        console.log(`Calling OpenRouter API (model: openai/gpt-4o-mini) for batch ${batchIndex + 1}`);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': websiteUrl || 'https://sparti.ai',
            'X-Title': 'Sparti AI - Topic Generation'
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 8000,
            temperature: 0.7
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenRouter API error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            batch: batchIndex + 1,
            searchTerms: batchSearchTerms
          });
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few minutes.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: 'OpenRouter payment required. Please add credits to your OpenRouter account.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (response.status === 401) {
            return new Response(
              JSON.stringify({ error: 'Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY configuration.' }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Log API usage
        const usage = data.usage;
        if (usage) {
          try {
            const authHeader = req.headers.get('authorization');
            if (authHeader) {
              const token = authHeader.replace('Bearer ', '');
              const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
              const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
              const supabase = createClient(supabaseUrl, supabaseServiceKey);
              const { data: { user } } = await supabase.auth.getUser(token);
              
              if (user) {
                // Calculate cost: GPT-4o-mini via OpenRouter
                const inputCost = (usage.prompt_tokens / 1000) * 0.00015;
                const outputCost = (usage.completion_tokens / 1000) * 0.0006;
                const totalCost = inputCost + outputCost;

                await supabase.rpc('deduct_user_tokens', {
                  p_user_id: user.id,
                  p_service_name: 'openrouter',
                  p_model_name: 'openai/gpt-4o-mini',
                  p_cost_usd: totalCost,
                  p_request_data: {
                    usage_type: 'topic-generation',
                    batch: batchIndex + 1,
                    search_terms: batchSearchTerms,
                    prompt_tokens: usage.prompt_tokens,
                    completion_tokens: usage.completion_tokens,
                    total_tokens: usage.total_tokens
                  }
                });
                
                console.log(`✅ Logged batch ${batchIndex + 1} API usage: $${totalCost.toFixed(5)} (${usage.prompt_tokens}→${usage.completion_tokens} tokens)`);
              }
            }
          } catch (logError) {
            console.error('Failed to log API usage:', logError);
          }
        }
        
        if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('Invalid OpenRouter response structure:', JSON.stringify(data).substring(0, 500));
          throw new Error('Invalid response structure from OpenRouter API');
        }
        
        const content = data.choices[0].message.content;
        
        console.log(`Batch ${batchIndex + 1} AI response length:`, content.length);

        let batchTopics;
        try {
          const cleaned = cleanJsonString(content);
          console.log(`Batch ${batchIndex + 1} cleaned JSON preview:`, cleaned.substring(0, 200));
          
          const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
          if (!jsonMatch) {
            throw new Error('No JSON array found in response');
          }
          
          batchTopics = JSON.parse(jsonMatch[0]);
          console.log(`Batch ${batchIndex + 1} generated ${batchTopics.length} topics (raw)`);
          
          // AUTO-FIX: Process each topic individually with error handling
          const validIntents = ['informational', 'commercial', 'transactional', 'navigational'];
          const intentAssignments = ['informational', 'commercial', 'transactional', 'navigational'];
          let intentIndex = 0;
          const validTopics: any[] = [];
          
          batchTopics.forEach((topic: any, index: number) => {
            try {
              // CRITICAL: Ensure search_intent exists before checking toLowerCase
              if (!topic.search_intent || typeof topic.search_intent !== 'string' || !validIntents.includes(topic.search_intent.toLowerCase())) {
                const assignedIntent = intentAssignments[intentIndex % 4];
                console.warn(`Topic "${topic.title || 'untitled'}" has invalid intent "${topic.search_intent}", assigning: ${assignedIntent}`);
                topic.search_intent = assignedIntent;
                intentIndex++;
              } else {
                // Normalize to lowercase
                topic.search_intent = topic.search_intent.toLowerCase();
              }
              
              // Ensure search_term exists and is a string
              if (!topic.search_term && batchSearchTerms.length > 0) {
                const searchTermIndex = Math.floor(index / 4) % batchSearchTerms.length;
                const searchTermValue = batchSearchTerms[searchTermIndex];
                topic.search_term = typeof searchTermValue === 'string' ? searchTermValue : searchTermValue?.search_term || 'unknown';
                console.warn(`Topic "${topic.title}" missing search_term, assigned: ${topic.search_term}`);
              } else if (typeof topic.search_term !== 'string' && topic.search_term?.search_term) {
                topic.search_term = topic.search_term.search_term;
                console.warn(`Topic "${topic.title}" had object search_term, extracted string: ${topic.search_term}`);
              }
              
              // CRITICAL: Ensure title exists
              if (!topic.title || typeof topic.title !== 'string' || topic.title.trim() === '') {
                // Generate title from search term
                if (typeof topic.search_term === 'string' && topic.search_term.trim()) {
                  topic.title = `Complete Guide to ${topic.search_term}`;
                } else {
                  topic.title = 'Untitled Topic';
                }
                console.warn(`⚠️ Topic had no title, generated: "${topic.title}"`);
              }
              
              // CRITICAL: Ensure required fields have robust defaults and proper extraction
              
              // Primary keyword: Extract from title if missing
              if (!topic.primary_keyword || typeof topic.primary_keyword !== 'string' || topic.primary_keyword.trim() === '') {
                const titleWords = (topic.title || '').toLowerCase().split(' ').filter(w => w.length > 2);
                topic.primary_keyword = titleWords.slice(0, 3).join(' ') || 'unknown';
              }
              
              // Secondary keywords: Extract from keywords array or generate from title
              if (!Array.isArray(topic.secondary_keywords) || topic.secondary_keywords.length === 0) {
                if (Array.isArray(topic.keywords) && topic.keywords.length > 0) {
                  // Use keywords array, excluding the first one (assumed to be primary)
                  topic.secondary_keywords = topic.keywords.slice(1, 4);
                } else {
                  // Generate from title words
                  const titleWords = (topic.title || '').toLowerCase().split(' ').filter(w => w.length > 3);
                  topic.secondary_keywords = titleWords.slice(1, 4);
                }
              }
              
              // Target word count: Ensure reasonable value
              topic.target_word_count = (topic.target_word_count >= 500) ? topic.target_word_count : 1500;
              
              // Difficulty and opportunity: Validate ranges
              topic.difficulty = (topic.difficulty >= 1 && topic.difficulty <= 10) ? topic.difficulty : 5;
              topic.opportunity_score = (topic.opportunity_score >= 1 && topic.opportunity_score <= 10) ? topic.opportunity_score : 7;
              
              // Content angle: Provide default
              topic.content_angle = topic.content_angle || 'Comprehensive guide';
              
              // Outline: Ensure array exists
              topic.outline = (Array.isArray(topic.outline) && topic.outline.length > 0) ? topic.outline : ['Introduction', 'Main Content', 'Conclusion'];
              
              console.log(`✓ Topic "${topic.title || 'NO TITLE'}": primary="${topic.primary_keyword}", secondary=[${topic.secondary_keywords.join(', ')}], words=${topic.target_word_count}`);
              
              validTopics.push(topic);
            } catch (topicError) {
              console.warn(`⚠️ Skipping invalid topic at index ${index}:`, topicError);
              // Continue with other topics - don't fail entire batch
            }
          });
          
          console.log(`Batch ${batchIndex + 1} final: ${validTopics.length}/${batchTopics.length} valid topics`);
          
          // If we got less than 75% of expected topics, return fallback for missing ones
          const minAcceptable = Math.floor(batchTopicCount * 0.75);
          if (validTopics.length < minAcceptable) {
            console.warn(`⚠️ Only ${validTopics.length}/${batchTopicCount} valid topics - below 75% threshold`);
            throw new Error(`Insufficient valid topics: ${validTopics.length}/${batchTopicCount}`);
          }
          
          return validTopics;
          
        } catch (parseError) {
          console.error(`Batch ${batchIndex + 1} processing failed:`, parseError);
          console.error('Raw content snippet:', content.substring(0, 500));
          
          // If this is already a retry, use fallback
          if (isRetry) {
            console.warn(`⚠️ Retry failed for batch ${batchIndex + 1}, using fallback topics`);
            return generateFallbackTopics(batchSearchTerms);
          }
          
          // Otherwise, retry once
          console.log(`🔄 Retrying batch ${batchIndex + 1} with simpler prompt...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
          return await generateTopicBatch(batchSearchTerms, batchIndex, true);
        }
        
      } catch (apiError) {
        console.error(`Batch ${batchIndex + 1} API call failed:`, apiError);
        
        // If this is a retry or API error, use fallback
        if (isRetry) {
          console.warn(`⚠️ Retry failed for batch ${batchIndex + 1}, using fallback topics`);
          return generateFallbackTopics(batchSearchTerms);
        }
        
        // For rate limit/auth errors, propagate immediately
        if (apiError instanceof Response) {
          throw apiError;
        }
        
        // For other errors, retry once
        console.log(`🔄 Retrying batch ${batchIndex + 1} after API error...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await generateTopicBatch(batchSearchTerms, batchIndex, true);
      }
    };
    
    // Generate topics for each batch
    if (searchTermBatches.length === 1) {
      // Single batch - process directly
      console.log('Single batch detected - processing all search terms at once');
      allTopics = await generateTopicBatch(searchTermsToUse, 0);
    } else {
      // Multiple batches - process sequentially with delay
      console.log(`Multiple batches detected - processing ${searchTermBatches.length} batches sequentially`);
      for (let i = 0; i < searchTermBatches.length; i++) {
        try {
          const batchTopics = await generateTopicBatch(searchTermBatches[i], i);
          allTopics.push(...batchTopics);
          
          // Add delay between batches to avoid rate limiting
          if (i < searchTermBatches.length - 1) {
            console.log('Waiting 1 second before next batch...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error);
          // Continue with other batches even if one fails
        }
      }
    }

    const topics = allTopics;

    // Enrich topics with source data
    const enrichedTopics = topics.map((topic: any) => {
      const matchedSources = sourcesToUse.filter((s: any) => 
        s.search_term === topic.search_term || 
        topic.matched_source_urls?.includes(s.url)
      );

      return {
        ...topic,
        matched_sources: matchedSources.slice(0, 3),
      };
    });

    console.log(`Final output: ${enrichedTopics.length} enriched topics`);

    return new Response(
      JSON.stringify({ topics: enrichedTopics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Topic generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
