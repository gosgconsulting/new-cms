// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
}

interface RequestBody {
  keywords: string[]
  country?: string
  language?: string
  deviceType?: string
  maxPages?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json() as RequestBody
    const { keywords = [], country = 'US', language = 'en', deviceType = 'desktop', maxPages = 2 } = body

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: 'keywords array required' }), { status: 400, headers: corsHeaders })
    }

    const apifyApiKey = Deno.env.get('APIFY_API_KEY')
    if (!apifyApiKey) {
      return new Response(JSON.stringify({ error: 'Missing APIFY_API_KEY on server' }), { status: 500, headers: corsHeaders })
    }

    // Using Apify Google Search scraper actor (public) via run-sync-get-dataset-items endpoint
    // Docs: https://docs.apify.com/ (Actors and API refs)
    const actorUrl = 'https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items'

    const input = {
      queries: keywords,
      maxPagesPerQuery: Math.max(1, Math.min(10, maxPages)),
      device: deviceType.toLowerCase(),
      languageCode: language,
      countryCode: country,
      includeUnfilteredResults: false
    }

    const res = await fetch(actorUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: `Apify error ${res.status}`, details: errText }), { status: 502, headers: corsHeaders })
    }

    const items = await res.json()

    // Normalize minimal SERP result set for table display
    const rows = (items as any[]).map((it, idx) => ({
      rank: it.rank || idx + 1,
      title: it.title || it.pageTitle || '',
      url: it.url || it.link || '',
      snippet: it.snippet || it.description || '',
      page: it.page || it.searchPage || 1,
      type: it.resultType || it.type || 'organic',
      query: it.query || it.searchQuery || ''
    }))

    return new Response(JSON.stringify({ success: true, rows, count: rows.length }), { status: 200, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), { status: 500, headers: corsHeaders })
  }
})




