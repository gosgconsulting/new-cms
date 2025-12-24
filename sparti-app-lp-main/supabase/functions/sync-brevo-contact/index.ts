import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    USER_ID?: string;
    ROLE?: string;
    PLAN_ID?: string;
    TOKENS?: number;
    SUBSCRIPTION_STATUS?: string;
    CREATED_AT?: string;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY not configured');
    }

    const { user_id, email, first_name, last_name, role, plan_id, tokens, subscription_status } = await req.json();

    console.log('Syncing contact to Brevo:', { email, user_id });

    // Prepare Brevo contact data
    const contactData: BrevoContact = {
      email,
      attributes: {
        USER_ID: user_id,
        FIRSTNAME: first_name || '',
        LASTNAME: last_name || '',
        ROLE: role || 'user',
        PLAN_ID: plan_id || '',
        TOKENS: tokens || 0,
        SUBSCRIPTION_STATUS: subscription_status || '',
        CREATED_AT: new Date().toISOString(),
      },
      updateEnabled: true, // Allow updates to existing contacts
    };

    // Create or update contact in Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(contactData),
    });

    const brevoData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      // If contact already exists, update it instead
      if (brevoResponse.status === 400 && brevoData.code === 'duplicate_parameter') {
        console.log('Contact exists, updating...');
        
        const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': brevoApiKey,
          },
          body: JSON.stringify({
            attributes: contactData.attributes,
          }),
        });

        if (!updateResponse.ok) {
          const updateError = await updateResponse.json();
          throw new Error(`Failed to update Brevo contact: ${JSON.stringify(updateError)}`);
        }

        return new Response(
          JSON.stringify({ success: true, action: 'updated', email }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Brevo API error: ${JSON.stringify(brevoData)}`);
    }

    console.log('Contact synced successfully to Brevo');

    return new Response(
      JSON.stringify({ success: true, action: 'created', email, brevo_id: brevoData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing to Brevo:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
