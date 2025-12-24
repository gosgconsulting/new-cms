# N8N Token Usage Tracking Guide

This guide shows how to integrate token usage tracking into your N8N workflows.

## 🔗 **API Endpoint**

```
POST https://your-project.supabase.co/functions/v1/n8n-token-tracker
```

## 📋 **Required Headers**

### **Option 1: Service Role Key (Recommended for N8N)**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"
}
```

### **Option 2: Anon Key (For frontend use)**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"
}
```

> **Note**: For N8N workflows, use the **Service Role Key** as it has elevated permissions needed for token deduction.

## 📊 **Request Body Format**

### **Required Fields**
- `user_id` (string): The user's UUID
- `service_name` (string): Name of the service (e.g., "n8n_ai_call", "openai", "claude")
- `cost_usd` (number): Cost in USD (will be deducted as tokens)

### **Optional Fields**
- `model_name` (string): AI model used (e.g., "gpt-4o", "claude-3.5-sonnet")
- `prompt_tokens` (number): Number of input tokens
- `completion_tokens` (number): Number of output tokens
- `total_tokens` (number): Total tokens used
- `request_data` (object): Additional metadata

## 📝 **Sample Request Bodies**

### **Basic Usage**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "service_name": "n8n_ai_call",
  "cost_usd": 0.05
}
```

### **Detailed Usage with Token Counts**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "service_name": "openai",
  "model_name": "gpt-4o",
  "cost_usd": 0.12,
  "prompt_tokens": 150,
  "completion_tokens": 75,
  "total_tokens": 225,
  "request_data": {
    "workflow_id": "workflow_123",
    "node_id": "ai_call_node",
    "prompt_length": 500,
    "response_length": 300
  }
}
```

### **Claude API Usage**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "service_name": "claude",
  "model_name": "claude-3.5-sonnet",
  "cost_usd": 0.08,
  "prompt_tokens": 200,
  "completion_tokens": 100,
  "total_tokens": 300,
  "request_data": {
    "workflow_id": "claude_workflow",
    "node_id": "claude_node",
    "max_tokens": 1000,
    "temperature": 0.7
  }
}
```

## ✅ **Success Response**

```json
{
  "success": true,
  "usage_id": "usage_123456",
  "tokens_deducted": 0.12,
  "previous_balance": 15.50,
  "new_balance": 15.38,
  "message": "Token usage recorded successfully"
}
```

## ❌ **Error Responses**

### **Missing Required Fields**
```json
{
  "success": false,
  "error": "Missing required fields: user_id, service_name, cost_usd"
}
```

### **Insufficient Tokens**
```json
{
  "success": false,
  "error": "Insufficient tokens",
  "current_balance": 0.05,
  "tokens_needed": 0.12
}
```

### **Database Error**
```json
{
  "success": false,
  "error": "Failed to record token usage",
  "details": "Database connection error"
}
```

## 🧪 **Testing with cURL**

### **Using Service Role Key (Recommended)**
```bash
curl -L -X POST 'https://your-project.supabase.co/functions/v1/n8n-token-tracker' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  --data '{
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "service_name": "n8n_ai_call",
    "cost_usd": 0.05
  }'
```

### **Using Anon Key**
```bash
curl -L -X POST 'https://your-project.supabase.co/functions/v1/n8n-token-tracker' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  --data '{
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "service_name": "n8n_ai_call",
    "cost_usd": 0.05
  }'
```

## 🔧 **N8N Workflow Examples**

### **Pattern 1: Pre-Check + AI Call + Record Usage**

```json
{
  "nodes": [
    {
      "name": "Check Token Balance",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-project.supabase.co/functions/v1/n8n-token-tracker",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"
        },
        "body": {
          "user_id": "{{ $json.user_id }}",
          "service_name": "n8n_ai_call",
          "cost_usd": 0.05,
          "request_data": {
            "workflow_id": "{{ $workflow.id }}",
            "node_id": "ai_call_node",
            "check_only": true
          }
        }
      }
    },
    {
      "name": "AI Call",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "resource": "chat",
        "model": "gpt-3.5-turbo",
        "messages": "{{ $json.messages }}"
      }
    },
    {
      "name": "Record Token Usage",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-project.supabase.co/functions/v1/n8n-token-tracker",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"
        },
        "body": {
          "user_id": "{{ $json.user_id }}",
          "service_name": "openai",
          "model_name": "gpt-3.5-turbo",
          "cost_usd": "{{ $json.usage.total_cost }}",
          "prompt_tokens": "{{ $json.usage.prompt_tokens }}",
          "completion_tokens": "{{ $json.usage.completion_tokens }}",
          "total_tokens": "{{ $json.usage.total_tokens }}",
          "request_data": {
            "workflow_id": "{{ $workflow.id }}",
            "node_id": "ai_call_node",
            "timestamp": "{{ new Date().toISOString() }}"
          }
        }
      }
    }
  ]
}
```

### **Pattern 2: Error Handling**

```json
{
  "nodes": [
    {
      "name": "Record Token Usage",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-project.supabase.co/functions/v1/n8n-token-tracker",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"
        },
        "body": {
          "user_id": "{{ $json.user_id }}",
          "service_name": "claude",
          "model_name": "claude-3.5-sonnet",
          "cost_usd": "{{ $json.cost_usd }}",
          "request_data": {
            "workflow_id": "{{ $workflow.id }}",
            "node_id": "claude_node",
            "success": "{{ $json.success }}",
            "error": "{{ $json.error }}"
          }
        }
      }
    },
    {
      "name": "Handle Response",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "{{ $json.success }}",
              "operation": "equal",
              "value2": "true"
            }
          ]
        }
      }
    }
  ]
}
```

## 💡 **Best Practices**

1. **Always check response**: Verify `success: true` before proceeding
2. **Handle errors gracefully**: Check for insufficient tokens
3. **Include metadata**: Add workflow and node information for debugging
4. **Use consistent service names**: Group similar operations together
5. **Record even failed calls**: Track usage even when AI calls fail

## 🔍 **Monitoring & Debugging**

- Check Supabase logs for detailed error messages
- Use `request_data` to include debugging information
- Monitor token balance before expensive operations
- Set up alerts for low token balances

## 📈 **Cost Calculation Examples**

### **OpenAI GPT-4o**
- Input: $0.005 per 1K tokens
- Output: $0.015 per 1K tokens
- Example: 1K input + 500 output = $0.0125

### **Claude 3.5 Sonnet**
- Input: $0.003 per 1K tokens  
- Output: $0.015 per 1K tokens
- Example: 1K input + 500 output = $0.0105

### **GPT-3.5 Turbo**
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- Example: 1K input + 500 output = $0.00125