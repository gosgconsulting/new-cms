import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { workflowName, inputData, context } = await req.json()

    if (!workflowName) {
      return new Response(
        JSON.stringify({ error: 'Workflow name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map workflow to corresponding edge function
    const workflowFunctionMap = {
      'Keywords Research': 'keyword-research',
      'Topic Research': 'topic-research-webhook', 
      'Content Writing': 'content-writing-unified',
      'Content Writing Unified': 'content-writing-unified'
    }

    const functionName = workflowFunctionMap[workflowName]
    if (!functionName) {
      return new Response(
        JSON.stringify({ 
          error: `Workflow "${workflowName}" not supported`,
          supported_workflows: Object.keys(workflowFunctionMap)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Executing workflow "${workflowName}" via function: ${functionName}`)

    // For content-writing workflows, use asynchronous execution to bypass 60s timeout
    if (functionName === 'content-writing-workflow' || functionName === 'content-writing-unified') {
      // Generate a unique execution ID
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store execution status in database
      const { error: insertError } = await supabaseClient
        .from('workflow_executions')
        .insert([{
          id: executionId,
          workflow_id: null, // No longer needed since we don't store workflows
          user_id: user.id,
          status: 'processing',
          function_name: functionName,
          input_data: { ...inputData, workflowName },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (insertError) {
        console.error('Error storing execution status:', insertError)
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to initialize workflow execution'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Trigger the content-writing-workflow asynchronously (don't wait for response)
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inputData,
          workflowName,
          executionId // Pass execution ID for status updates
        })
      }).then(async (response) => {
        const result = await response.json().catch(() => ({ error: 'Failed to parse response' }))
        
        // Update execution status in database
        const status = response.ok && result.success ? 'completed' : 'failed'
        await supabaseClient
          .from('workflow_executions')
          .update({
            status,
            result: response.ok ? result : null,
            error: response.ok ? null : result.error || 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', executionId)
      }).catch(async (error) => {
        console.error(`Async workflow execution failed:`, error)
        // Update execution status as failed
        await supabaseClient
          .from('workflow_executions')
          .update({
            status: 'failed',
            error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', executionId)
      })

      // Return immediately with processing status
      return new Response(
        JSON.stringify({
          success: true,
          status: 'processing',
          execution_id: executionId,
          workflow_name: workflowName,
          function_used: functionName,
          message: 'Workflow started successfully. Use the execution_id to check status.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For other workflows, use synchronous execution
    try {
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inputData,
          workflowName
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          workflow_name: workflowName,
          function_used: functionName,
          result
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error(`Error executing workflow function ${functionName}:`, error)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'failed',
          workflow_name: workflowName,
          function_used: functionName,
          error: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Workflow execution error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

