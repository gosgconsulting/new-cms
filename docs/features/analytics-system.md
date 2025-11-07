# Analytics System Documentation

This document provides comprehensive information about the analytics system implemented in the GO SG website.

## Overview

The analytics system provides comprehensive website performance tracking with:
- **Real-time Analytics**: Live visitor tracking and activity monitoring
- **KPI Dashboard**: Key performance indicators with visual charts
- **Event Tracking**: Custom event management for leads and engagement
- **Historical Data**: 30+ days of historical analytics data
- **Automated Tracking**: Client-side tracking with session management

## Features

### 📊 Main KPIs Tracked

#### Traffic Metrics
- **Page Views**: Total number of page loads
- **Sessions**: Unique visitor sessions with timeout handling
- **Unique Visitors**: Distinct users based on IP/user ID
- **Bounce Rate**: Percentage of single-page sessions
- **Average Session Duration**: Time spent per session

#### Engagement Metrics
- **Events**: Custom tracked interactions
- **Conversions**: Lead-generating events
- **Conversion Rate**: Percentage of sessions with conversions
- **Scroll Depth**: Page engagement measurement
- **Time on Page**: Individual page duration tracking

#### Technical Metrics
- **Device Breakdown**: Desktop, mobile, tablet usage
- **Browser Analytics**: Chrome, Firefox, Safari, etc.
- **Operating System**: Windows, macOS, Linux, mobile OS
- **Geographic Data**: Country and city tracking
- **Referrer Analysis**: Traffic source identification

### 🎯 Event Tracking System

#### Pre-defined Events
- **Contact Form Submit** (Lead, $10 value)
- **Phone Click** (Lead, $5 value)
- **Email Click** (Lead, $5 value)
- **Quote Request** (Lead, $25 value)
- **Newsletter Signup** (Engagement)
- **Download Brochure** (Engagement)
- **Video Play** (Engagement)
- **Social Share** (Engagement)
- **Page Scroll 75%** (Engagement)
- **Chat Initiated** (Lead, $15 value)

#### Custom Event Management
- Create new trackable events
- Set conversion values
- Categorize events (lead, engagement, etc.)
- Enable/disable event tracking
- Event performance analytics

## Architecture

### Database Schema

#### Core Tables
- `analytics_page_views`: Individual page view records
- `analytics_events`: Custom event tracking
- `analytics_sessions`: Session aggregation data
- `analytics_daily_stats`: Pre-computed daily metrics
- `analytics_event_definitions`: Event configuration
- `analytics_goals`: Business goal tracking

#### Key Features
- **Automatic Triggers**: Session updates on page views/events
- **Daily Aggregation**: Automated stats computation
- **Performance Indexes**: Optimized for fast queries
- **Data Retention**: Configurable retention policies

### Client-Side Tracking

#### Automatic Tracking
```javascript
// Auto-initialized on page load
import { initializeAnalytics } from '@/utils/analytics';

// Tracks page views, session duration, scroll depth
initializeAnalytics();
```

#### Manual Event Tracking
```javascript
import { 
  trackEvent, 
  trackContactFormSubmit,
  trackPhoneClick 
} from '@/utils/analytics';

// Custom event
trackEvent('button_click', 'engagement', 'click', {
  event_label: 'Header CTA',
  properties: { button_text: 'Get Quote' }
});

// Pre-defined events
trackContactFormSubmit({
  name: 'John Doe',
  email: 'john@example.com'
});

trackPhoneClick('+65 1234 5678');
```

### Server-Side API

#### Analytics Endpoints
- `GET /api/analytics/overview?days=30` - KPI overview
- `GET /api/analytics/chart-data?days=30` - Chart data
- `GET /api/analytics/realtime` - Real-time metrics
- `POST /api/analytics/track/pageview` - Track page view
- `POST /api/analytics/track/event` - Track custom event

#### Event Management
- `GET /api/analytics/event-definitions` - List events
- `POST /api/analytics/event-definitions` - Create/update event
- `DELETE /api/analytics/event-definitions/:name` - Delete event

## Dashboard Interface

### Analytics Tab (CMS)
Located at `/admin` → Analytics (first tab)

#### Overview Section
- **KPI Cards**: 8 main metrics with icons
- **Traffic Chart**: Line chart showing page views, sessions, visitors
- **Bounce Rate Chart**: Bar chart of daily bounce rates
- **Events Chart**: Events and conversions over time
- **Top Pages Chart**: Doughnut chart of popular pages
- **Top Pages Table**: Detailed page performance
- **Top Referrers Table**: Traffic source analysis

#### Events Section
- **Event Definitions Table**: Manage trackable events
- **Add/Edit Events**: Modal for event configuration
- **Event Categories**: Lead vs. engagement classification
- **Conversion Values**: Monetary value assignment
- **Status Management**: Enable/disable events

#### Real-time Section
- **Live Metrics**: 24-hour and 1-hour breakdowns
- **Active Pages**: Current page activity (5-minute window)
- **Auto-refresh**: Updates every 30 seconds
- **Live Indicators**: Visual pulse animations

### Time Range Selection
- Last 7 days
- Last 30 days (default)
- Last 90 days

## Setup Instructions

### 1. Database Setup

