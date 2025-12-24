// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Google Search Scraper Configuration
const API_BASE = "https://api.lobstr.io/v1";
const GOOGLE_SEARCH_SQUID_ID = "2dc14dc015c341d4bcd9264111988ee5";

const lobstrApiKey = Deno.env.get('LOBSTR_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GoogleSearchRequest {
  type: 'prepare_squid' | 'add_tasks' | 'launch_run' | 'get_status' | 'get_results' | 'save_incremental' | 'force_complete' | 'import_squid_runs';
  keywords?: string[];
  runId?: string;
  userId?: string;
  country?: string;
  language?: string;
  deviceType?: string;
  maxPages?: number;
  squidId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!lobstrApiKey) {
      throw new Error('Lobstr API key not configured');
    }

    const request: GoogleSearchRequest = await req.json();
    console.log('=== GOOGLE SEARCH SCRAPER REQUEST ===');
    console.log('Type:', request.type);
    console.log('Request data:', JSON.stringify(request, null, 2));

    const lobstrHeaders = {
      'Authorization': `Token ${lobstrApiKey}`,
      'Content-Type': 'application/json',
    };

    // STEP 1: PREPARE SQUID (Empty & Update)
    if (request.type === 'prepare_squid') {
      console.log('=== STEP 1: PREPARE GOOGLE SEARCH SQUID ===');
      
      if (!request.keywords || request.keywords.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Keywords are required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const debugData = {
          squidId: GOOGLE_SEARCH_SQUID_ID,
          requestParams: {
            keywords: request.keywords,
            country: request.country || 'United States',
            language: request.language || 'English',
            deviceType: request.deviceType || 'Desktop'
          },
          steps: []
        };

        // Step 1a: Empty existing squid tasks
        console.log('🧹 Emptying existing Google Search squid tasks...');
        const emptyResult = await emptySquidTasks(GOOGLE_SEARCH_SQUID_ID, lobstrHeaders);
        console.log('✅ Tasks cleared');
        debugData.steps.push({
          step: '1a_empty_tasks',
          status: 'completed',
          result: emptyResult,
          timestamp: new Date().toISOString()
        });

        // Step 1b: Update squid settings
        console.log('⚙️ Updating squid settings...');
        const settingsResult = await updateSquidSettings(
          GOOGLE_SEARCH_SQUID_ID, 
          request.country || 'United States', 
          request.language || 'English', 
          request.deviceType || 'Desktop',
          request.maxPages || 3, // Default to 3 pages max
          lobstrHeaders
        );
        console.log(`✅ Settings updated`);
        debugData.steps.push({
          step: '1b_update_settings',
          status: 'completed',
          result: settingsResult,
          timestamp: new Date().toISOString()
        });

        return new Response(JSON.stringify({
          success: true,
          squidId: GOOGLE_SEARCH_SQUID_ID,
          message: 'Google Search squid prepared successfully',
          debugData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Prepare squid failed:', error);
        
        const errorDebugData = {
          squidId: GOOGLE_SEARCH_SQUID_ID,
          error: error.message,
          requestParams: {
            keywords: request.keywords,
            country: request.country || 'United States',
            language: request.language || 'English',
            deviceType: request.deviceType || 'Desktop'
          },
          timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          debugData: errorDebugData
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 2: ADD TASKS
    if (request.type === 'add_tasks') {
      console.log('=== STEP 2: ADD GOOGLE SEARCH TASKS ===');
      
      if (!request.keywords || !request.userId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Keywords and userId are required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const searchSessionId = crypto.randomUUID();
        
        // Create run record in database
        const { data: runRecord, error: dbError } = await supabase
          .from('lobstr_runs')
          .upsert({
            squid_id: GOOGLE_SEARCH_SQUID_ID,
            query: request.keywords.join(', '),
            location: '',
            max_results: 0,
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
          throw new Error(`Database error: ${dbError.message}`);
        }

        // Create tasks for each keyword - using keyword parameter instead of URL
        console.log('📝 Creating keyword-based tasks for Google Search...');
        const tasks = request.keywords.map(keyword => ({
          keyword: keyword
        }));

        console.log('📝 Tasks to be added:', JSON.stringify(tasks, null, 2));

        console.log('📝 Adding tasks to Google Search squid...');
        const tasksResponse = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: lobstrHeaders,
          body: JSON.stringify({
            tasks,
            squid: GOOGLE_SEARCH_SQUID_ID
          })
        });

        if (!tasksResponse.ok) {
          const errorText = await tasksResponse.text();
          throw new Error(`Failed to add tasks: ${tasksResponse.status} - ${errorText}`);
        }

        const tasksData = await tasksResponse.json();
        console.log('✅ Tasks added successfully');

        return new Response(JSON.stringify({
          success: true,
          message: 'Tasks added successfully',
          debugData: { tasks, tasksResponse: tasksData, runRecord }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Add tasks failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          debugData: { step: 'add_tasks', error: error.message }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 3: LAUNCH RUN
    if (request.type === 'launch_run') {
      console.log('=== STEP 3: LAUNCH GOOGLE SEARCH RUN ===');
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const { data: runRecord } = await supabase
          .from('lobstr_runs')
          .select('*')
          .eq('id', request.runId)
          .single();

        if (!runRecord) {
          throw new Error('Run record not found');
        }

        console.log('🚀 Launching Google Search run...');
        const launchResponse = await fetch(`${API_BASE}/runs`, {
          method: 'POST',
          headers: lobstrHeaders,
          body: JSON.stringify({
            squid: GOOGLE_SEARCH_SQUID_ID
          })
        });

        if (!launchResponse.ok) {
          const errorText = await launchResponse.text();
          throw new Error(`Failed to launch run: ${launchResponse.status} - ${errorText}`);
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

        return new Response(JSON.stringify({
          success: true,
          lobstrRunId: runResult.id,
          message: 'Google Search run launched successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Launch run failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          debugData: { step: 'launch_run', error: error.message }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 4: GET RESULTS
    if (request.type === 'get_results') {
      console.log('=== STEP 4: GET GOOGLE SEARCH RESULTS ===');
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Get run record
        const { data: runRecord } = await supabase
          .from('lobstr_runs')
          .select('*')
          .eq('run_id', request.runId)
          .single();

        if (!runRecord) {
          throw new Error('Run record not found');
        }

        // Check run status
        console.log(`🔍 Checking run status for runId: ${request.runId}`);
        const statusResponse = await fetch(`${API_BASE}/runs/${request.runId}`, {
          headers: lobstrHeaders,
        });

        console.log(`📊 Status response: ${statusResponse.status}`);
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error(`❌ Status check failed: ${statusResponse.status} - ${errorText}`);
          
          // Return detailed error information
          return new Response(JSON.stringify({
            success: false,
            error: `Status check failed: ${statusResponse.status}`,
            errorDetails: errorText,
            debugData: { 
              runId: request.runId,
              statusCode: statusResponse.status,
              errorText
            }
          }), {
            status: statusResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const statusData = await statusResponse.json();
        console.log('📈 Full status data:', JSON.stringify(statusData, null, 2));

        if (statusData.status === 'pending' || statusData.status === 'running') {
          // Check if run has been stuck for too long (more than 10 minutes)
          const startedAt = new Date(runRecord.started_at);
          const now = new Date();
          const runTimeMinutes = (now.getTime() - startedAt.getTime()) / (1000 * 60);
          
          console.log(`⏱️ Run time: ${runTimeMinutes.toFixed(1)} minutes`);
          
          if (runTimeMinutes > 10) {
            console.log('⚠️ Run has been running for more than 10 minutes, forcing results check...');
            
            // Try to get results anyway in case there are partial results
            // FIX: Use only run parameter (not squid + run)
            try {
              const resultsResponse = await fetch(`${API_BASE}/results?run=${request.runId}`, {
                headers: lobstrHeaders,
              });
              
              if (resultsResponse.ok) {
                const resultsData = await resultsResponse.json();
                console.log('🔍 Forced results check - found results:', resultsData.data?.length || 0);
                
                if (resultsData.data && resultsData.data.length > 0) {
                  const { savedCount } = await saveGoogleSearchResults(resultsData.data, runRecord);
                  
                  await supabase
                    .from('lobstr_runs')
                    .update({ 
                      status: 'completed',
                      completed_at: new Date().toISOString(),
                      unique_results_saved: savedCount
                    })
                    .eq('id', runRecord.id);

                  return new Response(JSON.stringify({
                    success: true,
                    runStatus: 'forced_completion',
                    totalResultsFromLobstr: resultsData.data.length,
                    newLeadsSaved: savedCount,
                    totalLeadsSaved: savedCount,
                    message: `Google Search scraping completed after timeout. Saved ${savedCount} results.`,
                    debugData: {
                      forcedCompletion: true,
                      runTimeMinutes: runTimeMinutes.toFixed(1)
                    }
                  }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                  });
                } else {
                  // Mark as failed if no results after timeout
                  await supabase
                    .from('lobstr_runs')
                    .update({ 
                      status: 'failed',
                      completed_at: new Date().toISOString(),
                      error_message: 'Run timed out with no results'
                    })
                    .eq('id', runRecord.id);
                    
                  return new Response(JSON.stringify({
                    success: false,
                    error: 'Run timed out with no results',
                    debugData: { 
                      runTimeMinutes: runTimeMinutes.toFixed(1),
                      timeout: true
                    }
                  }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                  });
                }
              }
            } catch (forceError) {
              console.error('❌ Force results check failed:', forceError);
            }
          }
          
          return new Response(JSON.stringify({
            success: false,
            status: 'pending',
            message: 'Google Search scraping is still in progress...',
            debugData: { 
              runStatus: statusData.status,
              runTimeMinutes: runTimeMinutes.toFixed(1),
              willTimeout: runTimeMinutes > 8 ? 'Soon - will force completion in 2 minutes' : 'No',
              statusDetails: statusData
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (statusData.status === 'done' || statusData.status === 'uploading') {
          // FIX: Get results from Lobstr API - using only run ID as per API docs
          console.log(`🔍 Fetching results from: ${API_BASE}/results?run=${request.runId}`);
          const resultsResponse = await fetch(`${API_BASE}/results?run=${request.runId}`, {
            headers: lobstrHeaders,
          });

          console.log(`📊 Results response status: ${resultsResponse.status}`);
          
          // Handle rate limiting (429) and other errors
          if (!resultsResponse.ok) {
            const errorText = await resultsResponse.text();
            
            if (resultsResponse.status === 429) {
              // Rate limit exceeded - get retry-after header
              const retryAfter = resultsResponse.headers.get('Retry-After') || '30';
              console.error(`⏱️ Rate limit exceeded. Retry after: ${retryAfter} seconds`);
              
              return new Response(JSON.stringify({
                success: false,
                status: 'rate_limited',
                message: `Rate limit exceeded. Please retry in ${retryAfter} seconds.`,
                retryAfter: parseInt(retryAfter),
                debugData: { 
                  runStatus: statusData.status,
                  rateLimitError: true,
                  retryAfter
                }
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
            
            console.error(`❌ Results fetch failed: ${resultsResponse.status} - ${errorText}`);
            return new Response(JSON.stringify({
              success: false,
              error: `Failed to get results: ${resultsResponse.status}`,
              errorDetails: errorText,
              debugData: { 
                runStatus: statusData.status,
                resultsApiError: true,
                statusCode: resultsResponse.status
              }
            }), {
              status: resultsResponse.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          const resultsData = await resultsResponse.json();
          console.log('📈 Full results data structure:', JSON.stringify({
            totalResults: resultsData.data?.length || 0,
            hasData: !!resultsData.data,
            dataType: typeof resultsData.data,
            isArray: Array.isArray(resultsData.data),
            sampleResult: resultsData.data?.[0] ? Object.keys(resultsData.data[0]) : 'No results'
          }, null, 2));

          // Save results to database
          if (resultsData.data && resultsData.data.length > 0) {
            const { savedCount, errorCount, errors } = await saveGoogleSearchResults(resultsData.data, runRecord);
            
            // Update run record
            await supabase
              .from('lobstr_runs')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString(),
                unique_results_saved: savedCount
              })
              .eq('id', runRecord.id);

            return new Response(JSON.stringify({
              success: true,
              runStatus: 'done',
              totalResultsFromLobstr: resultsData.data.length,
              newLeadsSaved: savedCount,
              totalLeadsSaved: savedCount,
              keywords: runRecord.query?.split(', ') || [],
              message: `Google Search scraping completed. Saved ${savedCount} results.`,
              debugData: {
                savedCount,
                errorCount,
                errors: errors.slice(0, 3), // Show first 3 errors for debugging
                saveSuccessRate: `${((savedCount / resultsData.data.length) * 100).toFixed(1)}%`,
                totalResultsFromLobstr: resultsData.data.length,
                runStatus: statusData.status,
                sample: resultsData.data.slice(0, 3)
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        return new Response(JSON.stringify({
          success: false,
          error: 'No results available or run failed',
          debugData: { runStatus: statusData.status }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Get results failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          debugData: { step: 'get_results', error: error.message }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 5: FORCE COMPLETE - Force completion of a stuck run
    if (request.type === 'force_complete') {
      console.log('=== STEP 5: FORCE COMPLETE STUCK RUN ===');
      
      if (!request.runId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Run ID is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Get run record
        const { data: runRecord } = await supabase
          .from('lobstr_runs')
          .select('*')
          .eq('run_id', request.runId)
          .single();

        if (!runRecord) {
          throw new Error('Run record not found');
        }

        console.log('🔧 Force completing run that has been stuck...');
        
        // Try to get results anyway in case there are partial results - using only run ID
        const resultsResponse = await fetch(`${API_BASE}/results?run=${request.runId}`, {
          headers: lobstrHeaders,
        });
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          console.log('🔍 Force complete results check - found results:', resultsData.data?.length || 0);
          
          if (resultsData.data && resultsData.data.length > 0) {
            const { savedCount } = await saveGoogleSearchResults(resultsData.data, runRecord);
            
            await supabase
              .from('lobstr_runs')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString(),
                unique_results_saved: savedCount
              })
              .eq('id', runRecord.id);

            return new Response(JSON.stringify({
              success: true,
              runStatus: 'force_completed',
              totalResultsFromLobstr: resultsData.data.length,
              newLeadsSaved: savedCount,
              totalLeadsSaved: savedCount,
              message: `Google Search run force completed. Saved ${savedCount} results.`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } else {
            // Mark as failed if no results
            await supabase
              .from('lobstr_runs')
              .update({ 
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: 'Run force completed but no results available'
              })
              .eq('id', runRecord.id);

            return new Response(JSON.stringify({
              success: false,
              error: 'No results available from force completion',
              message: 'Run marked as failed - no data to save'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } else {
          throw new Error('Unable to fetch results for force completion');
        }

      } catch (error) {
        console.error('❌ Force complete failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          debugData: { step: 'force_complete', error: error.message }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // STEP 6: IMPORT SQUID RUNS - Manual import feature for debugging
    if (request.type === 'import_squid_runs') {
      console.log('=== STEP 6: IMPORT SQUID RUNS ===');
      
      if (!request.squidId || !request.userId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Squid ID and User ID are required',
          debugData: { request }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        console.log(`🔍 Importing all runs for squid: ${request.squidId}`);
        
        // Get all runs for this squid
        const runsResponse = await fetch(`${API_BASE}/runs?squid=${request.squidId}`, {
          headers: lobstrHeaders,
        });

        if (!runsResponse.ok) {
          const errorText = await runsResponse.text();
          throw new Error(`Failed to get runs: ${runsResponse.status} - ${errorText}`);
        }

        const runsData = await runsResponse.json();
        console.log(`📊 Found ${runsData.data?.length || 0} runs for squid`);

        let totalImported = 0;
        let skippedCount = 0;
        const importedRuns = [];

        // Process each completed run
        for (const run of runsData.data || []) {
          if (run.status !== 'done') {
            console.log(`⏭️ Skipping run ${run.id} - status: ${run.status}`);
            skippedCount++;
            continue;
          }

          try {
            console.log(`📥 Importing run ${run.id} (status: ${run.status})`);
            
            // Get results for this run
            const resultsResponse = await fetch(`${API_BASE}/results?run=${run.id}`, {
              headers: lobstrHeaders,
            });

            if (!resultsResponse.ok) {
              console.error(`❌ Failed to get results for run ${run.id}: ${resultsResponse.status}`);
              continue;
            }

            const resultsData = await resultsResponse.json();
            
            if (!resultsData.data || resultsData.data.length === 0) {
              console.log(`📭 No results for run ${run.id}`);
              continue;
            }

            // Create a mock run record for the import
            const mockRunRecord = {
              id: run.id,
              user_id: request.userId,
              search_session_id: `imported-${run.id}`,
              query: 'Imported from Squid'
            };

            // Save results using existing function
            const { savedCount } = await saveGoogleSearchResults(resultsData.data, mockRunRecord);
            
            importedRuns.push({
              runId: run.id,
              status: run.status,
              resultsCount: resultsData.data.length,
              savedCount,
              createdAt: run.created_at
            });

            totalImported += savedCount;
            console.log(`✅ Imported ${savedCount} results from run ${run.id}`);
            
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (runError) {
            console.error(`❌ Error importing run ${run.id}:`, runError);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Manual import completed. Imported ${totalImported} results from ${importedRuns.length} runs.`,
          totalImported,
          runsProcessed: importedRuns.length,
          skippedRuns: skippedCount,
          importedRuns,
          debugData: {
            squidId: request.squidId,
            totalRunsFound: runsData.data?.length || 0,
            completedRuns: importedRuns.length,
            totalImported
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('❌ Import squid runs failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          debugData: { step: 'import_squid_runs', error: error.message }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid request type'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Google Search Scraper Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper Functions
async function emptySquidTasks(squidId: string, headers: Record<string, string>) {
  console.log(`🧹 Calling empty endpoint: ${API_BASE}/squids/${squidId}/empty`);
  
  const response = await fetch(`${API_BASE}/squids/${squidId}/empty`, {
    method: 'POST',
    headers
  });
  
  console.log(`📊 Empty response status: ${response.status}`);
  console.log(`📊 Empty response headers:`, Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Empty endpoint failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to empty squid: ${response.status} - ${errorText}`);
  }
  
  // Check if response has content before parsing JSON
  const responseText = await response.text();
  console.log(`📊 Empty response text: "${responseText}"`);
  
  if (!responseText || responseText.trim() === '') {
    console.log('✅ Empty endpoint returned empty response - this is expected');
    return { success: true, message: 'Squid emptied successfully' };
  }
  
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error(`❌ Failed to parse JSON response: "${responseText}"`);
    throw new Error(`Invalid JSON response from empty endpoint: ${parseError.message}`);
  }
}

async function updateSquidSettings(squidId: string, country: string, language: string, deviceType: string, maxPages: number, headers: Record<string, string>) {
  console.log(`⚙️ Updating Google Search squid settings with max ${maxPages} pages...`);
  
  const settingsPayload = {
    name: "Google Search Export",
    no_line_breaks: true,
    params: {
      country: country,
      language: language,
      mobile_results: deviceType === 'Mobile' ? true : false,
      max_pages: maxPages
    },
    to_complete: false,
    export_unique_results: true
  };
  
  console.log('🔧 Settings payload:', JSON.stringify(settingsPayload, null, 2));
  
  const response = await fetch(`${API_BASE}/squids/${squidId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(settingsPayload)
  });
  
  console.log(`📊 Settings response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Settings update failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to update squid settings: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  console.log('✅ Settings updated successfully');
  return result;
}

async function saveGoogleSearchResults(results: any[], runRecord: any): Promise<{ savedCount: number, errorCount: number, errors: any[] }> {
  console.log('💾 Saving Google Search results to database...');
  console.log(`📊 Processing ${results.length} results from Lobstr API`);
  
  let savedCount = 0;
  let errorCount = 0;
  const errors = [];
  const batchSize = 10;
  
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(results.length/batchSize)}`);
    
    const searchResults = batch.map((result, index) => {
      console.log(`🔍 Processing result ${i + index + 1}: ${result.title || 'No title'}`);
      
      return {
        lobstr_run_id: runRecord.run_id || runRecord.id,
        user_id: runRecord.user_id,
        search_session_id: runRecord.search_session_id,
        search_keyword: runRecord.query,
        title: result.title || 'No title',
        description: result.description || result.snippet || '',
        url: result.url || result.link || '',
        displayed_url: result.displayed_url || result.display_link || result.url || result.link || '',
        domain: extractDomainFromUrl(result.url || result.link || ''),
        position: result.position || result.rank || (i + index + 1),
        page_number: result.page || Math.ceil((i + index + 1) / 10),
        result_type: result.is_organic === false ? 'paid' : 'organic',
        snippet: result.description || result.snippet || '',
        snippet_segments: result.snippet_segments || null,
        emphasized_keywords: Array.isArray(result.emphasized_keywords) ? result.emphasized_keywords.join(', ') : (result.emphasized_keywords || ''),
        answer: result.answer || null,
        question: result.question || null,
        date_published: result.date ? new Date(result.date).toISOString() : null,
        is_organic: result.is_organic !== false,
        is_paid: result.is_paid === true,
        is_question_answer: result.is_question_answer === true,
        is_related_query: result.is_related_query === true,
        total_results: result.total_results?.toString() || '0',
        processing_status: 'completed',
        scraped_sequence: i + index + 1,
        scraped_at: new Date().toISOString()
      };
    });

    try {
      console.log(`💾 Attempting to save batch with ${searchResults.length} records...`);
      
      const { data, error } = await supabase
        .from('google_search_results')
        .upsert(searchResults, { 
          onConflict: 'user_id,url,search_keyword',
          ignoreDuplicates: true // Allow saving regardless of duplicates
        })
        .select('id');

      if (error) {
        console.error('❌ DATABASE ERROR - Failed to save batch:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        console.error('❌ Sample data that failed:', JSON.stringify(searchResults[0], null, 2));
        errorCount += batch.length;
        errors.push({ batch: Math.floor(i/batchSize) + 1, error: error.message, details: error });
      } else {
        const actualSaved = data?.length || 0;
        savedCount += actualSaved;
        console.log(`✅ Successfully saved batch: ${actualSaved}/${searchResults.length} records`);
        
        if (actualSaved !== searchResults.length) {
          console.warn(`⚠️ Batch size mismatch: attempted ${searchResults.length}, saved ${actualSaved}`);
        }
      }
    } catch (error) {
      console.error('❌ EXCEPTION during batch save:', error);
      console.error('❌ Exception details:', JSON.stringify(error, null, 2));
      errorCount += batch.length;
      errors.push({ batch: Math.floor(i/batchSize) + 1, error: error.message, exception: true });
    }
  }
  
  console.log(`💾 SAVE SUMMARY:`);
  console.log(`✅ Total results processed: ${results.length}`);
  console.log(`✅ Total results saved: ${savedCount}`);
  console.log(`❌ Total errors: ${errorCount}`);
  console.log(`📊 Save success rate: ${((savedCount / results.length) * 100).toFixed(1)}%`);
  
  return { savedCount, errorCount, errors };
}

function extractDomainFromUrl(url: string): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function calculateSearchLeadScore(result: any): number {
  let score = 50; // Base score
  
  // Higher score for organic results
  if (result.is_organic !== false) score += 10;
  
  // Bonus for having structured data
  if (result.answer) score += 15;
  if (result.question) score += 10;
  if (result.date) score += 5;
  
  // Position bonus (higher positions get more points)
  const position = result.page || 1;
  if (position <= 3) score += 20;
  else if (position <= 10) score += 10;
  else if (position <= 20) score += 5;
  
  // Check for business indicators in title/description
  const text = `${result.title} ${result.description}`.toLowerCase();
  const businessKeywords = ['company', 'business', 'service', 'contact', 'about', 'store', 'shop'];
  const keywordMatches = businessKeywords.filter(keyword => text.includes(keyword)).length;
  score += keywordMatches * 3;
  
  return Math.min(score, 100);
}

function calculateRelevanceScore(result: any): number {
  let score = 50;
  
  // Bonus for structured data
  if (result.emphasized_keywords) score += 15;
  if (result.snippet_segments?.length > 0) score += 10;
  
  // Check title relevance
  if (result.title && result.title.length > 10) score += 10;
  
  // Check description quality
  if (result.description && result.description.length > 50) score += 15;
  
  return Math.min(score, 100);
}