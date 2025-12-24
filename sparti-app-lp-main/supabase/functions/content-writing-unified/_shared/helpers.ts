// Utility helper functions

export function cleanMetaDescriptionFromContent(content: string, source = ''): string {
  const metaDescMatch = content.match(/META_DESCRIPTION:\s*["'](.+?)["']/i)
  if (metaDescMatch) {
    console.log(`Removing meta description tag from ${source}`)
    return content.replace(/META_DESCRIPTION:\s*["'].+?["']\s*/gi, '').trim()
  }
  return content
}

export function extractHeadings(htmlContent: string): string[] {
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi
  const matches = htmlContent.match(headingRegex) || []
  return matches.map(match => {
    const textMatch = match.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i)
    return textMatch ? textMatch[1].replace(/<[^>]+>/g, '').trim() : ''
  }).filter(Boolean)
}

export function combineArticleChunks(chunks: string[], context: any): string {
  if (chunks.length === 0) {
    throw new Error('No article chunks to combine')
  }
  
  let combined = chunks.join('\n\n')
  
  // Clean up any duplicate headings between chunks
  const allHeadings = extractHeadings(combined)
  const seen = new Set<string>()
  const duplicates: string[] = []
  
  allHeadings.forEach(h => {
    const normalized = h.toLowerCase().trim()
    if (seen.has(normalized)) {
      duplicates.push(h)
    }
    seen.add(normalized)
  })
  
  if (duplicates.length > 0) {
    console.log('Found duplicate headings, cleaning up:', duplicates)
    duplicates.forEach(dup => {
      const regex = new RegExp(`<h[1-6][^>]*>${dup}</h[1-6]>`, 'gi')
      const matches = combined.match(regex) || []
      if (matches.length > 1) {
        combined = combined.replace(regex, (match, offset) => {
          return offset === combined.indexOf(matches[0]) ? match : ''
        })
      }
    })
  }
  
  return combined.trim()
}
