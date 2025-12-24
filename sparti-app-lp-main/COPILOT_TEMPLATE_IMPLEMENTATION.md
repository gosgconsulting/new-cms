# Copilot Template System Implementation

## Overview

This implementation creates a flexible template system that allows duplication of the SEO copilot functionality for creating new copilot types (like SEM campaigns) while maintaining the same core workflow infrastructure.

## Architecture

### Database Schema

#### Core Template Tables
- `copilot_templates` - Template definitions for different copilot types
- `copilot_instances` - Individual instances created from templates for specific brands
- `sem_campaign_templates` - SEM-specific campaign data (similar to `seo_campaigns`)
- `sem_ad_group_templates` - Ad groups for SEM campaigns
- `sem_keyword_templates` - Keywords for SEM campaigns

#### Key Features
- **Admin-only templates**: Templates marked as `is_admin_only = true` are only visible to admin users
- **Template inheritance**: Instances inherit configuration from templates but can override settings
- **Workflow reuse**: Same keyword research workflow used across different copilot types
- **Custom prompts**: Each template can have customizable prompts for different workflows

### Frontend Components

#### 1. CopilotTemplate (`/app/copilot-template`)
- **Step 1**: Template & Brand Selection
- **Step 2**: Configuration (keywords, location, language)  
- **Step 3**: Workflow Setup (custom prompts, final configuration)

#### 2. CopilotTemplateSettings (`/app/copilot-template-settings`)
- **Templates Tab**: Create, edit, duplicate, and delete templates (admin only)
- **Instances Tab**: View and manage user's copilot instances

#### 3. SEOCopilotTemplate (`/app/seo-copilot-template`)
- **Complete duplicate** of the original SEO copilot functionality
- **Step 1**: Google Search & Keywords (identical to SEO copilot)
- **Step 2**: Article Configuration (identical to SEO copilot)
- Uses same workflows but stores data in `sem_campaign_templates` for isolation
- Same UI, same features, same API calls - just separate data storage

#### 4. SEMCampaign (`/app/sem-campaign`)
- Uses the same keyword research workflow as SEO copilot
- **Step 1**: Keywords Research (identical to SEO)
- **Step 2**: Campaign Setup (SEM-specific: budget, bidding strategy, landing page)
- **Step 3**: Ad Configuration (target audience, ad copy variations, competitor analysis)

### Implementation Plan Completed

## ✅ Phase A: Copilot Template Infrastructure
- ✅ Created `copilot_templates` table with RLS policies
- ✅ Created `copilot_instances` table for brand-specific instances
- ✅ Added admin-only visibility controls
- ✅ Inserted SEO Copilot Template as baseline

## ✅ Phase B: SEM Campaign Template Structure  
- ✅ Created `sem_campaign_templates` table (parallel to `seo_campaigns`)
- ✅ Created `sem_ad_group_templates` and `sem_keyword_templates`
- ✅ Added SEM Campaign Template to template system
- ✅ Configured RLS policies for data isolation

## ✅ Phase C: Frontend Template System
- ✅ Created `CopilotTemplate.tsx` - Main template creation interface
- ✅ 3-step wizard: Template Selection → Configuration → Workflow Setup
- ✅ Supports both SEO and SEM template types
- ✅ Template inheritance with custom overrides

## ✅ Phase D: Template Settings Page
- ✅ Created `CopilotTemplateSettings.tsx` - Admin template management
- ✅ Template CRUD operations (Create, Read, Update, Delete)
- ✅ Template duplication functionality
- ✅ Instance management interface

## ✅ Phase E: SEO Copilot Template Component
- ✅ Created `SEOCopilotTemplate.tsx` - Complete duplicate of SEO copilot
- ✅ Identical UI, workflows, and functionality as original SEO copilot
- ✅ Uses same `GoogleSearchLobstrService` and `seo-bulk-article-generator` function
- ✅ Stores data in `sem_campaign_templates` for complete isolation
- ✅ Same brand selection, keyword research, and article configuration

