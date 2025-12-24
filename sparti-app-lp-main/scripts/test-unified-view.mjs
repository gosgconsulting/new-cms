import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fkemumodynkaeojrrkbj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZW11bW9keW5rYWVvanJya2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMzYyOTcsImV4cCI6MjA2MjYxMjI5N30.xI2Hkw7OZIPOR2jwGh8EkSF3p3lEpTYeKKVTGF5G8vM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUnifiedView() {
  console.log('🔍 Testing unified campaigns view and data sources...');
  
  try {
    // Test 1: Check SEO campaigns table
    console.log('\n📊 Test 1: Checking SEO campaigns...');
    const { data: seoCampaigns, error: seoError } = await supabase
      .from('seo_campaigns')
      .select('id, name, number_of_articles, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (seoError) {
      console.error('❌ SEO campaigns query failed:', seoError);
    } else {
      console.log(`✅ Found ${seoCampaigns.length} SEO campaigns`);
      seoCampaigns.forEach(c => {
        console.log(`  - ${c.name} (${c.number_of_articles} articles, ${c.status})`);
      });
    }
    
    // Test 2: Check legacy campaigns table
    console.log('\n📊 Test 2: Checking legacy campaigns...');
    const { data: legacyCampaigns, error: legacyError } = await supabase
      .from('campaigns')
      .select('id, name, description, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (legacyError) {
      console.error('❌ Legacy campaigns query failed:', legacyError);
    } else {
      console.log(`✅ Found ${legacyCampaigns.length} legacy campaigns`);
      legacyCampaigns.forEach(c => {
        console.log(`  - ${c.name} (${c.status})`);
      });
    }
    
    // Test 3: Check blog posts
    console.log('\n📊 Test 3: Checking blog posts...');
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('id, title, seo_campaign_id, brand_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (blogError) {
      console.error('❌ Blog posts query failed:', blogError);
    } else {
      console.log(`✅ Found ${blogPosts.length} blog posts`);
      blogPosts.forEach(p => {
        const linkedStatus = p.seo_campaign_id ? '🔗 linked' : '❌ unlinked';
        console.log(`  - ${p.title?.substring(0, 50)}... (${linkedStatus}, ${p.status})`);
      });
    }
    
    // Test 4: Check unified view
    console.log('\n📊 Test 4: Checking unified campaigns view...');
    const { data: unifiedCampaigns, error: unifiedError } = await supabase
      .from('v_brand_all_campaigns')
      .select('id, source, name, status, posts, keywords')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (unifiedError) {
      console.error('❌ Unified view query failed:', unifiedError);
    } else {
      console.log(`✅ Unified view working! Found ${unifiedCampaigns.length} unified campaigns`);
      unifiedCampaigns.forEach(c => {
        const postsCount = Array.isArray(c.posts) ? c.posts.length : 0;
        const keywordsCount = Array.isArray(c.keywords) ? c.keywords.length : 0;
        console.log(`  - [${c.source.toUpperCase()}] ${c.name} (${postsCount} posts, ${keywordsCount} keywords, ${c.status})`);
      });
    }
    
    // Test 5: Check brands
    console.log('\n📊 Test 5: Checking brands...');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (brandsError) {
      console.error('❌ Brands query failed:', brandsError);
    } else {
      console.log(`✅ Found ${brands.length} brands`);
      brands.forEach(b => {
        console.log(`  - ${b.name} (${b.id})`);
      });
    }
    
    // Test 6: Check tracked keywords
    console.log('\n📊 Test 6: Checking tracked keywords...');
    const { data: trackedKeywords, error: keywordsError } = await supabase
      .from('seo_tracked_keywords')
      .select('id, keyword, brand_id, intents')
      .limit(5);
    
    if (keywordsError) {
      console.error('❌ Tracked keywords query failed:', keywordsError);
    } else {
      console.log(`✅ Found ${trackedKeywords.length} tracked keywords`);
      trackedKeywords.forEach(k => {
        console.log(`  - "${k.keyword}" (${k.intents?.join(', ') || 'no intents'})`);
      });
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log(`  • SEO campaigns: ${seoCampaigns?.length || 0}`);
    console.log(`  • Legacy campaigns: ${legacyCampaigns?.length || 0}`);
    console.log(`  • Blog posts: ${blogPosts?.length || 0}`);
    console.log(`  • Unified campaigns: ${unifiedCampaigns?.length || 0}`);
    console.log(`  • Brands: ${brands?.length || 0}`);
    console.log(`  • Tracked keywords: ${trackedKeywords?.length || 0}`);
    
    if (unifiedCampaigns?.length > 0) {
      console.log('\n✅ Your unified SEO campaigns table is ready to use!');
      console.log('🔗 Visit /dashboard/campaigns?type=SEO to see the unified view.');
    } else {
      console.log('\n💡 No campaign data found. Create some SEO campaigns using the SEO Copilot to see them in the unified table.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUnifiedView();

