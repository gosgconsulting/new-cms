### n8n API quick reference for Sparti

This document summarizes the n8n public REST API calls we use to programmatically create, activate, and trigger workflows. See the official docs for full details: [n8n API docs](https://docs.n8n.io/api/).

#### Base configuration
- Base URL: your instance URL, for example `https://primary-production-4549.up.railway.app`
- Auth: Bearer token in `Authorization` header

#### Core endpoints we use
- Create workflow
  - POST `/api/v1/workflows`
- Update workflow
  - PATCH `/api/v1/workflows/{id}`
- Activate/deactivate workflow
  - PATCH `/api/v1/workflows/{id}/activate` (body: `{ "active": true }`)
- Run workflow (production execution)
  - POST `/api/v1/executions` (body includes `workflowId` and `payload`)
- List executions
  - GET `/api/v1/executions?workflowId={id}`

#### Headers (all requests)
```
Authorization: Bearer <N8N_API_KEY>
Content-Type: application/json
```

#### Supabase ingestion endpoint
- `https://fkemumodynkaeojrrkbj.functions.supabase.co/ingest-google-search`
- Required header: `X-Ingest-Secret: <INGEST_SECRET>` (managed in Supabase secrets)

#### Minimal workflow JSON shape
```
{
  "name": "Google Search Scraper (Apify)",
  "active": false,
  "nodes": [
    { "parameters": { "path": "google-search-apify-submit", "options": {} },
      "id": "Webhook",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    { "parameters": {
        "url": "https://fkemumodynkaeojrrkbj.functions.supabase.co/ingest-google-search",
        "options": { "responseFormat": "json" },
        "jsonParameters": true,
        "sendBody": true,
        "headerParametersUi": { "parameter": [
          { "name": "X-Ingest-Secret", "value": "REPLACE_WITH_INGEST_SECRET" },
          { "name": "Content-Type", "value": "application/json" }
        ]}
      },
      "name": "Ingest",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [540, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [[ { "node": "Ingest", "type": "main", "index": 0 } ]] }
  }
}
```

#### Example curl (PowerShell-safe)
```
# Variables
$BASE="https://primary-production-4549.up.railway.app"
$TOKEN="<N8N_API_KEY>"
$INGEST="<INGEST_SECRET>"

# Create (replace secret inline)
$body = Get-Content -Raw ./scripts/n8n/workflows/google-search-apify.json | %% { $_ -replace "REPLACE_WITH_INGEST_SECRET", $INGEST }
curl.exe -s -X POST "$BASE/api/v1/workflows" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @- <<< $body

# Activate
curl.exe -s -X PATCH "$BASE/api/v1/workflows/<ID>/activate" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data '{"active": true}'

# Trigger (production execution)
curl.exe -s -X POST "$BASE/api/v1/executions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data '{"workflowId":"<ID>","payload":{"keywords":["test"],"country":"US","language":"en","deviceType":"Desktop","maxPages":2}}'
```




