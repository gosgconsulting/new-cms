// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-secret",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const ingestSecret = Deno.env.get("INGEST_SECRET")

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface IngestItem {
  url: string
  title?: string
  description?: string
  displayed_url?: string
  domain?: string
  position?: number
  page_number?: number
  is_organic?: boolean
  is_paid?: boolean
  answer?: string | null
  question?: string | null
  date_published?: string | null
}

interface IngestBody {
  provider: "lobstr" | "apify"
  userId: string
  searchSessionId?: string
  searchKeyword?: string
  items: IngestItem[]
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!ingestSecret) {
      return json({ error: "INGEST_SECRET not configured" }, 500)
    }

    const headerSecret = req.headers.get("x-ingest-secret") || req.headers.get("X-Ingest-Secret")
    if (headerSecret !== ingestSecret) {
      return json({ error: "Unauthorized" }, 401)
    }

    const body: IngestBody = await req.json()
    const validation = validate(body)
    if (!validation.valid) {
      return json({ error: "Validation failed", details: validation.errors }, 400)
    }

    const nowIso = new Date().toISOString()
    const rows = body.items.map((it, idx) => ({
      user_id: body.userId,
      search_session_id: body.searchSessionId || null,
      search_keyword: body.searchKeyword || null,
      url: it.url,
      title: it.title || null,
      description: it.description || null,
      displayed_url: it.displayed_url || null,
      domain: it.domain || extractDomain(it.url),
      position: it.position ?? idx + 1,
      page_number: it.page_number ?? Math.ceil((idx + 1) / 10),
      is_organic: it.is_organic ?? true,
      is_paid: it.is_paid ?? false,
      answer: it.answer ?? null,
      question: it.question ?? null,
      date_published: it.date_published ?? null,
      provider: body.provider,
      scraped_at: nowIso,
      processing_status: "completed",
    }))

    const { data, error } = await supabase
      .from("google_search_results")
      .upsert(rows, { onConflict: "user_id,url,search_keyword,provider" })
      .select("id")

    if (error) {
      return json({ error: error.message }, 500)
    }

    return json({ success: true, inserted: data?.length || 0 })
  } catch (e) {
    return json({ error: e?.message || "Unknown error" }, 500)
  }
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function validate(body: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = []
  if (!body || typeof body !== "object") errors.push("Body must be object")
  if (!body.provider || !["lobstr", "apify"].includes(body.provider)) errors.push("Invalid provider")
  if (!body.userId || typeof body.userId !== "string") errors.push("userId is required")
  if (!Array.isArray(body.items)) errors.push("items must be array")
  if (Array.isArray(body.items)) {
    body.items.forEach((it: any, i: number) => {
      if (!it || typeof it !== "object") errors.push(`items[${i}] must be object`)
      if (!it.url || typeof it.url !== "string") errors.push(`items[${i}].url is required`)
    })
  }
  return { valid: errors.length === 0, errors }
}

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}




