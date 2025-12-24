import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const photo_reference = url.searchParams.get('photo_reference') || 
                           (await req.json().catch(() => ({})))?.photo_reference
    const maxwidth = url.searchParams.get('maxwidth') || 
                    (await req.json().catch(() => ({})))?.maxwidth || '800'
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    if (!photo_reference) {
      throw new Error('Photo reference is required')
    }

    // Build the Google Places Photo API URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photo_reference}&key=${apiKey}`
    
    console.log('Fetching photo with reference:', photo_reference, 'maxwidth:', maxwidth)
    
    // Fetch the photo from Google
    const response = await fetch(photoUrl)
    
    if (!response.ok) {
      console.error('Photo fetch failed:', response.status, response.statusText)
      throw new Error(`Photo fetch failed: ${response.status}`)
    }

    // Get the photo data as bytes
    const photoData = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    console.log('Photo fetched successfully, size:', photoData.byteLength, 'bytes', 'type:', contentType)

    return new Response(photoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Content-Length': photoData.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Error in google-place-photo function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch Google Places photo'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})