import { supabase } from '../src/integrations/supabase/client.js';

async function executeMigration() {
  console.log('🚀 Starting SEO campaigns unification migration...');
  
  try {
    // Step 1: Add seo_campaign_id column to blog_posts
    console.log('📝 Step 1: Adding seo_campaign_id column to blog_posts...');
    
    const addColumnResult = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    if (addColumnResult.error) {
      console.error('Cannot access blog_posts table:', addColumnResult.error);
      return;
    }
    
    // Step 2: Check if we need to add the column by trying to select it
    const checkColumnResult = await supabase
      .from('blog_posts')
      .select('seo_campaign_id')
      .limit(1);
    
    if (checkColumnResult.error && checkColumnResult.error.message.includes('column "seo_campaign_id" does not exist')) {
      console.log('❌ seo_campaign_id column does not exist. Please run the SQL migration first.');
      console.log('Please execute this SQL in your Supabase SQL Editor:');
      console.log(`
ALTER TABLE public.blog_posts 
ADD COLUMN seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

CREATE INDEX idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);
      `);
      return;
    }
    
    console.log('✅ seo_campaign_id column exists');
    
    // Step 3: Find orphaned blog posts that need to be grouped into campaigns
    console.log('🔍 Step 2: Finding orphaned blog posts...');
    
    const { data: orphanedPosts, error: orphanError } = await supabase
      .from('blog_posts')
      .select('user_id, brand_id, created_at, campaign_creation_date, keywords, status')
      .is('seo_campaign_id', null)
      .not('brand_id', 'is', null)
      .not('user_id', 'is', null);
    
    if (orphanError) {
      console.error('Error finding orphaned posts:', orphanError);
      return;
    }
    
    console.log(`📊 Found ${orphanedPosts.length} orphaned blog posts`);
    
    if (orphanedPosts.length === 0) {
      console.log('✅ No orphaned posts found. Migration already complete or no posts to migrate.');
      return;
    }
    
    // Step 4: Group posts by user, brand, and date
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
    
    // Step 5: Create SEO campaigns for each group
    console.log('🏗️ Step 3: Creating SEO campaigns for each group...');
    
    let createdCampaigns = 0;
    
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
      
      console.log(`✅ Created campaign ${campaign.id} for ${posts.length} posts on ${group.group_date}`);
      createdCampaigns++;
      
      // Step 6: Link posts to the campaign
      const postIds = posts.map(p => p.id || Math.random().toString()); // Fallback for missing IDs
      
      // We need to get the actual post IDs first
      const { data: actualPosts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('user_id', group.user_id)
        .eq('brand_id', group.brand_id)
        .is('seo_campaign_id', null)
        .gte('created_at', group.group_date + 'T00:00:00Z')
        .lt('created_at', new Date(new Date(group.group_date).getTime() + 24*60*60*1000).toISOString());
      
      if (postsError) {
        console.error(`❌ Error finding posts for group ${groupKey}:`, postsError);
        continue;
      }
      
      if (actualPosts.length > 0) {
        const { error: linkError } = await supabase
          .from('blog_posts')
          .update({ seo_campaign_id: campaign.id })
          .in('id', actualPosts.map(p => p.id));
        
        if (linkError) {
          console.error(`❌ Error linking posts to campaign ${campaign.id}:`, linkError);
        } else {
          console.log(`🔗 Linked ${actualPosts.length} posts to campaign ${campaign.id}`);
        }
      }
    }
    
    console.log(`🎉 Migration completed! Created ${createdCampaigns} SEO campaigns`);
    
    // Step 7: Verify the results
    console.log('🔍 Step 4: Verifying migration results...');
    
    const { data: totalCampaigns, error: totalError } = await supabase
      .from('seo_campaigns')
      .select('id, name, number_of_articles')
      .order('created_at', { ascending: false });
    
    if (totalError) {
      console.error('Error verifying campaigns:', totalError);
    } else {
      console.log(`📊 Total SEO campaigns: ${totalCampaigns.length}`);
      console.log('Recent campaigns:');
      totalCampaigns.slice(0, 5).forEach(c => {
        console.log(`  - ${c.name} (${c.number_of_articles} articles)`);
      });
    }
    
    // Test unified view
    console.log('🔍 Testing unified campaigns view...');
    const { data: unifiedCampaigns, error: unifiedError } = await supabase
      .from('v_brand_all_campaigns')
      .select('source, name, posts')
      .limit(5);
    
    if (unifiedError) {
      console.error('❌ Unified view test failed:', unifiedError);
    } else {
      console.log(`✅ Unified view working! Shows ${unifiedCampaigns.length} campaigns`);
      unifiedCampaigns.forEach(c => {
        const postsCount = Array.isArray(c.posts) ? c.posts.length : 0;
        console.log(`  - ${c.source}: ${c.name} (${postsCount} posts)`);
      });
    }
    
    console.log('✅ SEO campaigns unification completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

executeMigration();