Run the analytics migration:
```sql
-- Execute sparti-cms/db/analytics-migrations.sql
-- This creates all necessary tables, indexes, and triggers
```

### 2. Server Configuration

Analytics routes are automatically included in `server.js`:
```javascript
// Analytics functions are imported and routes configured
// No additional server setup required
```

### 3. Client Integration

Analytics tracking is automatically initialized:
```javascript
// Automatic initialization (excludes admin/test pages)
// Manual initialization if needed:
import { initializeAnalytics } from '@/utils/analytics';
initializeAnalytics();
```

### 4. Event Configuration

Access the CMS Analytics → Events tab to:
1. Review pre-configured events
2. Add custom events for your business
3. Set conversion values
4. Enable/disable tracking

## Data Privacy & GDPR

### Privacy-First Design
- **No Personal Data**: Only anonymous session/user IDs
- **IP Anonymization**: Store only for geographic insights
- **Local Storage**: Session IDs stored locally
- **No Cookies**: Uses localStorage instead of cookies
- **Opt-out Ready**: Easy to implement consent management

### Data Retention
- **Page Views**: Configurable retention (default: 1 year)
- **Events**: Configurable retention (default: 1 year)
- **Sessions**: Configurable retention (default: 1 year)
- **Daily Stats**: Permanent (aggregated data)

## Performance Optimization

### Database Performance
- **Indexes**: Optimized for common queries
- **Partitioning**: Date-based partitioning for large datasets
- **Aggregation**: Daily stats reduce query load
- **Triggers**: Automatic session updates

### Client Performance
- **Async Tracking**: Non-blocking API calls
- **Throttled Events**: Scroll tracking throttling
- **Beacon API**: Reliable page unload tracking
- **Error Handling**: Graceful failure handling

## Testing & Sample Data

### Generate Sample Data
```bash
# Run the sample data generator
node sparti-cms/db/generate-sample-analytics.js
```

This creates:
- 30 days of historical data
- Realistic session patterns
- Various device/browser combinations
- Geographic distribution
- Event tracking examples

### Testing Checklist
- [ ] Page view tracking works
- [ ] Event tracking functions
- [ ] Dashboard loads data
- [ ] Charts render correctly
- [ ] Real-time updates work
- [ ] Event management functions
- [ ] Time range filtering works
- [ ] Mobile responsiveness

## API Reference

### Track Page View
```javascript
POST /api/analytics/track/pageview
{
  "page_path": "/services",
  "page_title": "Services - GO SG",
  "referrer": "https://google.com",
  "session_id": "session_123",
  "user_id": "user_456",
  "duration_seconds": 120,
  "device_type": "desktop",
  "browser": "Chrome",
  "os": "Windows"
}
```

### Track Event
```javascript
POST /api/analytics/track/event
{
  "event_name": "contact_form_submit",
  "event_category": "lead",
  "event_action": "submit",
  "event_label": "Contact Form",
  "event_value": 10,
  "session_id": "session_123",
  "conversion_value": 10.00,
  "properties": {
    "form_type": "contact",
    "source": "header"
  }
}
```

### Get Analytics Overview
```javascript
GET /api/analytics/overview?days=30

Response:
{
  "sessions": 1250,
  "page_views": 3200,
  "unique_visitors": 980,
  "avg_session_duration": 145.5,
  "bounce_rate": 42.3,
  "total_events": 450,
  "conversions": 85,
  "conversion_rate": 6.8,
  "top_pages": [...],
  "top_referrers": [...]
}
```

## Troubleshooting

### Common Issues

1. **No Data Showing**
   - Check database connection
   - Verify analytics tables exist
   - Run sample data generator
   - Check browser console for errors

2. **Tracking Not Working**
   - Verify client-side initialization
   - Check network requests in DevTools
   - Ensure server routes are accessible
   - Check for JavaScript errors

3. **Charts Not Rendering**
   - Verify Chart.js dependencies
   - Check data format in API responses
   - Ensure proper chart configuration
   - Check for console errors

4. **Performance Issues**
   - Review database indexes
   - Check query performance
   - Consider data archiving
   - Monitor server resources

### Debug Mode
Enable debug logging:
```javascript
// Client-side debugging
localStorage.setItem('analytics_debug', 'true');

// Server-side debugging
NODE_ENV=development
```

## Future Enhancements

### Planned Features
- **A/B Testing**: Built-in experiment tracking
- **Funnel Analysis**: Conversion funnel visualization
- **Cohort Analysis**: User retention tracking
- **Custom Dashboards**: Personalized analytics views
- **Export Functionality**: CSV/PDF report generation
- **Alerts System**: Automated performance alerts
- **Integration APIs**: Third-party analytics integration

### Scalability Considerations
- **Data Partitioning**: Time-based table partitioning
- **Caching Layer**: Redis for real-time data
- **CDN Integration**: Global analytics tracking
- **Microservices**: Separate analytics service
- **Stream Processing**: Real-time data processing

## Support

For analytics system support:
1. Check this documentation
2. Review server logs for errors
3. Test with sample data generator
4. Verify database schema
5. Check client-side tracking implementation

The analytics system is designed to be robust, performant, and privacy-compliant while providing comprehensive insights into website performance and user behavior.