## ✅ Phase E2: SEM Campaign Component  
- ✅ Created `SEMCampaign.tsx` - SEM-specific implementation
- ✅ Reuses SEO keyword research workflow (same API, same infrastructure)
- ✅ SEM-specific configuration (budget, bidding, landing pages)
- ✅ Compatible with existing workflow system

## ✅ Phase F: Routing Integration
- ✅ Added new routes to `App.tsx`
- ✅ Updated TypeScript types with new database schema
- ✅ Integrated with existing authentication and navigation

## How to Use

### For Development/Testing (Admin Users Only)

1. **Access Template Settings**:
   ```
   /app/copilot-template-settings
   ```

2. **Create New Template Instance**:
   ```
   /app/copilot-template
   ```

3. **Create SEM Campaign** (standalone):
   ```
   /app/sem-campaign
   ```

### Template Creation Workflow

1. **Select Template & Brand** - Choose from available templates and associate with a brand
2. **Configure Parameters** - Set keywords, target location, language, and template-specific settings
3. **Customize Workflows** - Modify prompts and finalize configuration
4. **Deploy** - Creates campaign in appropriate table (SEO or SEM) and navigates to campaign dashboard

### A/B Testing Capabilities

The system enables A/B testing by:
- Creating template variations with different prompts
- Running parallel campaigns using different templates
- Comparing results without affecting original SEO copilot
- Isolating data per template instance

## Database Data Flow

### SEO Template Instance (Complete Duplicate with Isolated Database)
```
Template Copilot (Admin only)
    ↓ 
SEOCopilotTemplate.tsx (Identical UI/workflow)
    ↓
template_seo_campaigns (Completely isolated campaigns)
    ↓
template_seo_keywords (Isolated keywords)
template_seo_topic_ideas (Isolated topics)
template_blog_posts (Isolated articles)
template_selected_topics (Isolated selections)
template_topic_research_history (Isolated research)
template_suggested_topics (Isolated suggestions)
    ↓
[Same SEO workflow APIs and functions - just different tables]
```

### SEM Template Instance  
```
copilot_templates (SEM Template)
    ↓
copilot_instances (Brand-specific instance) 
    ↓
sem_campaign_templates (Campaign data)
    ↓
sem_ad_group_templates, sem_keyword_templates
```

## Key Benefits

1. **Non-Destructive**: Original SEO copilot remains untouched
2. **Reusable Workflows**: Same keyword research API and infrastructure
3. **Flexible Configuration**: Templates can be customized per brand/instance
4. **Admin Controls**: Template visibility and management restricted to admin users
5. **Scalable**: Easy to add new copilot types (Assets, Tasks, etc.)
6. **A/B Testing Ready**: Multiple template variants can run simultaneously

## Future Extensions

### Additional Copilot Types
- Assets Copilot Template (for creative asset generation)
- Tasks Copilot Template (for project management automation)
- Analytics Copilot Template (for data analysis and reporting)

### Enhanced Features
- Template versioning
- Template marketplace/sharing
- Workflow automation triggers
- Performance analytics per template
- Template success metrics

## Technical Notes

### Workflow Compatibility
- SEM campaigns use the same `GoogleSearchLobstrService` for keyword research
- Same API integrations (DataForSEO, Google Search) 
- Same database patterns for tracking and analytics
- Same UI components and design system

### Security & Permissions
- RLS policies ensure data isolation per user
- Admin-only templates prevent unauthorized access
- Brand-based access control maintained
- Existing authentication system leveraged

### Performance Considerations
- Indexes added for template and instance queries
- Efficient joins between templates and instances
- Minimal impact on existing SEO copilot performance
- Reuses existing caching and optimization strategies

## Testing Strategy

1. **Admin Access**: Verify admin users can see template settings
2. **Template Creation**: Test creating new templates with different configurations
3. **Instance Creation**: Test creating instances from templates
4. **Workflow Execution**: Verify keyword research works for SEM campaigns
5. **Data Isolation**: Ensure SEM data doesn't interfere with SEO data
6. **A/B Testing**: Create multiple template variants and compare results

This implementation provides a solid foundation for copilot template system that can be extended and customized without affecting the existing SEO copilot functionality.
