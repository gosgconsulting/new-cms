import React, { memo } from 'react';
import { Card, CardContent } from './ui/card';
import { 
  getHeading, 
  getText, 
  getImageSrc,
  getImageAlt,
  getArrayItems,
  getContentByKey,
  SchemaComponent 
} from '../utils/schemaHelpers';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  location: string;
  image: string;
  rating: number;
  quote: string;
  results: string;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  data?: SchemaComponent;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title,
  subtitle,
  testimonials,
  data
}) => {
  // ACATR hardcoded defaults
  const defaultTitle = 'Trusted by Businesses Worldwide';
  const defaultSubtitle = 'Local and international businesses trust our ACRA-registered filing agents for 24-hour Singapore company incorporation, professional accounting services, and guaranteed compliance with zero penalties.';
  const defaultTestimonials: Testimonial[] = [
    {
      name: 'Sarah Chen',
      role: 'Tech Startup Founder',
      company: 'InnovateTech Solutions',
      location: 'Local Client',
      image: '/theme/landingpage/assets/testimonial-1.jpg',
      rating: 5,
      quote: 'ACATR\'s ACRA-registered filing agents completed our Singapore company incorporation in exactly 24 hours as promised. Their chartered accountants handle all our IRAS compliance and GST filing, giving us complete peace of mind to focus on scaling our tech startup.',
      results: 'Singapore company incorporated in 24 hours with 100% ACRA compliance'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'International Entrepreneur',
      company: 'Global Trade Partners',
      location: 'International Client',
      image: '/theme/landingpage/assets/testimonial-2.jpg',
      rating: 5,
      quote: 'As an international business owner, ACATR\'s Singapore company incorporation services were perfect for remote setup. Their qualified company secretaries ensure 100% ACRA compliance, and we\'ve had zero penalties thanks to their 99% compliance success rate guarantee.',
      results: 'International business setup with zero ACRA penalties and perfect compliance'
    },
    {
      name: 'Lisa Thompson',
      role: 'Small Business Owner',
      company: 'Artisan Crafts Co.',
      location: 'Local Client',
      image: '/theme/landingpage/assets/testimonial-1.jpg',
      rating: 5,
      quote: 'ACATR\'s professional Singapore accounting services transformed our financial management. Their qualified chartered accountants handle all our IRAS compliance and GST filing, saving us over 20 hours monthly while ensuring perfect regulatory compliance.',
      results: '20+ hours saved monthly with 100% IRAS and GST compliance'
    }
  ];

  // Extract from schema if data is provided
  const items = data?.items || [];
  const testimonialsArray = getArrayItems(items, 'testimonials');
  
  // Use schema values if available, otherwise fall back to props or defaults
  const finalTitle = getHeading(items, 'title', 2) || 
                     getContentByKey(items, 'title') || 
                     title || 
                     defaultTitle;
  const finalSubtitle = getText(items, 'subtitle') || 
                       getContentByKey(items, 'subtitle') || 
                       subtitle || 
                       defaultSubtitle;

  // Extract testimonials from schema or use provided/default testimonials
  let finalTestimonials = testimonials || defaultTestimonials;
  
  if (testimonialsArray.length > 0) {
    finalTestimonials = testimonialsArray.map((testimonialItem) => {
      const testimonialItems = testimonialItem.items || [];
      const name = getHeading(testimonialItems, `${testimonialItem.key}_name`, 4) || 
                   getContentByKey(testimonialItems, 'name') || 
                   getContentByKey(testimonialItems, `${testimonialItem.key}_name`) || '';
      const role = getText(testimonialItems, `${testimonialItem.key}_role`) || 
                   getContentByKey(testimonialItems, 'role') || '';
      const quote = getText(testimonialItems, `${testimonialItem.key}_text`) || 
                    getContentByKey(testimonialItems, 'text') || 
                    getContentByKey(testimonialItems, 'content') || '';
      const image = getImageSrc(testimonialItems, `${testimonialItem.key}_image`) || 
                    getContentByKey(testimonialItems, 'image') || 
                    '/theme/landingpage/assets/placeholder.svg';
      const alt = getImageAlt(testimonialItems, `${testimonialItem.key}_image`) || 
                  getContentByKey(testimonialItems, 'alt') || 
                  name;

      return {
        name: name || 'Anonymous',
        role: role || '',
        company: '', // Not in schema format
        location: '', // Not in schema format
        image: image,
        rating: 5, // Default rating
        quote: quote,
        results: '' // Not in schema format
      };
    });
  }
  const stats = [
    { label: 'Client Satisfaction', value: '98%' },
    { label: 'Average Time Saved', value: '15+ hrs/month' },
    { label: 'Compliance Success', value: '99%' },
    { label: 'Business Growth', value: '250% avg' }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
            {finalTitle.includes('Worldwide') ? (
              <>
                {finalTitle.split('Worldwide')[0]}
                <span className="text-primary">
                  {'Worldwide'}
                </span>
              </>
            ) : (
              finalTitle
            )}
          </h2>
          {finalSubtitle && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {finalSubtitle}
            </p>
          )}
        </div>

        {/* Success Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {finalTestimonials.map((testimonial, index) => (
            <Card key={index} className="relative group hover:shadow-medium transition-all duration-300">
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="mb-6">
                  <svg className="h-8 w-8 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-accent text-accent" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Results Highlight - only show if results exist */}
                {testimonial.results && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                    <div className="text-sm font-medium text-accent">Key Result:</div>
                    <div className="text-sm text-foreground">{testimonial.results}</div>
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/theme/landingpage/assets/placeholder.svg';
                    }}
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    {testimonial.role && (
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    )}
                    {testimonial.company && (
                      <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    )}
                    {testimonial.location && (
                      <div className="text-xs text-primary font-medium">{testimonial.location}</div>
                    )}
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(TestimonialsSection);
