import { HeroLanding } from "@/components/ui/hero-1";
import type { HeroLandingProps } from "@/components/ui/hero-1";

export default function HeroLandingDemo() {
  // Example with all customization props
  const heroProps: HeroLandingProps = {
    // Logo and branding
    logo: {
      src: "/lovable-uploads/d6e7a1ca-229a-4c34-83fc-e9bdf106b683.png",
      alt: "GO SG Logo",
      companyName: "GO SG"
    },
    
    // Navigation
    navigation: [
      { name: 'Services', href: '/services' },
      { name: 'Results', href: '/#results' },
      { name: 'About', href: '/#about' },
      { name: 'Contact', href: '/contact' },
    ],
    loginText: "Client Login",
    loginHref: "/auth",
    
    // Hero content
    title: "Grow Your Business with Data-Driven Marketing",
    description: "We help businesses achieve measurable growth through integrated digital marketing solutions that deliver real results.",
    
    // Announcement banner
    announcementBanner: {
      text: "🎉 New case study released!",
      linkText: "See how we helped Smooy Frozen Yogurt",
      linkHref: "/#case-studies"
    },
    
    // Call to action buttons
    callToActions: [
      { 
        text: "Book a Meeting", 
        href: "https://calendly.com/gosgconsulting/oliver-shih", 
        variant: "primary" 
      },
      { 
        text: "See Results", 
        href: "/#results", 
        variant: "secondary" 
      }
    ],
    
    // Styling options
    titleSize: "large",
    gradientColors: {
      from: "oklch(0.7 0.15 280)", // Purple
      to: "oklch(0.6 0.2 320)"    // Magenta
    },
    
    // Additional customization
    className: "min-h-screen"
  }

  return (
    <div>
      <HeroLanding {...heroProps} />
    </div>
  )
}