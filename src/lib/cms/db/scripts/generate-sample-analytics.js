/**
 * Generate Sample Analytics Data
 * Run this script to populate the analytics tables with sample data for testing
 */

import { 
  trackPageView, 
  trackEvent, 
  upsertEventDefinition 
} from '../postgres.js';

// Sample pages
const samplePages = [
  { path: '/', title: 'Home - GO SG' },
  { path: '/services', title: 'Services - GO SG' },
  { path: '/about', title: 'About Us - GO SG' },
  { path: '/contact', title: 'Contact - GO SG' },
  { path: '/blog', title: 'Blog - GO SG' },
  { path: '/seo-services', title: 'SEO Services - GO SG' },
  { path: '/web-design', title: 'Web Design - GO SG' },
  { path: '/digital-marketing', title: 'Digital Marketing - GO SG' }
];

// Sample referrers
const sampleReferrers = [
  'https://google.com',
  'https://facebook.com',
  'https://linkedin.com',
  'https://twitter.com',
  'https://instagram.com',
  '',  // Direct traffic
  'https://bing.com',
  'https://yahoo.com'
];

// Sample devices and browsers
const sampleDevices = ['desktop', 'mobile', 'tablet'];
const sampleBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const sampleOS = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];
const sampleCountries = ['Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam'];
const sampleCities = ['Singapore', 'Kuala Lumpur', 'Bangkok', 'Jakarta', 'Manila', 'Ho Chi Minh City'];

// Generate random data helpers
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Generate session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate user ID
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate sample analytics data
async function generateSampleData() {
  console.log('[testing] Starting analytics sample data generation...');

  try {
    // Generate data for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const sessions = [];
    const users = [];
    
    // Generate 100 unique users
    for (let i = 0; i < 100; i++) {
      users.push(generateUserId());
    }

    // Generate sessions and page views
    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      // Generate 20-100 sessions per day
      const sessionsPerDay = randomInt(20, 100);
      
      for (let session = 0; session < sessionsPerDay; session++) {
        const sessionId = generateSessionId();
        const userId = randomChoice(users);
        const sessionStart = new Date(currentDate);
        sessionStart.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
        
        // Generate 1-10 page views per session
        const pageViewsPerSession = randomInt(1, 10);
        const bounce = pageViewsPerSession === 1;
        
        for (let pv = 0; pv < pageViewsPerSession; pv++) {
          const page = randomChoice(samplePages);
          const referrer = pv === 0 ? randomChoice(sampleReferrers) : '';
          const duration = randomInt(10, 300); // 10 seconds to 5 minutes
          
          const pageViewTime = new Date(sessionStart);
          pageViewTime.setMinutes(pageViewTime.getMinutes() + (pv * 2)); // 2 minutes between page views
          
          await trackPageView({
            page_path: page.path,
            page_title: page.title,
            referrer: referrer,
            user_agent: `Mozilla/5.0 (${randomChoice(['Windows NT 10.0', 'Macintosh', 'X11; Linux x86_64'])}) AppleWebKit/537.36`,
            ip_address: `192.168.1.${randomInt(1, 254)}`,
            session_id: sessionId,
            user_id: userId,
            duration_seconds: duration,
            bounce: bounce,
            country: randomChoice(sampleCountries),
            city: randomChoice(sampleCities),
            device_type: randomChoice(sampleDevices),
            browser: randomChoice(sampleBrowsers),
            os: randomChoice(sampleOS)
          });
          
          // Generate some events for this page view
          if (Math.random() < 0.3) { // 30% chance of events
            const eventTypes = [
              { name: 'contact_form_submit', category: 'lead', action: 'submit', conversion: true, value: 10 },
              { name: 'phone_click', category: 'lead', action: 'click', conversion: true, value: 5 },
              { name: 'email_click', category: 'lead', action: 'click', conversion: true, value: 5 },
              { name: 'newsletter_signup', category: 'engagement', action: 'submit', conversion: false, value: 0 },
              { name: 'video_play', category: 'engagement', action: 'play', conversion: false, value: 0 },
              { name: 'page_scroll_75', category: 'engagement', action: 'scroll', conversion: false, value: 0 }
            ];
            
            const event = randomChoice(eventTypes);
            const eventTime = new Date(pageViewTime);
            eventTime.setSeconds(eventTime.getSeconds() + randomInt(10, 60));
            
            await trackEvent({
              event_name: event.name,
              event_category: event.category,
              event_action: event.action,
              event_label: page.title,
              event_value: event.value,
              page_path: page.path,
              user_id: userId,
              session_id: sessionId,
              ip_address: `192.168.1.${randomInt(1, 254)}`,
              user_agent: `Mozilla/5.0 (${randomChoice(['Windows NT 10.0', 'Macintosh', 'X11; Linux x86_64'])}) AppleWebKit/537.36`,
              properties: { generated: true, test_data: true },
              conversion_value: event.conversion ? event.value : 0
            });
          }
        }
      }
      
      console.log(`[testing] Generated data for day ${day + 1}/30 (${currentDate.toDateString()})`);
    }

    console.log('[testing] Sample analytics data generation completed successfully!');
    console.log('[testing] Generated data includes:');
    console.log('- Page views with realistic session patterns');
    console.log('- Custom events (leads, engagement)');
    console.log('- Device, browser, and location data');
    console.log('- 30 days of historical data');
    
  } catch (error) {
    console.error('[testing] Error generating sample data:', error);
    throw error;
  }
}

// Run the generator if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSampleData()
    .then(() => {
      console.log('[testing] Sample data generation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[testing] Sample data generation failed:', error);
      process.exit(1);
    });
}

export { generateSampleData };
