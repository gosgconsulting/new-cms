// Content scraping functions

export async function scrapeReferenceContent(topic: any, supabase: any, authHeader: string) {
  console.log(`Attempting to scrape content for topic: ${topic.title}`)
  
  let sourceUrl = null
  if (topic.source) {
    try {
      const sourceData = JSON.parse(topic.source)
      sourceUrl = sourceData.url
      console.log(`Found source URL in topic.source: ${sourceUrl}`)
    } catch (error) {
      console.log('Failed to parse topic.source JSON:', error.message)
    }
  }
  
  if (sourceUrl) {
    try {
      console.log(`Strategy 1: Scraping original source: ${sourceUrl}`)
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/firecrawl-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          url: sourceUrl,
          formats: [{ type: "json", prompt: "Extract the main article content, title, author, publication date, and key topics. Return structured data with fields: title, content, author, date, topics, summary." }],
          onlyMainContent: true
        })
      })

      const data = await response.json()
      const error = !response.ok ? { message: data.error || 'Request failed' } : null

      if (!error && data?.data) {
        console.log('Strategy 1 successful: Original source scraped')
        return JSON.stringify(data.data)
      }
    } catch (error) {
      console.log('Strategy 1 error:', error.message)
    }
  }

  console.log('No suitable content found from scraping')
  throw new Error('All scraping strategies failed')
}
