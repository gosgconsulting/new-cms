/**
 * Client-side Analytics Tracking Utility
 * Provides easy-to-use functions for tracking page views and events
 */

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID from localStorage
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get or create user ID from localStorage
const getUserId = (): string | null => {
  let userId = localStorage.getItem('analytics_user_id');
  if (!userId) {
    // Generate a persistent user ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_user_id', userId);
  }
  return userId;
};

// Detect device type
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Detect browser
const getBrowser = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

// Detect OS
const getOS = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

// Track page view
export const trackPageView = async (options: {
  page_path?: string;
  page_title?: string;
  referrer?: string;
  duration_seconds?: number;
} = {}) => {
  try {
    const sessionId = getSessionId();
    const userId = getUserId();
    
    const data = {
      page_path: options.page_path || window.location.pathname,
      page_title: options.page_title || document.title,
      referrer: options.referrer || document.referrer,
      session_id: sessionId,
      user_id: userId,
      duration_seconds: options.duration_seconds || 0,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      user_agent: navigator.userAgent
    };

    const response = await fetch('/api/analytics/track/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.warn('[testing] Failed to track page view:', response.statusText);
    }
  } catch (error) {
    console.warn('[testing] Analytics tracking error:', error);
  }
};

// Track custom event
export const trackEvent = async (
  event_name: string,
  event_category: string,
  event_action: string,
  options: {
    event_label?: string;
    event_value?: number;
    page_path?: string;
    properties?: Record<string, any>;
    conversion_value?: number;
  } = {}
) => {
  try {
    const sessionId = getSessionId();
    const userId = getUserId();
    
    const data = {
      event_name,
      event_category,
      event_action,
      event_label: options.event_label,
      event_value: options.event_value,
      page_path: options.page_path || window.location.pathname,
      session_id: sessionId,
      user_id: userId,
      properties: options.properties,
      conversion_value: options.conversion_value,
      user_agent: navigator.userAgent
    };

    const response = await fetch('/api/analytics/track/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.warn('[testing] Failed to track event:', response.statusText);
    }
  } catch (error) {
    console.warn('[testing] Analytics event tracking error:', error);
  }
};

// Predefined event tracking functions for common actions

export const trackContactFormSubmit = (formData: {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}) => {
  return trackEvent('contact_form_submit', 'lead', 'submit', {
    event_label: 'Contact Form',
    conversion_value: 10.00,
    properties: formData
  });
};

export const trackPhoneClick = (phoneNumber: string) => {
  return trackEvent('phone_click', 'lead', 'click', {
    event_label: phoneNumber,
    conversion_value: 5.00,
    properties: { phone_number: phoneNumber }
  });
};

export const trackEmailClick = (email: string) => {
  return trackEvent('email_click', 'lead', 'click', {
    event_label: email,
    conversion_value: 5.00,
    properties: { email_address: email }
  });
};

export const trackQuoteRequest = (serviceType?: string) => {
  return trackEvent('quote_request', 'lead', 'submit', {
    event_label: serviceType || 'General Quote',
    conversion_value: 25.00,
    properties: { service_type: serviceType }
  });
};

export const trackNewsletterSignup = (email: string) => {
  return trackEvent('newsletter_signup', 'engagement', 'submit', {
    event_label: 'Newsletter',
    properties: { email_address: email }
  });
};

export const trackDownload = (fileName: string, fileType: string) => {
  return trackEvent('download_brochure', 'engagement', 'download', {
    event_label: fileName,
    properties: { file_name: fileName, file_type: fileType }
  });
};

export const trackVideoPlay = (videoTitle: string, duration?: number) => {
  return trackEvent('video_play', 'engagement', 'play', {
    event_label: videoTitle,
    event_value: duration,
    properties: { video_title: videoTitle, duration_seconds: duration }
  });
};

export const trackSocialShare = (platform: string, url: string) => {
  return trackEvent('social_share', 'engagement', 'share', {
    event_label: platform,
    properties: { platform, shared_url: url }
  });
};

export const trackPageScroll = (percentage: number) => {
  if (percentage >= 75) {
    return trackEvent('page_scroll_75', 'engagement', 'scroll', {
      event_label: '75% Scrolled',
      event_value: percentage,
      properties: { scroll_percentage: percentage }
    });
  }
};

export const trackChatInitiated = (chatType: string = 'live_chat') => {
  return trackEvent('chat_initiated', 'lead', 'initiate', {
    event_label: chatType,
    conversion_value: 15.00,
    properties: { chat_type: chatType }
  });
};

// Page timing tracking
let pageStartTime = Date.now();
let isPageVisible = true;

// Track page visibility changes
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
  if (!isPageVisible) {
    // Page became hidden, track the duration
    const duration = Math.round((Date.now() - pageStartTime) / 1000);
    trackPageView({ duration_seconds: duration });
  } else {
    // Page became visible again, reset timer
    pageStartTime = Date.now();
  }
});

// Track page unload
window.addEventListener('beforeunload', () => {
  if (isPageVisible) {
    const duration = Math.round((Date.now() - pageStartTime) / 1000);
    // Use sendBeacon for reliable tracking on page unload
    const sessionId = getSessionId();
    const userId = getUserId();
    
    const data = {
      page_path: window.location.pathname,
      page_title: document.title,
      session_id: sessionId,
      user_id: userId,
      duration_seconds: duration,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      user_agent: navigator.userAgent
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track/pageview', JSON.stringify(data));
    }
  }
});

// Auto-track scroll depth
let maxScrollPercentage = 0;
const trackScrollDepth = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = Math.round((scrollTop / docHeight) * 100);
  
  if (scrollPercentage > maxScrollPercentage) {
    maxScrollPercentage = scrollPercentage;
    
    // Track milestone scroll depths
    if (scrollPercentage >= 75 && maxScrollPercentage < 75) {
      trackPageScroll(75);
    } else if (scrollPercentage >= 50 && maxScrollPercentage < 50) {
      trackPageScroll(50);
    } else if (scrollPercentage >= 25 && maxScrollPercentage < 25) {
      trackPageScroll(25);
    }
  }
};

// Throttled scroll tracking
let scrollTimeout: NodeJS.Timeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(trackScrollDepth, 100);
});

// Initialize analytics on page load
export const initializeAnalytics = () => {
  // Track initial page view
  trackPageView();
  
  // Reset page start time
  pageStartTime = Date.now();
  maxScrollPercentage = 0;
  
  console.log('[testing] Analytics initialized for:', window.location.pathname);
};

// Auto-initialize if not in admin or test environment
if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin') && !window.location.pathname.includes('/test')) {
  // Initialize after a short delay to ensure DOM is ready
  setTimeout(initializeAnalytics, 1000);
}
