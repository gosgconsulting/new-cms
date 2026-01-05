# Tenant Integrations

## Overview
The Tenant Integrations feature provides a framework for managing third-party service integrations on a per-tenant basis. It allows each tenant to configure their own API keys, service connections, and integration settings while maintaining data isolation.

## Status
🔄 **Partially Implemented** - Core tenant system exists, integration framework expanding

## Key Components
- **TenantsManager Component**: Tenant management UI (`sparti-cms/components/admin/TenantsManager.tsx`)
- **Tenant API**: Tenant management API (`server/routes/tenants-api.js`)
- **Integration Settings**: Per-tenant integration configuration
- **API Key Management**: Tenant-specific API keys

## Database Tables
- `tenants` - Tenant information and configuration
- `tenant_api_keys` - Tenant API key storage
- `tenant_integrations` - Integration configurations (planned)

## Implementation Details
- Multi-tenant architecture
- Tenant-specific database connections (optional)
- API key generation and management per tenant
- Integration settings per tenant
- Tenant data isolation
- Tenant-specific configuration
- Integration service connections

## Related Documentation
- `docs/features/TENANT_MANAGEMENT.md` - Core tenant management
- Integration-specific docs: SMTP Config, Resend, AI Assistant
