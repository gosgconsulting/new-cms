import React from 'react';
import './theme.css';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
}

/**
 * Theme landing page component
 * This is a simple, customizable landing page that can be used as a starting point
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Theme', 
  tenantSlug = 'landingpage' 
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <a href={`/theme/${tenantSlug}`} className="flex items-center z-10">
              <span className="h-12 inline-flex items-center font-bold text-xl">
                {tenantName}
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a 
                href={`/theme/${tenantSlug}/about`} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <a 
                href={`/theme/${tenantSlug}/contact`} 
                className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Contact Us
              </a>
            </nav>
            <a 
              href={`/theme/${tenantSlug}/contact`} 
              className="md:hidden bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm"
            >
              Contact
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 pt-28 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background text-center">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium border border-primary/20 text-primary bg-primary/5 rounded-full">
                Welcome to {tenantName}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Your Journey Starts Here
              </span>
              <br />
              <span className="text-foreground">
                Building Something Amazing
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              This is a template landing page for {tenantName}. Customize it to match your brand and needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`/theme/${tenantSlug}/contact`}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-lg shadow hover:shadow-md transition-all"
              >
                Get Started
              </a>
              <a 
                href={`/theme/${tenantSlug}/about`}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover what makes {tenantName} the right choice for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-xl mb-2">Feature One</h3>
            <p className="text-muted-foreground">
              Description of your first key feature or benefit.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-xl mb-2">Feature Two</h3>
            <p className="text-muted-foreground">
              Description of your second key feature or benefit.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-xl mb-2">Feature Three</h3>
            <p className="text-muted-foreground">
              Description of your third key feature or benefit.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join us today and experience the difference.
          </p>
          <a 
            href={`/theme/${tenantSlug}/contact`}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Contact Us Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {tenantName}
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Building something amazing, one step at a time.
              </p>
            </div>
            <div className="lg:text-right">
              <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="space-y-3">
                <a 
                  href={`/theme/${tenantSlug}`}
                  className="block text-xl text-white hover:text-primary transition-colors"
                >
                  Home
                </a>
                <a 
                  href={`/theme/${tenantSlug}/about`}
                  className="block text-xl text-white hover:text-primary transition-colors"
                >
                  About
                </a>
                <a 
                  href={`/theme/${tenantSlug}/contact`}
                  className="block text-xl text-white hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {tenantName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TenantLanding;

