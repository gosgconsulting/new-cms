// Context fetching functions

export async function fetchEnhancedContext(inputData: any, supabase: any) {
  const context: any = {
    brandInfo: null,
    campaignInfo: null
  }

  try {
    const { data: brandData } = await supabase
      .from('brands')
      .select('*')
      .eq('id', inputData.brandId)
      .single()
    
    if (brandData) {
      context.brandInfo = {
        name: brandData.name,
        website: brandData.website,
        description: brandData.description,
        target_audience: brandData.target_audience,
        brand_voice: brandData.brand_voice,
        industry: brandData.industry,
        key_selling_points: brandData.key_selling_points
      }
      console.log('Brand info fetched successfully')
    }

    const topic = inputData.topics[0]
    if (topic.campaign_id) {
      const { data: campaignData } = await supabase
        .from('seo_campaigns')
        .select('*')
        .eq('id', topic.campaign_id)
        .single()
      
      if (campaignData) {
        context.campaignInfo = {
          website_url: campaignData.website_url,
          business_description: campaignData.business_description,
          target_country: campaignData.target_country,
          language: campaignData.language,
          organic_keywords: campaignData.organic_keywords || [],
          style_analysis: campaignData.style_analysis,
          competitors: campaignData.style_analysis?.competitorData?.topCompetitors || [],
          content_pillars: campaignData.style_analysis?.contentPillars || []
        }
        console.log('Campaign info fetched successfully')
      }
    }
  } catch (error) {
    console.error('Error fetching enhanced context:', error.message)
  }

  return context
}
