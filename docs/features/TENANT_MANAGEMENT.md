# Tenant Management System

This document describes the tenant management system implemented in the CMS.

## Overview

The tenant management system allows the CMS to support multiple tenants (clients/websites) using the same codebase but with isolated data. Each tenant has its own:

- Database connection
- API keys
- Configuration settings

## Database Structure

The tenant management system uses the following database tables:

### `tenants`

Stores basic information about each tenant.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| name | VARCHAR(255) | Tenant name |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| database_url | TEXT | Database connection URL |
| api_key | VARCHAR(255) | Main API key |

### `tenant_databases`

Stores database connection details for each tenant.

| Column | Type | Description |
|--------|------|-------------|
| tenant_id | VARCHAR(255) | Foreign key to tenants.id |
| host | VARCHAR(255) | Database host |
| port | INTEGER | Database port |
| database_name | VARCHAR(255) | Database name |
| username | VARCHAR(255) | Database username |
| password | VARCHAR(255) | Database password |
| ssl | BOOLEAN | Whether to use SSL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### `tenant_api_keys`

Stores API keys for each tenant.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| tenant_id | VARCHAR(255) | Foreign key to tenants.id |
| api_key | VARCHAR(255) | API key |
| description | VARCHAR(255) | Key description |
| expires_at | TIMESTAMP | Expiration timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Scripts

The following scripts are available for managing tenants:

### `migrate-tenant-data.js`

Creates the tenant database tables and migrates data to a new tenant called "GO SG CONSULTING".

Usage:
```
node migrate-tenant-data.js
```

Or use the batch/PowerShell scripts:
```
migrate-tenant.bat
```
```
.\migrate-tenant.ps1
```

### `check-tenants.js`

Displays information about all tenants in the database.

Usage:
```
node check-tenants.js
```

Or use the batch/PowerShell scripts:
```
check-tenants.bat
```
```
.\check-tenants.ps1
```

## API Routes

The following API routes are available for tenant management:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tenants | Get all tenants |
| GET | /api/tenants/:id | Get tenant by ID |
| POST | /api/tenants | Create a new tenant |
| PUT | /api/tenants/:id | Update an existing tenant |
| DELETE | /api/tenants/:id | Delete a tenant |
| GET | /api/tenants/:id/database | Get database details for a tenant |
| POST | /api/tenants/:id/database | Set database details for a tenant |
| GET | /api/tenants/:id/api-keys | Get API keys for a tenant |
| POST | /api/tenants/:id/api-keys | Generate API key for a tenant |
| DELETE | /api/tenants/:id/api-keys/:keyId | Delete an API key |
| POST | /api/tenants/validate-api-key | Validate an API key |

## UI Components

The tenant management system includes the following UI components:

- `TenantsManager`: Main component for managing tenants
- Tenant switcher in the sidebar
- Tenant indicator in the top bar

## Usage

1. Create a new tenant using the TenantsManager component
2. Configure the database connection for the tenant
3. Generate API keys for the tenant
4. Switch between tenants using the tenant switcher in the sidebar
