// Database storage functions

export async function saveArticle(inputData: any, articleContent: string, featuredImageData: { imageUrl: string; altText: string } | null, supabase: any, metaDescription?: string | null) {
  const topic = inputData.topics[0]
  
  // Determine the correct SEO campaign ID
  let seoCampaignId = topic.seo_campaign_id || inputData.seo_campaign_id || null
  
  // If no seo_campaign_id but we have a campaign_id, try to get the seo_campaign_id from the campaign
  if (!seoCampaignId && (topic.campaign_id || inputData.campaign_id)) {
    const campaignId = topic.campaign_id || inputData.campaign_id
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('seo_campaign_id')
      .eq('id', campaignId)
      .single()
    
    if (campaign?.seo_campaign_id) {
      seoCampaignId = campaign.seo_campaign_id
    }
  }
  
  const articleData = {
    title: topic.title,
    content: articleContent,
    meta_description: metaDescription || null,
    featured_image: featuredImageData?.imageUrl || null,
    featured_image_alt: featuredImageData?.altText || null,
    brand_id: inputData.brandId,
    user_id: inputData.userId,
    campaign_id: topic.campaign_id || inputData.campaign_id || null,
    seo_campaign_id: seoCampaignId,
    status: 'draft',
    updated_at: new Date().toISOString()
  }

  // Check if a generating article already exists for this topic
  const { data: existingArticle, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('title', topic.title)
    .eq('brand_id', inputData.brandId)
    .eq('status', 'generating')
    .maybeSingle()
  
  if (fetchError) {
    console.error('Error fetching existing article:', fetchError)
    // Continue anyway - we'll try to insert
  }
  
  let data, error
  
  if (existingArticle) {
    // Update the existing generating article
    console.log('Updating existing generating article:', existingArticle.id)
    const updateResult = await supabase
      .from('blog_posts')
      .update(articleData)
      .eq('id', existingArticle.id)
      .select()
      .single()
    
    data = updateResult.data
    error = updateResult.error
    
    if (error) {
      console.error('Update error:', error)
    } else {
      console.log('Updated existing generating article successfully')
    }
  } else {
    // Create new article (fallback if placeholder wasn't created)
    console.log('Creating new article (no placeholder found)')
    const insertResult = await supabase
      .from('blog_posts')
      .insert({ ...articleData, created_at: new Date().toISOString() })
      .select()
      .single()
    
    data = insertResult.data
    error = insertResult.error
    
    if (error) {
      console.error('Insert error:', error)
    } else {
      console.log('Created new article successfully')
    }
  }

  if (error) {
    console.error('Database operation failed:', error)
    throw new Error(`Failed to save article: ${error.message}`)
  }

  if (!data) {
    console.error('No data returned from database operation')
    throw new Error('No data returned from database - article may not have been saved')
  }

  console.log('✅ Step 7 complete: Article saved successfully with ID:', data.id)
  return data
}
