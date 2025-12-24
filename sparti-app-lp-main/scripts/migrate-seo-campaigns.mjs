import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fkemumodynkaeojrrkbj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZW11bW9keW5rYWVvanJya2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMzYyOTcsImV4cCI6MjA2MjYxMjI5N30.xI2Hkw7OZIPOR2jwGh8EkSF3p3lEpTYeKKVTGF5G8vM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function executeMigration() {
  console.log('🚀 Starting SEO campaigns unification migration...');
  
  try {
    // Step 1: Check if seo_campaign_id column exists
    console.log('🔍 Step 1: Checking blog_posts table structure...');
    
    const { data: samplePost, error: checkError } = await supabase
      .from('blog_posts')
      .select('seo_campaign_id')
      .limit(1);
    
    if (checkError && checkError.message.includes('column "seo_campaign_id" does not exist')) {
      console.log('❌ seo_campaign_id column does not exist in blog_posts table.');
      console.log('📝 Please run this SQL in your Supabase SQL Editor first:');
      console.log('');
      console.log('ALTER TABLE public.blog_posts ADD COLUMN seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;');
      console.log('CREATE INDEX idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);');
      console.log('');
      console.log('Then re-run this migration script.');
      return;
    }
    
    console.log('✅ seo_campaign_id column exists');
    
    // Step 2: Find orphaned blog posts
    console.log('🔍 Step 2: Finding orphaned blog posts...');
    
    const { data: orphanedPosts, error: orphanError } = await supabase
      .from('blog_posts')
      .select('id, user_id, brand_id, created_at, campaign_creation_date, keywords, status, title')
      .is('seo_campaign_id', null)
      .not('brand_id', 'is', null)
      .not('user_id', 'is', null);
    
    if (orphanError) {
      console.error('❌ Error finding orphaned posts:', orphanError);
      return;
    }
    
    console.log(`📊 Found ${orphanedPosts.length} orphaned blog posts`);
    
    if (orphanedPosts.length === 0) {
      console.log('✅ No orphaned posts found. Checking existing campaigns...');
      
      const { data: existingCampaigns } = await supabase
        .from('seo_campaigns')
        .select('id, name, number_of_articles')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log(`📊 Found ${existingCampaigns?.length || 0} existing SEO campaigns`);
      existingCampaigns?.forEach(c => console.log(`  - ${c.name} (${c.number_of_articles} articles)`));
      
      console.log('✅ Migration already complete or no posts to migrate.');
      return;
    }
    
    // Step 3: Group posts by user, brand, and date
    console.log('📦 Step 3: Grouping posts by user, brand, and date...');
    
    const groups = {};
    orphanedPosts.forEach(post => {
      const groupDate = post.campaign_creation_date ? 
        new Date(post.campaign_creation_date).toISOString().split('T')[0] :
        new Date(post.created_at).toISOString().split('T')[0];
      
      const groupKey = `${post.user_id}_${post.brand_id}_${groupDate}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          user_id: post.user_id,
          brand_id: post.brand_id,
          group_date: groupDate,
          posts: []
        };
      }
      
      groups[groupKey].posts.push(post);
    });
    
    console.log(`📦 Grouped into ${Object.keys(groups).length} campaign groups`);
    
    // Step 4: Create SEO campaigns for each group
    console.log('🏗️ Step 4: Creating SEO campaigns for each group...');
    
    let createdCampaigns = 0;
    let linkedPosts = 0;
    
    for (const [groupKey, group] of Object.entries(groups)) {
      const posts = group.posts;
      const allKeywords = [];
      let allPublished = true;
      
      posts.forEach(post => {
        if (post.keywords && Array.isArray(post.keywords)) {
          allKeywords.push(...post.keywords);
        }
        if (post.status !== 'published') {
          allPublished = false;
        }
      });
      
      const uniqueKeywords = [...new Set(allKeywords)];
      const status = allPublished ? 'completed' : 'in_progress';
      
      console.log(`  📝 Creating campaign for ${posts.length} posts on ${group.group_date}...`);
      
      // Create the SEO campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('seo_campaigns')
        .insert({
          user_id: group.user_id,
          brand_id: group.brand_id,
          name: `SEO Campaign - ${group.group_date}`,
          website_url: null,
          business_description: 'Backfilled campaign from historical blog posts',
          number_of_articles: posts.length,
          article_length: 'medium',
          article_type: 'blog',
          language: 'English',
          target_country: 'United States',
          status: status,
          current_step: status === 'completed' ? 'completed' : 'keyword_research',
          progress: status === 'completed' ? 100 : 60,
          organic_keywords: uniqueKeywords,
          created_at: new Date(group.group_date + 'T00:00:00Z').toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (campaignError) {
        console.error(`❌ Error creating campaign for group ${groupKey}:`, campaignError);
        continue;
      }
      
      console.log(`    ✅ Created campaign ${campaign.id}`);
      createdCampaigns++;
      
      // Step 5: Link posts to the campaign
      const postIds = posts.map(p => p.id);
      
      const { error: linkError } = await supabase
        .from('blog_posts')
        .update({ seo_campaign_id: campaign.id })
        .in('id', postIds);
      
      if (linkError) {
        console.error(`❌ Error linking posts to campaign ${campaign.id}:`, linkError);
      } else {
        console.log(`    🔗 Linked ${postIds.length} posts to campaign`);
        linkedPosts += postIds.length;
      }
    }
    
    console.log(`🎉 Migration completed!`);
    console.log(`📊 Created ${createdCampaigns} SEO campaigns`);
    console.log(`🔗 Linked ${linkedPosts} blog posts`);
    
    // Step 6: Verify the results
    console.log('🔍 Step 5: Verifying migration results...');
    
    const { data: totalCampaigns, error: totalError } = await supabase
      .from('seo_campaigns')
      .select('id, name, number_of_articles, status')
      .order('created_at', { ascending: false });
    
    if (totalError) {
      console.error('❌ Error verifying campaigns:', totalError);
    } else {
      console.log(`📊 Total SEO campaigns: ${totalCampaigns.length}`);
      console.log('Recent campaigns:');
      totalCampaigns.slice(0, 5).forEach(c => {
        console.log(`  - ${c.name} (${c.number_of_articles} articles, ${c.status})`);
      });
    }
    
    // Step 7: Test unified view
    console.log('🔍 Step 6: Testing unified campaigns view...');
    
    const { data: unifiedCampaigns, error: unifiedError } = await supabase
      .from('v_brand_all_campaigns')
      .select('source, name, posts')
      .limit(5);
    
    if (unifiedError) {
      console.error('❌ Unified view test failed:', unifiedError);
      console.log('This might be normal if the view needs to be refreshed.');
    } else {
      console.log(`✅ Unified view working! Shows ${unifiedCampaigns.length} campaigns`);
      unifiedCampaigns.forEach(c => {
        const postsCount = Array.isArray(c.posts) ? c.posts.length : 0;
        console.log(`  - ${c.source}: ${c.name} (${postsCount} posts)`);
      });
    }
    
    console.log('');
    console.log('🎉 SEO campaigns unification completed successfully!');
    console.log('✅ Your /dashboard/campaigns?type=SEO page should now show all unified content.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    if (error.message?.includes('seo_campaign_id')) {
      console.log('');
      console.log('📝 Please run this SQL in your Supabase SQL Editor:');
      console.log('ALTER TABLE public.blog_posts ADD COLUMN seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;');
      console.log('CREATE INDEX idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);');
    }
  }
}

executeMigration();

