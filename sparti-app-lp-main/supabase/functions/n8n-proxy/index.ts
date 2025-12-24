// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Content-Type": "application/json",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, method = "GET", body } = await req.json()

    if (!endpoint || typeof endpoint !== "string") {
      return new Response(JSON.stringify({ error: "Missing endpoint" }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const apiUrl = Deno.env.get("N8N_API_URL")
    const apiKey = Deno.env.get("N8N_API_KEY")

    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: "Server missing N8N_API_URL or N8N_API_KEY" }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    const url = `${apiUrl}${endpoint}`

    const upstream = await fetch(url, {
      method,
      headers: {
        "X-N8N-API-KEY": apiKey,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await upstream.text()

    return new Response(text, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})




