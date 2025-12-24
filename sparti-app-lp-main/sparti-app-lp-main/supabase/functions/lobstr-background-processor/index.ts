import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LobstrRunStatus {
  id: string;
  status: string;
  total_results: number;
  total_unique_results: number;
  export_done: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lobstrApiKey = Deno.env.get('LOBSTR_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for pending background jobs
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('lobstr_background_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('next_check_at', new Date().toISOString())
      .limit(5);

    if (jobsError) {
      console.error('Error fetching pending jobs:', jobsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending jobs' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${pendingJobs.length} background jobs`);

    for (const job of pendingJobs) {
      try {
        // Mark job as processing
        await supabase
          .from('lobstr_background_jobs')
          .update({ 
            status: 'processing',
            last_checked_at: new Date().toISOString()
          })
          .eq('id', job.id);

        // Check Lobstr run status
        const statusResponse = await fetch(`https://api.lobstr.io/run/${job.lobstr_run_id}/status`, {
          headers: {
            'Authorization': `Bearer ${lobstrApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Lobstr API error: ${statusResponse.status}`);
        }

        const statusData: LobstrRunStatus = await statusResponse.json();
        console.log(`Job ${job.id}: Run ${job.lobstr_run_id} status: ${statusData.status}`);

        if (statusData.status === 'done' && statusData.export_done) {
          // Get results from Lobstr
          const resultsResponse = await fetch(`https://api.lobstr.io/run/${job.lobstr_run_id}/export`, {
            headers: {
              'Authorization': `Bearer ${lobstrApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (resultsResponse.ok) {
            const results = await resultsResponse.json();
            console.log(`Retrieved ${results.length} results for job ${job.id}`);

            // Save results to database
            if (results && results.length > 0) {
              const businessLeads = results.map((result: any, index: number) => ({
                id: crypto.randomUUID(),
                name: result.name || result.title || 'Unknown Business',
                phone: result.phone || null,
                email: result.email || null,
                website: result.website || null,
                address: result.address || null,
                category: result.category || result.type || null,
                activity: result.category || result.type || null,
                place_id: result.place_id || null,
                rating: result.rating ? parseFloat(result.rating) : null,
                reviews_count: result.reviews_count ? parseInt(result.reviews_count) : null,
                latitude: result.latitude ? parseFloat(result.latitude) : null,
                longitude: result.longitude ? parseFloat(result.longitude) : null,
                social_media: result.social_media || {},
                search_location: result.location || 'Unknown Location',
                search_query: result.search_query || '',
                search_categories: [result.category || result.type].filter(Boolean),
                lobstr_run_id: job.lobstr_run_id,
                scraped_sequence: index + 1,
                scraped_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'new',
                user_id: null // Will be set based on the run owner if available
              }));

              // Batch insert (Supabase handles up to 1000 rows)
              const batchSize = 1000;
              let totalSaved = 0;

              for (let i = 0; i < businessLeads.length; i += batchSize) {
                const batch = businessLeads.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                  .from('business_leads')
                  .insert(batch);

                if (insertError) {
                  console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
                } else {
                  totalSaved += batch.length;
                  console.log(`Saved batch ${i / batchSize + 1}: ${batch.length} leads`);
                }
              }

              console.log(`Total leads saved for job ${job.id}: ${totalSaved}`);

              // Update the original lobstr_run record
              await supabase
                .from('lobstr_runs')
                .update({ 
                  results_saved_count: totalSaved,
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('run_id', job.lobstr_run_id);
            }

            // Mark job as completed
            await supabase
              .from('lobstr_background_jobs')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('id', job.id);

          } else {
            throw new Error(`Failed to get results: ${resultsResponse.status}`);
          }
        } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
          // Mark job as failed
          await supabase
            .from('lobstr_background_jobs')
            .update({ 
              status: 'failed',
              error_message: `Lobstr run ${statusData.status}`,
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id);
        } else {
          // Still processing, schedule next check
          const nextCheckMinutes = Math.min(1 + job.retry_count, 5); // Progressive delay: 1, 2, 3, 4, 5 minutes max
          const nextCheckAt = new Date(Date.now() + nextCheckMinutes * 60 * 1000);
          
          await supabase
            .from('lobstr_background_jobs')
            .update({ 
              status: 'pending',
              retry_count: job.retry_count + 1,
              next_check_at: nextCheckAt.toISOString(),
              last_checked_at: new Date().toISOString()
            })
            .eq('id', job.id);
        }

      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        if (job.retry_count >= job.max_retries) {
          await supabase
            .from('lobstr_background_jobs')
            .update({ 
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id);
        } else {
          const nextCheckMinutes = Math.min(5 + job.retry_count * 2, 30); // Progressive delay with longer intervals
          const nextCheckAt = new Date(Date.now() + nextCheckMinutes * 60 * 1000);
          
          await supabase
            .from('lobstr_background_jobs')
            .update({ 
              status: 'pending',
              retry_count: job.retry_count + 1,
              next_check_at: nextCheckAt.toISOString(),
              last_checked_at: new Date().toISOString(),
              error_message: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('id', job.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${pendingJobs.length} jobs`,
      processed: pendingJobs.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Background processor error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});