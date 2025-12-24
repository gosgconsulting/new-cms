import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import { Component } from "@/types/schema";
import { getHeading, getReviews } from "@/lib/schema-utils";

interface TestimonialsSectionProps {
  data?: Component;
}

const TestimonialsSection = ({ data }: TestimonialsSectionProps = {}) => {
  // Extract data from schema or use defaults
  const title = data ? getHeading(data.items, 2) : "Trusted by Businesses Worldwide";
  const subtitle = data ? getHeading(data.items, 3) : "Local and international businesses trust our ACRA-registered filing agents for 24-hour Singapore company incorporation, professional accounting services, and guaranteed compliance with zero penalties.";
  const reviewItems = data ? getReviews(data.items, "reviews") : [];
  
  // Default testimonials if no data
  const defaultTestimonials = [{
    name: "Sarah Chen",
    role: "Tech Startup Founder",
    company: "InnovateTech Solutions",
    location: "Local Client",
    image: testimonial1,
    rating: 5,
    quote: "ACATR's ACRA-registered filing agents completed our Singapore company incorporation in exactly 24 hours as promised. Their chartered accountants handle all our IRAS compliance and GST filing, giving us complete peace of mind to focus on scaling our tech startup.",
    results: "Singapore company incorporated in 24 hours with 100% ACRA compliance"
  }, {
    name: "Marcus Rodriguez",
    role: "International Entrepreneur",
    company: "Global Trade Partners",
    location: "International Client",
    image: testimonial2,
    rating: 5,
    quote: "As an international business owner, ACATR's Singapore company incorporation services were perfect for remote setup. Their qualified company secretaries ensure 100% ACRA compliance, and we've had zero penalties thanks to their 99% compliance success rate guarantee.",
    results: "International business setup with zero ACRA penalties and perfect compliance"
  }, {
    name: "Lisa Thompson",
    role: "Small Business Owner",
    company: "Artisan Crafts Co.",
    location: "Local Client",
    image: testimonial1,
    rating: 5,
    quote: "ACATR's professional Singapore accounting services transformed our financial management. Their qualified chartered accountants handle all our IRAS compliance and GST filing, saving us over 20 hours monthly while ensuring perfect regulatory compliance.",
    results: "20+ hours saved monthly with 100% IRAS and GST compliance"
  }];

  // Map review items to testimonial format
  const testimonials = reviewItems.length > 0
    ? reviewItems.map((review, index) => ({
        name: review.props.name || "",
        role: review.props.role || "",
        company: review.props.company || "",
        location: review.props.location || "",
        image: review.props.image ? review.props.image : (index % 2 === 0 ? testimonial1 : testimonial2),
        rating: review.props.rating || 5,
        quote: review.props.content || "",
        results: review.props.results || ""
      }))
    : defaultTestimonials;
  const stats = [{
    label: "Client Satisfaction",
    value: "98%"
  }, {
    label: "Average Time Saved",
    value: "15+ hrs/month"
  }, {
    label: "Compliance Success",
    value: "99%"
  }, {
    label: "Business Growth",
    value: "250% avg"
  }];
  return <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {title.includes("Worldwide") ? (
              <>
                {title.split("Worldwide")[0]}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {"Worldwide"}
                </span>
              </>
            ) : (
              title
            )}
          </h2>
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Success Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => <div key={index} className="text-center">
              
              
            </div>)}
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => <Card key={index} className="relative group hover:shadow-medium transition-all duration-300">
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-primary/20" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
                </div>

                {/* Quote */}
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Results Highlight */}
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                  <div className="text-sm font-medium text-accent">Key Result:</div>
                  <div className="text-sm text-foreground">{testimonial.results}</div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    <div className="text-xs text-primary font-medium">{testimonial.location}</div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg" />
              </CardContent>
            </Card>)}
        </div>

        {/* Client Types */}
        
      </div>
    </section>;
};
export default TestimonialsSection;