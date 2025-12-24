import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Verified Lobstr.io API Configuration
const API_BASE = "https://api.lobstr.io/v1";
const GOOGLE_MAPS_CRAWLER_ID = "4734d096159ef05210e0e1677e8be823";
const GOOGLE_MAPS_SQUID_ID = "6ca4a28a5b60433ea5feba79fe4b3d0e";

const lobstrApiKey = Deno.env.get('LOBSTR_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LobstrRequest {
  type: 'prepare_squid' | 'add_tasks' | 'launch_run' | 'get_status' | 'get_results' | 'save_incremental' | 'start_multi_search' | 'stop_run' | 'abort_run' | 'get_geolocation';
  query?: string;
  location?: string;
  maxResults?: number;
  runId?: string;
  squidId?: string;
  userId?: string;
  targetLeads?: number;
  searchBatchSize?: number;
  // New fields for parameter-based tasks
  useParameterTasks?: boolean;
  country?: string;
  region?: string;
  district?: string;
  city?: string;
  category?: string;
  // Geolocation API fields
  country_code?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!lobstrApiKey) {
      throw new Error('Lobstr API key not configured');
    }

    const request: LobstrRequest = await req.json();
    console.log('=== LOBSTR API REQUEST ===');
    console.log('Type:', request.type);
    console.log('Request data:', JSON.stringify(request, null, 2));

    const lobstrHeaders = {
      'Authorization': `Token ${lobstrApiKey}`,
      'Content-Type': 'application/json',
    };

    // STEP 1: PREPARE SQUID (Use Existing, Empty & Update)
    if (request.type === 'prepare_squid') {
      console.log('=== STEP 1: PREPARE SQUID (EMPTY & UPDATE) ===');
      
      if (!request.query || !request.location) {
        const errorResponse = { error: 'Query and location are required', request };
        return new Response(JSON.stringify({
          success: false,
          error: 'Query and location are required',
          debugData: errorResponse
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Step 1a: Empty existing squid tasks
        console.log('🧹 Emptying existing squid tasks...');
        const emptyResponse = await emptySquidTasks(GOOGLE_MAPS_SQUID_ID, lobstrHeaders);
        console.log('✅ Tasks cleared');

        // Step 1b: Update squid settings with EXACT max results requested
        console.log(`⚙️ Updating squid settings for EXACT ${request.maxResults || 50} results...`);
        const settingsResponse = await updateSquidSettings(GOOGLE_MAPS_SQUID_ID, request.maxResults || 50, lobstrHeaders);
        console.log(`✅ Settings updated - max_results set to ${request.maxResults || 50}`);

        // No database tracking needed at this stage - we'll track when we get the actual run_id
        console.log('✅ Squid prepared successfully - ready for tasks');

        const successResponse = {
          success: true,
          squidId: GOOGLE_MAPS_SQUID_ID,
          message: 'Squid prepared successfully (emptied and updated)',
          debugData: {
            emptyResponse,
            settingsResponse
          }
        };

        return new Response(JSON.stringify(successResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Prepare squid failed:', error);
        const errorResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'prepare_squid',
            squidId: GOOGLE_MAPS_SQUID_ID,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
        };
        
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 2: ADD TASKS
    if (request.type === 'add_tasks') {
      console.log('=== STEP 2: ADD SEARCH TASKS ===');
      
      if (!request.query || !request.location || !request.userId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Query, location, and userId are required for Step 2',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Generate a unique search session ID for tracking
        const searchSessionId = crypto.randomUUID();
        
        // Create or update database record for this search session
        // Use upsert to handle existing records
        const { data: runRecord, error: dbError } = await supabase
          .from('lobstr_runs')
          .upsert({
            squid_id: GOOGLE_MAPS_SQUID_ID,
            query: request.query,
            location: request.location,
            max_results: request.maxResults || 50,
            status: 'tasks_being_added',
            user_id: request.userId,
            search_session_id: searchSessionId,
            total_results_found: 0,
            unique_results_saved: 0
          }, {
            onConflict: 'user_id,squid_id'
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error details:', dbError);
          return new Response(
            JSON.stringify({
              success: false,
              error: `Database error: ${dbError.message}`,
              debugData: {
                step: 'add_tasks',
                error: `Database error: ${dbError.message}`,
                dbErrorCode: dbError.code,
                dbErrorDetails: dbError.details
              }
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('✅ Created run record:', runRecord.id);

        // Also create a user-facing campaign record in scraping_runs
        const { data: campaignRecord, error: campaignError } = await supabase
          .from('scraping_runs')
          .insert({
            user_id: request.userId,
            query: request.query,
            location: request.location,
            max_results: request.maxResults || 50,
            status: 'pending',
            lobstr_run_id: null, // Will be updated after launch
            lobstr_squid_id: GOOGLE_MAPS_SQUID_ID
          })
          .select()
          .single();

        if (campaignError) {
          console.warn('Warning: Failed to create campaign record in scraping_runs:', campaignError);
        } else {
          console.log('✅ Created campaign record:', campaignRecord.id);
          // Link the lobstr_run to the campaign
          await supabase
            .from('lobstr_runs')
            .update({ parent_campaign_id: campaignRecord.id })
            .eq('id', runRecord.id);
        }

        // Determine task type and prepare tasks
        let tasks;
        const shouldUseParameterTasks = await shouldUseParameterBasedTasks(runRecord.location);
        
        if (shouldUseParameterTasks) {
          console.log('🔧 Using parameter-based tasks for better accuracy...');
          const locationData = await parseLocationForParameterTasks(runRecord.location);
          tasks = [{
            city: locationData.city,
            category: runRecord.query,
            country: locationData.country,
            region: locationData.region,
            district: locationData.district
          }];
          console.log('📝 Parameter-based task:', JSON.stringify(tasks[0], null, 2));
        } else {
          console.log('🗺️ Using URL-based tasks as fallback...');
          const taskUrl = buildGoogleMapsUrl(runRecord.query, runRecord.location);
          console.log('🗺️ Task URL:', taskUrl);
          tasks = [{ url: taskUrl }];
        }

        // Add tasks to squid
        console.log('📝 Adding tasks to squid...');
        const tasksResponse = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: lobstrHeaders,
          body: JSON.stringify({
            tasks,
            squid: runRecord.squid_id
          })
        });

        if (!tasksResponse.ok) {
          const errorText = await tasksResponse.text();
          console.error('❌ Failed to add tasks:', tasksResponse.status, errorText);
          throw new Error(`Failed to add tasks: ${tasksResponse.status} - ${errorText}`);
        }

        const tasksData = await tasksResponse.json();
        console.log('✅ Tasks added successfully');

        const successResponse = {
          success: true,
          message: 'Tasks added successfully',
          debugData: {
            tasks,
            tasksResponse: tasksData,
            runRecord,
            campaignRecord,
            taskType: shouldUseParameterTasks ? 'parameter-based' : 'url-based'
          }
        };

        return new Response(JSON.stringify(successResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Add tasks failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'add_tasks',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 3: LAUNCH RUN
    if (request.type === 'launch_run') {
      console.log('=== STEP 3: LAUNCH SCRAPING RUN ===');
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Get squid ID from database
        const { data: runRecord, error: dbError } = await supabase
          .from('lobstr_runs')
          .select('*')
          .eq('id', request.runId)
          .single();

        if (dbError || !runRecord) {
          throw new Error('Run record not found');
        }

        console.log('🚀 Launching run for squid:', runRecord.squid_id);
        console.log('📊 Run record debug - abort_limit:', runRecord.abort_limit, 'target_leads:', runRecord.target_leads);
        
        const launchResponse = await fetch(`${API_BASE}/runs`, {
          method: 'POST',
          headers: lobstrHeaders,
          body: JSON.stringify({
            squid: runRecord.squid_id
          })
        });

        if (!launchResponse.ok) {
          const errorText = await launchResponse.text();
          console.error('❌ Failed to launch run:', launchResponse.status, errorText);
          
          // Parse error response to provide better user feedback
          let errorMessage = `Failed to launch run: ${launchResponse.status} - ${errorText}`;
          let errorType = 'LAUNCH_ERROR';
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.errors?.type === 'NoMoreCredits') {
              errorMessage = 'No more Lobstr.io credits available. Please upgrade your Lobstr.io plan to continue scraping.';
              errorType = 'NO_CREDITS';
            } else if (errorData.errors?.message) {
              errorMessage = errorData.errors.message;
            }
          } catch (parseError) {
            // Keep original error message if parsing fails
          }
          
          const error = new Error(errorMessage) as Error & { type?: string };
          error.type = errorType;
          throw error;
        }

        const runResult = await launchResponse.json();
        console.log('✅ Run launched successfully:', runResult.id);

        // Update database with run ID
        await supabase
          .from('lobstr_runs')
          .update({ 
            run_id: runResult.id, 
            status: 'running',
            started_at: new Date().toISOString()
          })
          .eq('id', request.runId);

        // Also update the scraping_runs campaign record
        if (runRecord.parent_campaign_id) {
          await supabase
            .from('scraping_runs')
            .update({
              lobstr_run_id: runResult.id,
              status: 'running',
              started_at: new Date().toISOString()
            })
            .eq('id', runRecord.parent_campaign_id);
        }

        const successResponse = {
          success: true,
          lobstrRunId: runResult.id,
          message: 'Run launched successfully',
          debugData: {
            runResult,
            runRecord
          }
        };

        return new Response(JSON.stringify(successResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Launch run failed:', error);
        
        // Use appropriate HTTP status based on error type
        const status = (error instanceof Error && (error as any).type === 'NO_CREDITS') ? 402 : 500; // 402 Payment Required for credits issue
        
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: (error instanceof Error && (error as any).type) || 'LAUNCH_ERROR',
          debugData: {
            step: 'launch_run',
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: (error instanceof Error && (error as any).type) || 'LAUNCH_ERROR',
            stack: error instanceof Error ? error.stack : undefined
          }
        }), {
          status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 4: GET STATUS
    if (request.type === 'get_status') {
      console.log('=== CHECKING RUN STATUS ===');
      console.log('Run ID:', request.runId);
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const statusResponse = await fetch(`${API_BASE}/runs/${request.runId}`, {
          headers: lobstrHeaders,
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error('Failed to get status:', errorText);
          throw new Error(`Failed to get status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        console.log('Run status:', statusData.status);

        const successResponse = {
          success: true,
          status: statusData.status,
          progress: statusData.progress || 0,
          message: getStatusMessage(statusData.status),
          debugData: statusData
        };

        return new Response(JSON.stringify(successResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Get status failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'get_status',
            runId: request.runId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 5: GET RESULTS AND SAVE TO DATABASE
    if (request.type === 'get_results') {
      console.log('=== STEP 4: COLLECT RESULTS & SAVE TO DATABASE ===');
      console.log('Run ID:', request.runId);
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Get run record from database including user_id
        const { data: runRecord } = await supabase
          .from('lobstr_runs')
          .select('*')
          .eq('run_id', request.runId)
          .single();

        if (!runRecord) {
          throw new Error('Run record not found');
        }

        // Check run status and get total_results from Lobstr API
        const statusResponse = await fetch(`${API_BASE}/runs/${request.runId}`, {
          headers: lobstrHeaders,
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to check run status');
        }

        const statusData = await statusResponse.json();
        console.log('Run status:', statusData.status);
        console.log('Total results from Lobstr:', statusData.total_results || 0);

        // Check if we've reached our target limit based on total_results
        const totalResultsFromLobstr = statusData.total_results || 0;
        const targetLimit = runRecord.max_results;
        
        if (totalResultsFromLobstr >= targetLimit && statusData.status === 'running') {
          console.log(`🛑 Target limit reached! Results: ${totalResultsFromLobstr}/${targetLimit} - Aborting run via API...`);
          
          // ABORT the run via API (more forceful than stop)
          try {
            const abortResponse = await fetch(`${API_BASE}/runs/${request.runId}/abort`, {
              method: 'POST',
              headers: lobstrHeaders,
            });
            
            if (abortResponse.ok) {
              console.log('✅ Run aborted successfully');
              // Update database status immediately
              await supabase
                .from('lobstr_runs')
                .update({ 
                  status: 'target_reached',
                  completed_at: new Date().toISOString()
                })
                .eq('id', runRecord.id);
            } else {
              const errorText = await abortResponse.text();
              console.warn(`⚠️ Failed to abort run: ${abortResponse.status} - ${errorText}`);
              console.log('🔄 Trying fallback stop method...');
              
              // Fallback to stop if abort fails
              const stopResponse = await fetch(`${API_BASE}/runs/${request.runId}/stop`, {
                method: 'POST',
                headers: lobstrHeaders,
              });
              
              if (stopResponse.ok) {
                console.log('✅ Run stopped successfully via fallback');
              } else {
                console.warn('⚠️ Both abort and stop failed, but continuing with results collection');
              }
            }
          } catch (abortError) {
            console.warn('⚠️ Error aborting run:', abortError);
          }
        }

        // Allow saving results for active statuses
        if (!['done', 'running', 'uploading', 'aborted'].includes(statusData.status)) {
          return new Response(JSON.stringify({
            success: false,
            status: statusData.status,
            message: `Cannot retrieve results. Status: ${statusData.status}`,
            debugData: statusData
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get results using squid and run parameters with pagination support
        let resultsResponse;
        try {
          resultsResponse = await fetch(`${API_BASE}/results?squid=${runRecord.squid_id}&run=${request.runId}&page_size=100`, {
            headers: lobstrHeaders,
          });
        } catch (error) {
          // Fallback without pagination if API doesn't support it
          resultsResponse = await fetch(`${API_BASE}/results?squid=${runRecord.squid_id}&run=${request.runId}`, {
            headers: lobstrHeaders,
          });
        }

        if (!resultsResponse.ok) {
          const errorText = await resultsResponse.text();
          console.error('Failed to get results:', errorText);
          throw new Error(`Failed to get results: ${resultsResponse.status}`);
        }

        const resultsData = await resultsResponse.json();
        let resultsArray = [];
        
        // Handle different response formats from Lobstr.io API
        if (Array.isArray(resultsData)) {
          resultsArray = resultsData;
        } else if (resultsData?.data && Array.isArray(resultsData.data)) {
          resultsArray = resultsData.data;
        } else if (resultsData?.results && Array.isArray(resultsData.results)) {
          resultsArray = resultsData.results;
        }
        
        console.log(`Retrieved ${resultsArray.length} results from Lobstr.io`);
        
        // Enforce max results limit at the API level
        if (resultsArray.length > runRecord.max_results) {
          console.log(`⚠️ Lobstr returned ${resultsArray.length} results, enforcing limit of ${runRecord.max_results}`);
          resultsArray = resultsArray.slice(0, runRecord.max_results);
        }

        // Check current lead count for this run to determine starting sequence
        const { data: existingLeads } = await supabase
          .from('business_leads')
          .select('scraped_sequence')
          .eq('lobstr_run_id', runRecord.id)
          .order('scraped_sequence', { ascending: false })
          .limit(1);

        const lastSequence = existingLeads?.[0]?.scraped_sequence || 0;
        
        // Save ALL results from Lobstr API - don't skip any
        // The "unique results" setting is for Lobstr API, we save all results they return
        const newLeads = resultsArray;
        
        console.log(`Saving ${newLeads.length} leads from Lobstr API (all ${resultsArray.length} results)`);

        // Transform and save new results to business_leads table with deduplication
        const savedLeads = [];
        const duplicateLeads = [];
        
        for (let i = 0; i < newLeads.length; i++) {
          const item = newLeads[i];
          const sequence = i + 1; // Always start from 1 for each run
          
          const leadData = {
            name: item.name || item.title || 'Unknown Business',
            address: item.address || item.location || 'Address not available',
            phone: item.phone || item.phone_number || '',
            email: item.email || '',
            website: item.website || item.url || '',
            rating: item.rating ? parseFloat(item.rating) : null,
            category: item.category || item.type || 'Business',
            search_query: runRecord.query || '',
            search_location: runRecord.location || '',
            search_categories: [item.category || item.type || 'Business'],
            user_id: runRecord.user_id,
            lobstr_run_id: runRecord.id,
            scraped_sequence: sequence,
            processing_status: 'completed',
            social_media: {
              website: item.website || item.url || '',
              facebook: item.facebook || '',
              instagram: item.instagram || '',
              twitter: item.twitter || ''
            },
            latitude: item.latitude ? parseFloat(item.latitude) : null,
            longitude: item.longitude ? parseFloat(item.longitude) : null,
            reviews_count: item.reviews_count ? parseInt(item.reviews_count) : null,
            place_id: item.place_id || '',
            google_id: item.google_id || item.cid || '',
            cid: item.cid || '',
            google_url: item.google_url || '',
            activity: item.category || item.type || 'Business'
          };

          try {
            // Always save as a new lead for this run - no deduplication check
            // This ensures we save all results from Lobstr API as requested
            const { data: savedLead, error: saveError } = await supabase
              .from('business_leads')
              .insert(leadData)
              .select()
              .single();

            if (saveError) {
              console.error(`Failed to save lead ${sequence}:`, saveError);
            } else {
              savedLeads.push(savedLead);
              console.log(`✅ Saved lead ${sequence}: ${leadData.name}`);
            }
          } catch (leadError) {
            console.error(`Error processing lead ${sequence}:`, leadError);
          }
        }

        // Update run record with new counts
        const totalSaved = savedLeads.length; // All results are saved as new leads
        const totalProcessed = savedLeads.length;
        
        await supabase
          .from('lobstr_runs')
          .update({ 
            status: statusData.status === 'done' ? 'completed' : 'processing',
            completed_at: statusData.status === 'done' ? new Date().toISOString() : null,
            results_count: resultsArray.length,
            results_saved_count: totalSaved,
            total_results_found: totalResultsFromLobstr,
            unique_results_saved: savedLeads.length
          })
          .eq('id', runRecord.id);

        const successResponse = {
          success: true,
          totalResults: resultsArray.length,
          totalResultsFromLobstr: totalResultsFromLobstr,
          newLeadsSaved: savedLeads.length,
          duplicateLeads: duplicateLeads.length,
          totalLeadsSaved: totalSaved,
          runStatus: statusData.status,
          targetReached: totalResultsFromLobstr >= targetLimit,
          searchSummary: {
            query: runRecord.query,
            location: runRecord.location,
            totalFound: totalResultsFromLobstr,
            uniqueSaved: savedLeads.length,
            message: `You searched for "${runRecord.query}" in ${runRecord.location}, and saved ${savedLeads.length} unique results / ${totalResultsFromLobstr} total found`
          },
          message: totalResultsFromLobstr >= targetLimit
            ? `Target reached! You searched for "${runRecord.query}" and saved ${savedLeads.length} unique results / ${totalResultsFromLobstr} total found`
            : statusData.status === 'done' 
              ? `Scraping completed! You searched for "${runRecord.query}" and saved ${savedLeads.length} unique results / ${totalResultsFromLobstr} total found`
              : `Processing... You searched for "${runRecord.query}" and found ${totalResultsFromLobstr} results so far. Saved ${savedLeads.length} unique leads.`,
          debugData: {
            statusData,
            resultsCount: resultsArray.length,
            totalResultsFromLobstr,
            targetLimit,
            targetReached: totalResultsFromLobstr >= targetLimit,
            lastSequence,
            newLeadsCount: newLeads.length,
            savedLeadsCount: savedLeads.length,
            duplicateCount: duplicateLeads.length
          }
        };

        return new Response(JSON.stringify(successResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Get results failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'get_results',
            runId: request.runId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // INCREMENTAL SAVE: Save results as they become available
    if (request.type === 'save_incremental') {
      console.log('=== INCREMENTAL SAVE: CHECKING & SAVING NEW RESULTS ===');
      console.log('Run ID:', request.runId);
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // This endpoint can be called repeatedly to check for new results
        // and save them incrementally without waiting for the full scraping to complete
        const getResultsRequest = { ...request, type: 'get_results' };
        
        // Recursively call the get_results handler
        return await fetch(req.url, {
          method: 'POST',
          headers: req.headers,
          body: JSON.stringify(getResultsRequest)
        });

      } catch (error) {
        console.error('❌ Incremental save failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'save_incremental',
            runId: request.runId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // MULTI-SEARCH: Start large quantity extraction with pagination
    if (request.type === 'start_multi_search') {
      console.log('=== MULTI-SEARCH: LARGE QUANTITY EXTRACTION ===');
      console.log('Target leads:', request.targetLeads, 'Batch size:', request.searchBatchSize);
      
      if (!request.query || !request.location || !request.targetLeads || !request.userId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Query, location, targetLeads, and userId are required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const targetLeads = request.targetLeads!;
        
        // CRITICAL FIX: Only create multiple searches if target exceeds Google's 200-result limit
        // Each search should get the FULL target amount, not split it
        const GOOGLE_MAX_RESULTS_PER_SEARCH = 200;
        const searchesNeeded = Math.max(1, Math.ceil(targetLeads / GOOGLE_MAX_RESULTS_PER_SEARCH));
        const resultsPerSearch = Math.min(targetLeads, GOOGLE_MAX_RESULTS_PER_SEARCH);
        
        
        console.log(`🔍 Target: ${targetLeads} leads`);
        console.log(`📊 Searches needed: ${searchesNeeded} (max ${GOOGLE_MAX_RESULTS_PER_SEARCH} per search)`);
        console.log(`🎯 Results per search: ${resultsPerSearch}`);
        console.log(`🛑 DYNAMIC Abort Limit: ${targetLeads} (from user input)`);
        
        // Create parent campaign record with new abort limit system
        const { data: campaignRecord, error: campaignError } = await supabase
          .from('lobstr_runs')
          .insert({
            squid_id: GOOGLE_MAPS_SQUID_ID,
            query: request.query,
            location: request.location,
            max_results: 200, // Always use 200 per task for efficiency
            abort_limit: targetLeads, // DYNAMIC: Set abort limit to user's requested leads
            task_creation_type: 'single_location', // NEW: Natural task creation
            geographic_segments: [request.location], // NEW: Store geography
            searches_total: 1, // Start with 1 task, more can be added naturally
            searches_completed: 0,
            search_batch_size: 200,
            search_index: 0, // This is the parent campaign
            status: 'single_search_planned', // Updated status
            user_id: request.userId
          })
          .select()
          .single();

        if (campaignError) {
          console.error('Failed to create campaign record:', campaignError);
          throw new Error('Failed to create campaign record');
        }

        console.log(`✅ Created natural task campaign: ${campaignRecord.id}`);

        // NATURAL TASK CREATION: No more mathematical calculations
        console.log(`🔍 NATURAL TASK CREATION:`);
        console.log(`📍 Single location: ${request.location}`);
        console.log(`🎯 Abort limit: ${targetLeads} leads`);
        console.log(`🚀 Starting with 1 task, abort mechanism will handle limit`);
        
        // REMOVED: Mathematical task validation - now using abort limits
        // The abort mechanism will automatically stop when target is reached
        
        // NATURAL GEOGRAPHIC TASK CREATION: Use exact user location
        // Each location becomes one task, no artificial segmentation
        const geographicSegments = [request.location]; // Single location = single task
        
        console.log(`🗺️ Natural task creation: Using "${request.location}" for initial task`);
        
        // Create the initial task (more can be added later naturally)
        const searchRuns = [];
        const segmentLocation = request.location; // Use exact location
        
        const { data: searchRun, error: runError } = await supabase
          .from('lobstr_runs')
          .insert({
            squid_id: GOOGLE_MAPS_SQUID_ID,
            query: request.query,
            location: request.location,
            max_results: 200, // Standard batch size
            abort_limit: targetLeads, // DYNAMIC: Abort limit for this task
            task_creation_type: 'single_location', // NEW: Natural task creation
            geographic_segments: [request.location], // NEW: Store geography
            searches_total: 1,
            searches_completed: 0,
            search_batch_size: 200,
            search_index: 1,
            parent_campaign_id: campaignRecord.id,
            geographic_segment: { original_location: request.location, segment_location: segmentLocation, segment_index: 1 },
            status: 'search_planned',
            user_id: request.userId
          })
          .select()
          .single();

        if (!runError) {
          searchRuns.push(searchRun);
          console.log(`📋 Created initial task for: ${segmentLocation}`);
        } else {
          console.error('Failed to create initial task:', runError);
          throw new Error('Failed to create initial search task');
        }

        // Start the first (and likely only) search immediately
        if (searchRuns.length > 0) {
          console.log('🚀 Starting natural task search...');
          const firstSearch = searchRuns[0];
          
          // Update status to indicate we're starting
          await supabase
            .from('lobstr_runs')
            .update({ status: 'single_search_running' })
            .eq('id', campaignRecord.id);

          // Return the campaign info to start polling
          const successResponse = {
            success: true,
            campaignId: campaignRecord.id,
            searchRuns: searchRuns.map(run => ({
              id: run.id,
              searchIndex: run.search_index,
              location: run.geographic_segment.segment_location,
              status: run.status
            })),
            totalSearches: searchesNeeded,
            targetLeads: targetLeads,
            batchSize: resultsPerSearch,
            message: `Multi-search campaign created: ${searchesNeeded} searches planned to reach ${targetLeads} leads`,
            debugData: {
              campaignRecord,
              searchRuns: searchRuns.length,
              geographicSegments
            }
          };

          return new Response(JSON.stringify(successResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          throw new Error('Failed to create search runs');
        }

      } catch (error) {
        console.error('❌ Multi-search setup failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'start_multi_search',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STOP RUN: Manually stop a running scrape
    if (request.type === 'stop_run') {
      console.log('=== STOP RUN ===');
      console.log('Run ID:', request.runId);
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Stop the run via Lobstr API
        const stopResponse = await fetch(`${API_BASE}/runs/${request.runId}/stop`, {
          method: 'POST',
          headers: lobstrHeaders,
        });

        if (!stopResponse.ok) {
          const errorText = await stopResponse.text();
          console.error('Failed to stop run:', errorText);
          throw new Error(`Failed to stop run: ${stopResponse.status} - ${errorText}`);
        }

        const stopResult = await stopResponse.json();
        console.log('✅ Run stopped successfully');

        // Update database record
        const { data: runRecord } = await supabase
          .from('lobstr_runs')
          .select('*')
          .eq('run_id', request.runId)
          .single();

        if (runRecord) {
          await supabase
            .from('lobstr_runs')
            .update({ 
              status: 'stopped',
              completed_at: new Date().toISOString()
            })
            .eq('id', runRecord.id);
        }

        const successResponse = {
          success: true,
          message: 'Run stopped successfully',
          debugData: {
            stopResult,
            runRecord
          }
        };

        return new Response(JSON.stringify(successResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Stop run failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'stop_run',
            runId: request.runId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ABORT RUN: Forcefully abort a running scrape (stronger than stop)
    if (request.type === 'abort_run') {
      console.log('=== ABORT RUN ===');
      console.log('Run ID:', request.runId);
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Abort the run via Lobstr API (more forceful than stop)
        const abortResponse = await fetch(`${API_BASE}/runs/${request.runId}/abort`, {
          method: 'POST',
          headers: lobstrHeaders,
        });

        if (!abortResponse.ok) {
          const errorText = await abortResponse.text();
          console.error('Failed to abort run:', errorText);
          
          // Try stop as fallback
          console.log('🔄 Trying stop as fallback...');
          const stopResponse = await fetch(`${API_BASE}/runs/${request.runId}/stop`, {
            method: 'POST',
            headers: lobstrHeaders,
          });
          
          if (!stopResponse.ok) {
            throw new Error(`Failed to abort or stop run: ${abortResponse.status} - ${errorText}`);
          }
        }

        console.log('✅ Run aborted successfully');

        // Update database record
        const { data: runRecord } = await supabase
          .from('lobstr_runs')
          .select('*')
          .eq('run_id', request.runId)
          .single();

        if (runRecord) {
          await supabase
            .from('lobstr_runs')
            .update({ 
              status: 'aborted',
              completed_at: new Date().toISOString()
            })
            .eq('id', runRecord.id);
        }

        const successResponse = {
          success: true,
          message: 'Run aborted successfully',
          debugData: {
            runRecord
          }
        };

        return new Response(JSON.stringify(successResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Abort run failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          debugData: {
            step: 'abort_run',
            runId: request.runId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    throw new Error(`Unknown request type: ${request.type}`);

  } catch (error) {
    console.error('Error in lobstr-scraper function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debugData: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
async function emptySquidTasks(squidId: string, headers: Record<string, string>) {
  try {
    console.log(`🧹 Starting to empty squid ${squidId} tasks...`);
    
    // First, get all existing tasks for this squid
    console.log(`📋 Fetching existing tasks for squid: ${squidId}`);
    const tasksResponse = await fetch(`${API_BASE}/tasks?squid=${squidId}`, {
      method: 'GET',
      headers
    });

    console.log(`📋 Tasks response status: ${tasksResponse.status}`);
    
    if (!tasksResponse.ok) {
      const errorText = await tasksResponse.text();
      console.error(`❌ Failed to fetch tasks: ${tasksResponse.status} - ${errorText}`);
      return { warning: `Failed to fetch tasks: ${errorText}` };
    }

    const tasksData = await tasksResponse.json();
    console.log(`📋 Raw tasks response:`, JSON.stringify(tasksData, null, 2));
    console.log(`📋 Found ${tasksData.tasks?.length || 0} existing tasks`);
    
    // Delete each task individually with detailed logging
    if (tasksData.tasks && tasksData.tasks.length > 0) {
      console.log(`🗑️ Starting to delete ${tasksData.tasks.length} tasks...`);
      let deletedCount = 0;
      let failedCount = 0;
      
      for (const task of tasksData.tasks) {
        try {
          console.log(`🗑️ Deleting task ${task.id}...`);
          const deleteResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
            method: 'DELETE',
            headers
          });
          
          console.log(`🗑️ Delete response for task ${task.id}: ${deleteResponse.status}`);
          
          if (deleteResponse.ok) {
            deletedCount++;
            console.log(`✅ Successfully deleted task ${task.id}`);
          } else {
            failedCount++;
            const errorText = await deleteResponse.text();
            console.warn(`⚠️ Failed to delete task ${task.id}: ${deleteResponse.status} - ${errorText}`);
          }
        } catch (error) {
          failedCount++;
          console.error(`❌ Error deleting task ${task.id}:`, error);
        }
      }
      
      console.log(`🧹 Task deletion summary: ${deletedCount} deleted, ${failedCount} failed`);
      
      // Verify tasks are actually gone
      console.log(`🔍 Verifying tasks are cleared...`);
      const verifyResponse = await fetch(`${API_BASE}/tasks?squid=${squidId}`, {
        method: 'GET',
        headers
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log(`🔍 Verification: ${verifyData.tasks?.length || 0} tasks remaining`);
        if (verifyData.tasks && verifyData.tasks.length > 0) {
          console.warn(`⚠️ WARNING: ${verifyData.tasks.length} tasks still exist after deletion!`);
          console.log(`⚠️ Remaining tasks:`, JSON.stringify(verifyData.tasks, null, 2));
        }
      }
      
      if (failedCount > 0) {
        return { warning: `Deleted ${deletedCount} tasks, but ${failedCount} failed to delete` };
      }
    } else {
      console.log(`✅ No existing tasks found for squid ${squidId}`);
    }
    
    console.log(`✅ Successfully cleared all tasks for squid ${squidId}`);
    return { message: "Tasks cleared successfully" };
  } catch (error) {
    console.error('❌ Error clearing tasks:', error);
    return { warning: `Failed to clear tasks: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

async function updateSquidSettings(squidId: string, maxResults: number, headers: Record<string, string>) {
  console.log(`🔧 Setting squid ${squidId} max_results to EXACTLY ${maxResults}`);
  
  const settings = {
    params: {
      max_results: maxResults, // Use exact number user requested
      language: "English (United States)",
      functions: {
        collect_contacts: true,
        details: false,
        images: false
      }
    },
    export_unique_results: true // Enable unique results to avoid duplicates
  };
  
  console.log('📋 Squid settings payload:', JSON.stringify(settings, null, 2));
  
  // Critical: Use POST instead of PATCH to ensure settings are applied correctly
  const response = await fetch(`${API_BASE}/squids/${squidId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to update squid settings: ${response.status} - ${errorText}`);
    return { warning: `Failed to update settings: ${errorText}` };
  }

  const result = await response.json();
  console.log('✅ Squid settings updated successfully:', result);
  return result;
}

async function updateSquidSettingsWithPatch(squidId: string, maxResults: number, headers: Record<string, string>) {
  // Cap max_results at 200 for API (Lobstr limit), but keep full abort_limit for the run
  const apiMaxResults = Math.min(maxResults, 200);
  console.log(`🔧 POST: Setting squid ${squidId} max_results to ${apiMaxResults} (capped from ${maxResults})`);
  
  const settings = {
    params: {
      max_results: apiMaxResults, // Cap at 200 for API compliance
      language: "English (United States)",
      functions: {
        collect_contacts: true,
        details: false,
        images: false
      }
    },
    export_unique_results: true // Enable unique results to avoid duplicates
  };
  
  console.log('📋 POST Squid settings payload:', JSON.stringify(settings, null, 2));
  
  const response = await fetch(`${API_BASE}/squids/${squidId}`, {
    method: 'POST', // Changed from PATCH to POST
    headers,
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to POST squid settings: ${response.status} - ${errorText}`);
    return { warning: `Failed to update settings: ${errorText}` };
  }

  const result = await response.json();
  console.log('✅ POST Squid settings updated successfully:', result);
  
  // Verify the settings were applied
  const verifyResponse = await fetch(`${API_BASE}/squids/${squidId}`, {
    method: 'GET',
    headers
  });
  
  if (verifyResponse.ok) {
    const verifyData = await verifyResponse.json();
    console.log('🔍 Verification - Full squid data:', JSON.stringify(verifyData, null, 2));
    console.log('🔍 Verification - Current max_results:', verifyData.params?.max_results);
    console.log('🔍 Verification - export_unique_results:', verifyData.export_unique_results);
    if (verifyData.params?.max_results !== maxResults) {
      console.warn(`⚠️ Max results mismatch! Expected: ${maxResults}, Actual: ${verifyData.params?.max_results}`);
    }
    if (!verifyData.export_unique_results) {
      console.warn(`⚠️ export_unique_results not enabled! Current: ${verifyData.export_unique_results}`);
    }
  } else {
    console.error('❌ Failed to verify squid settings');
  }
  
  return result;
}

// Check if we should use parameter-based tasks instead of URL-based
async function shouldUseParameterBasedTasks(location: string): Promise<boolean> {
  // Always try parameter-based tasks first for better accuracy
  // Fall back to URL-based only if location parsing fails
  try {
    const locationData = await parseLocationForParameterTasks(location);
    return !!(locationData.city && locationData.country);
  } catch (error) {
    console.log('📍 Parameter-based tasks not possible, using URL-based fallback');
    return false;
  }
}

// Parse location string into components for parameter-based tasks
async function parseLocationForParameterTasks(location: string): Promise<{
  city: string;
  country: string;
  region?: string;
  district?: string;
}> {
  // Parse common location formats like "Bangkok, Thailand" or "New York, NY, USA"
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const city = parts[0];
    const country = parts[parts.length - 1];
    const region = parts.length >= 3 ? parts[1] : undefined;
    
    console.log(`📍 Parsed location: city="${city}", country="${country}", region="${region}"`);
    
    return {
      city: city,
      country: country,
      region: region,
      district: undefined
    };
  }
  
  throw new Error(`Cannot parse location: ${location}`);
}

function buildGoogleMapsUrl(query: string, location: string): string {
  // Build Google Maps search URL for the crawler with better location specificity
  // Parse location to handle "Bangkok, Thailand" format
  const locationParts = location.split(',').map(part => part.trim());
  let searchTerm;
  
  if (locationParts.length >= 2) {
    // If we have city and country (e.g., "Bangkok, Thailand")
    const city = locationParts[0];
    const country = locationParts[1];
    searchTerm = `${query} in ${city}, ${country}`;
  } else {
    // Single location (fallback)
    searchTerm = `${query} in ${location}`;
  }
  
  console.log(`🗺️ Building Google Maps URL for: "${searchTerm}"`);
  return `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
}

function calculateLeadScore(item: any): number {
  let score = 50; // Base score
  if (item.rating && parseFloat(item.rating) >= 4.0) score += 20;
  if (item.phone || item.phone_number) score += 15;
  if (item.website || item.url) score += 15;
  if (item.email) score += 10;
  if (item.reviews_count && parseInt(item.reviews_count) > 50) score += 10;
  return Math.min(score, 100);
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending': return 'Scraping task is queued and waiting to start';
    case 'running': return 'Scraping is in progress, collecting business data';
    case 'done': return 'Scraping completed successfully';
    case 'failed': return 'Scraping failed, please try again';
    case 'aborted': return 'Scraping was cancelled';
    default: return `Current status: ${status}`;
  }
}

// DEPRECATED: This function was causing hardcoded geographic expansion
// Now using simple location replication for consistent single-location searches
function generateGeographicSegments(baseLocation: string, searchCount: number): string[] {
  console.log(`🗺️ DEPRECATED: generateGeographicSegments called for: "${baseLocation}", count: ${searchCount}`);
  console.log(`🎯 USING CONSISTENT LOCATION APPROACH - No more automatic expansion`);
  
  // Return array of same location for all searches
  // This prevents the "6 tasks" hardcoding issue and geographic confusion
  return Array(searchCount).fill(baseLocation);
}