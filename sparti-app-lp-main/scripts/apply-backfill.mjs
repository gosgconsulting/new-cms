// Direct SQL execution to backfill blog posts into SEO campaigns
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fkemumodynkaeojrrkbj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZW11bW9keW5rYWVvanJya2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMzYyOTcsImV4cCI6MjA2MjYxMjI5N30.xI2Hkw7OZIPOR2jwGh8EkSF3p3lEpTYeKKVTGF5G8vM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// First, add the seo_campaign_id column if it doesn't exist
const addColumnSQL = `
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);
`;

// Backfill migration SQL
const backfillSQL = `
do $$
declare
  r record;
  v_campaign_id uuid;
  v_group_date date;
  v_status text;
  v_keywords text[];
  v_num_articles int;
begin
  -- Iterate over distinct groups of orphaned posts
  for r in
    select
      bp.user_id,
      bp.brand_id,
      coalesce(date(bp.campaign_creation_date), date(bp.created_at)) as group_date
    from public.blog_posts bp
    where bp.seo_campaign_id is null
      and bp.brand_id is not null
      and bp.user_id is not null
    group by bp.user_id, bp.brand_id, coalesce(date(bp.campaign_creation_date), date(bp.created_at))
  loop
    v_group_date := r.group_date;

    -- Aggregate group stats
    select
      count(*)::int,
      (case when bool_and(status = 'published') then 'completed' else 'in_progress' end),
      coalesce(array_agg(distinct unnest(coalesce(bp.keywords, array[]::text[]))), array[]::text[])
    into v_num_articles, v_status, v_keywords
    from public.blog_posts bp
    where bp.seo_campaign_id is null
      and bp.user_id = r.user_id
      and bp.brand_id = r.brand_id
      and coalesce(date(bp.campaign_creation_date), date(bp.created_at)) = r.group_date;

    -- Insert a new seo_campaigns row representing this group
    insert into public.seo_campaigns (
      user_id,
      brand_id,
      name,
      website_url,
      business_description,
      number_of_articles,
      article_length,
      article_type,
      language,
      target_country,
      status,
      current_step,
      progress,
      organic_keywords,
      created_at,
      updated_at
    ) values (
      r.user_id,
      r.brand_id,
      'SEO Campaign - ' || to_char(v_group_date, 'YYYY-MM-DD'),
      null,
      'Backfilled campaign from historical blog posts',
      v_num_articles,
      'medium',
      'blog',
      'English',
      'United States',
      v_status,
      case when v_status = 'completed' then 'completed' else 'keyword_research' end,
      case when v_status = 'completed' then 100 else 60 end,
      v_keywords,
      (v_group_date)::timestamptz,
      now()
    )
    returning id into v_campaign_id;

    -- Link posts to the newly created campaign
    update public.blog_posts bp
    set seo_campaign_id = v_campaign_id
    where bp.seo_campaign_id is null
      and bp.user_id = r.user_id
      and bp.brand_id = r.brand_id
      and coalesce(date(bp.campaign_creation_date), date(bp.created_at)) = r.group_date;
  end loop;
end $$;
`;

async function applyBackfill() {
  try {
    console.log('🔧 Adding seo_campaign_id column if needed...');
    
    // Execute add column SQL
    const { error: columnError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
    if (columnError && !columnError.message?.includes('already exists')) {
      console.error('❌ Column addition failed:', columnError);
      return;
    }
    
    console.log('✅ Column ready');
    
    console.log('🚀 Starting backfill process...');
    
    // Execute backfill SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: backfillSQL });
    
    if (error) {
      console.error('❌ Backfill failed:', error);
      return;
    }
    
    console.log('✅ Backfill completed successfully!');
    
    // Test the results
    console.log('🔍 Testing results...');
    const { data: campaigns, error: testError } = await supabase
      .from('seo_campaigns')
      .select('id, name, created_at, number_of_articles')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (testError) {
      console.error('❌ Test query failed:', testError);
    } else {
      console.log('✅ Found', campaigns?.length || 0, 'SEO campaigns');
      campaigns?.forEach(c => console.log(`  - ${c.name} (${c.number_of_articles} articles)`));
    }
    
    // Test unified view
    console.log('🔍 Testing unified campaigns view...');
    const { data: unified, error: unifiedError } = await supabase
      .from('v_brand_all_campaigns')
      .select('source, name, posts')
      .limit(3);
    
    if (unifiedError) {
      console.error('❌ Unified view test failed:', unifiedError);
    } else {
      console.log('✅ Unified view working! Found', unified?.length || 0, 'unified campaigns');
      unified?.forEach(c => console.log(`  - ${c.source}: ${c.name} (${(c.posts || []).length} posts)`));
    }
    
  } catch (err) {
    console.error('❌ Script error:', err);
  }
}

// Check if exec_sql RPC exists, if not use direct SQL queries
async function checkAndApply() {
  try {
    // Try using exec_sql first
    await applyBackfill();
  } catch (error) {
    if (error.message?.includes('exec_sql')) {
      console.log('🔄 exec_sql not available, trying direct approach...');
      
      // Direct SQL approach (may need service role key)
      console.log('❌ Direct SQL execution requires service role key.');
      console.log('📝 Please run this SQL manually in your Supabase SQL editor:');
      console.log('\n--- Add Column ---');
      console.log(addColumnSQL);
      console.log('\n--- Backfill Data ---');
      console.log(backfillSQL);
    } else {
      throw error;
    }
  }
}

checkAndApply();

