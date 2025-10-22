// This file defines the new section structure for the Development tenant
// with the tabbed interface implementation

import { Section } from '../cms/types';

// Define the section structure with proper tabs
export const developmentSections: Section[] = [
  // Header Section
  {
    id: 'header-main',
    type: 'header-main',
    title: 'Header',
    visible: true,
    data: {
      logo: {
        src: '/assets/go-sg-logo-official.png',
        alt: 'Development CMS'
      },
      ctaText: 'Contact Us',
      showCTA: true,
      isFixed: true,
      // Navigation items for the header
      navigation: [
        { text: 'Home', url: '/' },
        { text: 'Services', url: '/services' },
        { text: 'About', url: '/about' },
        { text: 'Blog', url: '/blog' },
        { text: 'Contact', url: '/contact' }
      ]
    }
  },
  
  // Hero Section
  {
    id: 'hero-section',
    type: 'hero-main',
    title: 'Hero Section',
    visible: true,
    data: {
      // General tab content
      badgeText: 'Results in 3 months or less',
      showBadge: true,
      headingLine1: 'We Boost Your SEO',
      headingLine2: 'In 3 Months',
      description: '<p>We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.</p>',
      ctaButtonText: 'Get a Quote',
      showClientLogos: true,
      backgroundType: 'gradient',
      gradientStart: '#f8f9fa',
      gradientEnd: '#e9ecef',
      
      // Client Logos tab content
      clientLogos: [
        { 
          id: 'logo-1',
          name: 'Client 1',
          image: '/assets/images/client-logo-1.png'
        },
        { 
          id: 'logo-2',
          name: 'Client 2',
          image: '/assets/images/client-logo-2.png'
        },
        { 
          id: 'logo-3',
          name: 'Client 3',
          image: '/assets/images/client-logo-3.png'
        },
        { 
          id: 'logo-4',
          name: 'Client 4',
          image: '/assets/images/client-logo-4.png'
        }
      ],
      
      // CTA Buttons tab content
      ctaButtons: [
        {
          id: 'cta-1',
          text: 'Get a Quote',
          url: '/contact',
          isPrimary: true
        },
        {
          id: 'cta-2',
          text: 'Learn More',
          url: '/services',
          isPrimary: false
        }
      ]
    }
  },
  
  // Pain Points Section
  {
    id: 'pain-point-section',
    type: 'pain-point-section',
    title: 'Pain Points Section',
    visible: true,
    data: {
      // General tab content
      badgeText: 'You have a website but it\'s not generating clicks?',
      headingLine1: 'You Invest... But',
      headingLine2: 'Nothing Happens?',
      rotatingAnimationText1: "low traffic",
      rotatingAnimationText2: "stagnant",
      rotatingAnimationText3: "no traffic",
      backgroundType: 'gradient',
      backgroundColor: '#0f172a',
      
      // Pain Points tab content (array)
      painPoints: [
        {
          title: 'Organic traffic stuck at 0',
          icon: 'x',
          description: 'Your website isn\'t showing up in search results'
        },
        {
          title: 'No clicks, no leads, no sales',
          icon: 'mouse-pointer-click',
          description: 'Your website isn\'t converting visitors into customers'
        },
        {
          title: 'Competitors ranking above you',
          icon: 'bar-chart-3',
          description: 'Your competitors are getting all the traffic and leads'
        },
        {
          title: 'Wasted ad spend',
          icon: 'dollar-sign',
          description: 'You\'re spending money on ads but not seeing results'
        }
      ]
    }
  },
  
  // SEO Results Section
  {
    id: 'seo-results-section',
    type: 'seo-results-section',
    title: 'SEO Results Section',
    visible: true,
    data: {
      // General tab content
      title: 'Real',
      highlightedText: 'SEO Results',
      subtitle: 'See how we\'ve helped businesses like yours achieve remarkable growth through strategic SEO implementation.',
      ctaButtonText: "Become Our Next Case Study",
      backgroundColor: "bg-gradient-to-b from-background via-secondary/30 to-background",
      
      // Results tab content (array)
      results: [
        {
          img: "/src/assets/results/result-1.png",
          label: "+245% Organic Traffic in 6 months",
          client: "E-commerce Store"
        },
        {
          img: "/src/assets/results/result-2.png",
          label: "+180% Organic Traffic in 4 months",
          client: "Local Business"
        },
        {
          img: "/src/assets/results/result-3.png",
          label: "+320% Organic Traffic in 5 months",
          client: "SaaS Company"
        },
        {
          img: "/src/assets/results/result-4.png",
          label: "+195% Organic Traffic in 3 months",
          client: "Professional Services"
        },
        {
          img: "/src/assets/results/result-5.png",
          label: "+275% Organic Traffic in 6 months",
          client: "Healthcare Provider"
        },
        {
          img: "/src/assets/results/result-6.png",
          label: "+160% Organic Traffic in 4 months",
          client: "Educational Institution"
        }
      ]
    }
  },
  
  // Services Showcase Section
  {
    id: 'services-showcase-section',
    type: 'services-showcase-section',
    title: 'Services Showcase',
    visible: true,
    data: {
      // General tab content
      sectionTitle: 'Our Services',
      sectionSubtitle: 'Comprehensive SEO solutions to grow your online presence',
      backgroundColor: "#ffffff",
      
      // Services tab content (array)
      services: [
        {
          id: "keywords-research",
          title: "Rank on keywords with",
          highlight: "search volume",
          description: "Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.",
          buttonText: "Learn More",
          buttonUrl: "/services/keyword-research",
          images: [
            "/src/assets/seo/keyword-research-1.png",
            "/src/assets/seo/keyword-research-2.png"
          ]
        },
        {
          id: "content-strategy",
          title: "Find topics based on",
          highlight: "real google search results",
          description: "Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.",
          buttonText: "View Analytics",
          buttonUrl: "/services/content-strategy",
          images: [
            "/src/assets/seo/content-strategy-1.png",
            "/src/assets/seo/content-strategy-2.png"
          ]
        },
        {
          id: "link-building",
          title: "Build authority with",
          highlight: "high-quality backlinks",
          description: "Strengthen your website's authority through strategic link building campaigns. Acquire high-quality backlinks from reputable sources to boost your domain authority and rankings.",
          buttonText: "Try Link Builder",
          buttonUrl: "/services/link-building",
          images: [
            "/src/assets/seo/link-building-1.png",
            "/src/assets/seo/link-building-2.png"
          ]
        },
        {
          id: "local-seo",
          title: "Dominate local searches with",
          highlight: "local SEO optimization",
          description: "Get found by customers in your area with our local SEO services. Optimize your Google Business Profile, local citations, and location-based keywords.",
          buttonText: "Local SEO Services",
          buttonUrl: "/services/local-seo",
          images: [
            "/src/assets/seo/local-seo-1.png",
            "/src/assets/seo/local-seo-2.png"
          ]
        }
      ]
    }
  },
  
  // What is SEO Section
  {
    id: 'what-is-seo-section',
    type: 'what-is-seo-section',
    title: 'What is SEO Section',
    visible: true,
    data: {
      // General tab content
      title: "What is",
      highlightedText: "SEO",
      subtitle: "Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search results. Here's how we make it work for your business:",
      ctaText: "Ready to see how SEO can transform your business?",
      ctaButtonText: "Start Your SEO Partnership",
      ctaButtonUrl: "/contact",
      backgroundColor: "#ffffff",
      
      // Services tab content (array)
      services: [
        {
          icon: "Search",
          title: "Keyword Research",
          description: "In-depth analysis to identify high-value keywords that drive qualified traffic to your business."
        },
        {
          icon: "FileText",
          title: "On-Page Optimization",
          description: "Optimize your website content, meta tags, and structure for maximum search engine visibility."
        },
        {
          icon: "Code",
          title: "Technical SEO",
          description: "Fix technical issues, improve site speed, and ensure your website is crawlable by search engines."
        },
        {
          icon: "BarChart3",
          title: "SEO Analytics",
          description: "Track and measure your SEO performance with detailed reporting and actionable insights."
        },
        {
          icon: "Link2",
          title: "Link Building",
          description: "Build high-quality backlinks from authoritative websites to boost your domain authority."
        },
        {
          icon: "Users",
          title: "Local SEO",
          description: "Optimize your business for local search results and Google My Business visibility."
        },
        {
          icon: "TrendingUp",
          title: "Content Strategy",
          description: "Create SEO-optimized content that engages your audience and ranks on search engines."
        },
        {
          icon: "Target",
          title: "Competitor Analysis",
          description: "Analyze your competitors' strategies to identify opportunities and stay ahead."
        }
      ]
    }
  },
  
  // Testimonials Section
  {
    id: 'testimonials-section',
    type: 'testimonials-section',
    title: 'Testimonials',
    visible: true,
    data: {
      // General tab content
      sectionTitle: 'What our clients say',
      sectionSubtitle: 'See what our customers have to say about our SEO services and results.',
      backgroundColor: "#f9fafb",
      displayStyle: 'slider', // Options: slider, grid, carousel
      
      // Testimonials tab content (array)
      testimonials: [
        {
          text: "Their SEO strategies boosted our organic traffic by 400% in just 3 months. Our website now ranks #1 for our main keywords.",
          image: "https://randomuser.me/api/portraits/women/1.jpg",
          name: "Sarah Chen",
          role: "Marketing Director",
          company: "E-commerce Store"
        },
        {
          text: "Their technical SEO audit revealed critical issues we didn't know existed. After fixes, our search rankings improved dramatically.",
          image: "https://randomuser.me/api/portraits/men/2.jpg",
          name: "Marcus Tan",
          role: "Business Owner",
          company: "Local Business"
        },
        {
          text: "Their local SEO expertise helped us dominate Singapore search results. We're now the top choice in our area.",
          image: "https://randomuser.me/api/portraits/women/3.jpg",
          name: "Priya Sharma",
          role: "E-commerce Manager",
          company: "Retail Chain"
        },
        {
          text: "The content strategy they developed has positioned us as thought leaders in our industry. Our blog traffic has increased by 250%.",
          image: "https://randomuser.me/api/portraits/men/4.jpg",
          name: "James Wilson",
          role: "CEO",
          company: "SaaS Company"
        }
      ]
    }
  },
  
  // FAQ Section
  {
    id: 'faq-section',
    type: 'faq-section',
    title: 'FAQ Section',
    visible: true,
    data: {
      // General tab content
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about our SEO services',
      backgroundColor: "#ffffff",
      displayStyle: 'accordion', // Options: accordion, tabs, blocks
      
      // FAQ Items tab content (array)
      items: [
        {
          question: 'How long does it take to see results?',
          answer: '<p>Most clients see significant improvements within 3 months, though some competitive keywords may take longer. We focus on quick wins first while building long-term strategies for sustainable growth.</p>'
        },
        {
          question: 'What services are included?',
          answer: '<p>Our SEO packages include keyword research, on-page optimization, content creation, link building, and monthly reporting. We customize our approach based on your specific business goals and industry.</p>'
        },
        {
          question: 'Do you guarantee first page rankings?',
          answer: '<p>While we can\'t guarantee specific rankings (no ethical SEO company can), we have a proven track record of getting our clients to the first page for their target keywords. Our focus is on driving qualified traffic that converts.</p>'
        },
        {
          question: 'How much does SEO cost?',
          answer: '<p>Our SEO packages start at $1,500 per month. The exact investment depends on your industry, competition, and goals. We offer customized solutions to fit your budget and business needs.</p>'
        },
        {
          question: 'Do I need to sign a long-term contract?',
          answer: '<p>We recommend a minimum 6-month commitment for SEO campaigns to see meaningful results. However, we offer month-to-month contracts with a 30-day notice period if you need to cancel.</p>'
        }
      ]
    }
  },
  
  // Blog Preview Section
  {
    id: 'blog-preview-section',
    type: 'blog-preview-section',
    title: 'Blog Section',
    visible: true,
    data: {
      // General tab content
      title: 'Latest SEO Insights',
      subtitle: 'Stay ahead of the curve with our expert SEO tips, strategies, and industry insights.',
      backgroundColor: "bg-gradient-to-br from-gray-50 to-blue-50/30",
      displayCount: 3,
      viewAllButtonText: 'View All Articles',
      viewAllButtonUrl: '/blog',
      
      // Featured Posts tab content (array)
      featuredPosts: [
        {
          id: 'post-1',
          title: 'How to Conduct Keyword Research in 2023',
          excerpt: 'Learn the latest techniques for finding high-value keywords that drive qualified traffic to your website.',
          image: '/assets/images/blog-1.jpg',
          url: '/blog/keyword-research-2023',
          date: '2023-10-10',
          author: 'John Doe'
        },
        {
          id: 'post-2',
          title: 'Technical SEO Checklist for E-commerce Websites',
          excerpt: 'Ensure your e-commerce site is optimized for search engines with this comprehensive technical SEO checklist.',
          image: '/assets/images/blog-2.jpg',
          url: '/blog/technical-seo-ecommerce',
          date: '2023-10-15',
          author: 'Jane Smith'
        },
        {
          id: 'post-3',
          title: 'The Impact of AI on SEO: What You Need to Know',
          excerpt: 'Discover how artificial intelligence is changing the SEO landscape and how to adapt your strategy.',
          image: '/assets/images/blog-3.jpg',
          url: '/blog/ai-impact-seo',
          date: '2023-10-20',
          author: 'Mike Johnson'
        }
      ]
    }
  },
  
  // CTA Section
  {
    id: 'cta-section',
    type: 'cta-section',
    title: 'Call to Action Section',
    visible: true,
    data: {
      // General tab content
      heading: 'Ready to Boost Your SEO?',
      subheading: 'Get a free SEO audit and discover how we can help you improve your search rankings.',
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      alignment: 'center', // Options: left, center, right
      
      // Buttons tab content (array)
      buttons: [
        {
          text: 'Get Free SEO Audit',
          url: '/contact',
          style: 'primary',
          openInNewTab: false
        },
        {
          text: 'Learn More',
          url: '/services',
          style: 'secondary',
          openInNewTab: false
        }
      ]
    }
  },
  
  // Footer Section
  {
    id: 'footer-main',
    type: 'footer-main',
    title: 'Footer',
    visible: true,
    data: {
      // General tab content
      ctaHeading: 'Get Your SEO Strategy',
      ctaDescription: 'Ready to dominate search results? Let\'s discuss how we can help your business grow.',
      ctaButtonText: 'Start Your Journey',
      ctaButtonUrl: '/contact',
      backgroundColor: '#0f172a',
      
      // Contact Links tab content (array)
      contactLinks: [
        {
          text: 'WhatsApp',
          url: 'https://wa.me/1234567890',
          icon: 'message-circle'
        },
        {
          text: 'Book a Meeting',
          url: 'https://calendly.com',
          icon: 'calendar'
        },
        {
          text: 'Email Us',
          url: 'mailto:info@example.com',
          icon: 'mail'
        },
        {
          text: 'Call Us',
          url: 'tel:+1234567890',
          icon: 'phone'
        }
      ],
      
      // Legal Links tab content (array)
      legalLinks: [
        {
          text: 'Privacy Policy',
          url: '/privacy-policy'
        },
        {
          text: 'Terms of Service',
          url: '/terms-of-service'
        },
        {
          text: 'Blog',
          url: '/blog'
        },
        {
          text: 'Sitemap',
          url: '/sitemap.xml'
        }
      ],
      
      // Social Media tab content (array)
      socialMedia: [
        {
          platform: 'Facebook',
          url: 'https://facebook.com',
          icon: 'facebook'
        },
        {
          platform: 'Twitter',
          url: 'https://twitter.com',
          icon: 'twitter'
        },
        {
          platform: 'LinkedIn',
          url: 'https://linkedin.com',
          icon: 'linkedin'
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com',
          icon: 'instagram'
        }
      ],
      
      copyrightText: '© 2023 Development CMS. All rights reserved.'
    }
  },
  
  // NEW SECTION: Team Members Section
  {
    id: 'team-section',
    type: 'team-section',
    title: 'Team Members Section',
    visible: true,
    data: {
      // General tab content
      sectionTitle: 'Our Expert Team',
      sectionSubtitle: 'Meet the SEO specialists who will help grow your online presence',
      backgroundColor: '#ffffff',
      displayStyle: 'grid', // Options: grid, carousel, list
      
      // Team Members tab content (array)
      teamMembers: [
        {
          name: 'John Smith',
          role: 'SEO Director',
          bio: 'Over 10 years of experience in search engine optimization and digital marketing.',
          image: '/assets/images/team-1.jpg',
          socialLinks: [
            { platform: 'LinkedIn', url: 'https://linkedin.com' },
            { platform: 'Twitter', url: 'https://twitter.com' }
          ]
        },
        {
          name: 'Sarah Johnson',
          role: 'Content Strategist',
          bio: 'Expert in creating SEO-optimized content that engages readers and ranks well.',
          image: '/assets/images/team-2.jpg',
          socialLinks: [
            { platform: 'LinkedIn', url: 'https://linkedin.com' },
            { platform: 'Twitter', url: 'https://twitter.com' }
          ]
        },
        {
          name: 'Michael Chen',
          role: 'Technical SEO Specialist',
          bio: 'Specializes in fixing technical issues that prevent websites from ranking well.',
          image: '/assets/images/team-3.jpg',
          socialLinks: [
            { platform: 'LinkedIn', url: 'https://linkedin.com' },
            { platform: 'GitHub', url: 'https://github.com' }
          ]
        },
        {
          name: 'Emily Rodriguez',
          role: 'Link Building Expert',
          bio: 'Focused on building high-quality backlinks to boost domain authority.',
          image: '/assets/images/team-4.jpg',
          socialLinks: [
            { platform: 'LinkedIn', url: 'https://linkedin.com' },
            { platform: 'Twitter', url: 'https://twitter.com' }
          ]
        }
      ]
    }
  },
  
  // NEW SECTION: Stats Section
  {
    id: 'stats-section',
    type: 'stats-section',
    title: 'Statistics Section',
    visible: true,
    data: {
      // General tab content
      sectionTitle: 'Our Impact in Numbers',
      sectionSubtitle: 'Real results that speak for themselves',
      backgroundColor: '#f8f9fa',
      animateNumbers: true,
      
      // Stats tab content (array)
      stats: [
        {
          value: '500+',
          label: 'Clients Served',
          icon: 'users'
        },
        {
          value: '15,000+',
          label: 'Keywords Ranked',
          icon: 'search'
        },
        {
          value: '300%',
          label: 'Average Traffic Increase',
          icon: 'trending-up'
        },
        {
          value: '98%',
          label: 'Client Retention',
          icon: 'heart'
        }
      ]
    }
  },
  
  // NEW SECTION: Process Section
  {
    id: 'process-section',
    type: 'process-section',
    title: 'Process Section',
    visible: true,
    data: {
      // General tab content
      sectionTitle: 'Our SEO Process',
      sectionSubtitle: 'A proven methodology for achieving sustainable results',
      backgroundColor: '#ffffff',
      displayStyle: 'horizontal', // Options: horizontal, vertical
      
      // Steps tab content (array)
      steps: [
        {
          number: 1,
          title: 'Discovery & Audit',
          description: 'We analyze your website, competitors, and industry to identify opportunities.',
          icon: 'search'
        },
        {
          number: 2,
          title: 'Strategy Development',
          description: 'We create a customized SEO roadmap based on your goals and audit findings.',
          icon: 'map'
        },
        {
          number: 3,
          title: 'Implementation',
          description: 'We execute the strategy, optimizing your website and content for search engines.',
          icon: 'settings'
        },
        {
          number: 4,
          title: 'Monitoring & Reporting',
          description: 'We track your performance and provide regular reports on your progress.',
          icon: 'bar-chart-2'
        },
        {
          number: 5,
          title: 'Refinement',
          description: 'We continuously refine our approach based on results and algorithm updates.',
          icon: 'refresh-cw'
        }
      ]
    }
  }
];

// Export a function to get sections for the Development tenant
export const getDevelopmentSections = (): Section[] => {
  return developmentSections;
};

// Helper function to find a section by ID
export const findSectionById = (id: string): Section | undefined => {
  return developmentSections.find(section => section.id === id);
};

// Helper function to find a section by title
export const findSectionByTitle = (title: string): Section | undefined => {
  return developmentSections.find(section => 
    section.title.toLowerCase() === title.toLowerCase()
  );
};
