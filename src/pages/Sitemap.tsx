import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Globe, 
  Search, 
  Target, 
  Users, 
  BarChart3, 
  Mail, 
  FileText, 
  Map,
  ExternalLink
} from "lucide-react";

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  description: string;
  pages: {
    title: string;
    path: string;
    description?: string;
    isExternal?: boolean;
  }[];
}

const sitemapData: SitemapSection[] = [
  {
    title: "Main Pages",
    icon: <Home className="w-5 h-5" />,
    description: "Core website pages and homepage",
    pages: [
      {
        title: "Homepage",
        path: "/",
        description: "Main landing page with SEO services overview"
      }
    ]
  },
  {
    title: "Services",
    icon: <Target className="w-5 h-5" />,
    description: "Our comprehensive digital marketing services",
    pages: [
      {
        title: "SEO Services",
        path: "/services/seo",
        description: "Search Engine Optimization for Singapore businesses"
      },
      {
        title: "Website Design",
        path: "/services/website-design",
        description: "Professional website design and development"
      },
      {
        title: "Paid Advertising",
        path: "/services/paid-ads",
        description: "Google Ads and social media advertising"
      },
      {
        title: "Social Media Marketing",
        path: "/services/social-media",
        description: "Social media strategy and management"
      },
      {
        title: "Analytics & Reporting",
        path: "/services/reporting",
        description: "Performance tracking and detailed reporting"
      }
    ]
  },
  {
    title: "Blog",
    icon: <FileText className="w-5 h-5" />,
    description: "SEO insights, tips, and industry updates",
    pages: [
      {
        title: "Blog Home",
        path: "/blog",
        description: "Latest SEO articles and insights"
      },
      {
        title: "Google Ads Management Singapore",
        path: "/blog/google-ads-management-singapore-insights-for-singapore-businesses",
        description: "Insights for Singapore businesses on Google Ads"
      },
      {
        title: "SEO Agency Singapore",
        path: "/blog/seo-agency-singapore-strategies-for-singapore-businesses",
        description: "Strategies for Singapore businesses"
      },
      {
        title: "Strategic SEO Content Writing",
        path: "/blog/strategic-seo-content-writing-amplifying-singapore-business-success-through-integrated-campaigns",
        description: "Amplifying Singapore business success"
      }
    ]
  },
  {
    title: "Contact & Support",
    icon: <Mail className="w-5 h-5" />,
    description: "Get in touch with our team",
    pages: [
      {
        title: "Contact Us",
        path: "/contact",
        description: "Contact form and business information"
      }
    ]
  },
  {
    title: "External Resources",
    icon: <ExternalLink className="w-5 h-5" />,
    description: "External links and resources",
    pages: [
      {
        title: "WordPress Blog CMS",
        path: "https://cms.gosgconsulting.com/",
        description: "WordPress content management system",
        isExternal: true
      },
      {
        title: "XML Sitemap",
        path: "/sitemap.xml",
        description: "Machine-readable sitemap for search engines",
        isExternal: true
      }
    ]
  }
];

const Sitemap = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-32">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Map className="w-8 h-8 mr-3 text-brandPurple" />
              <h1 className="text-4xl font-bold">Site Map</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Navigate through all pages and sections of GOSG Consulting's website. 
              Find the information you need quickly and easily.
            </p>
          </motion.div>

          {/* Sitemap Sections */}
          <div className="space-y-8">
            {sitemapData.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-brandPurple/5 to-brandTeal/5 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-brandPurple/10 rounded-lg">
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {section.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {section.pages.length} page{section.pages.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.pages.map((page, pageIndex) => (
                        <motion.div
                          key={page.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: pageIndex * 0.05 }}
                          className="group"
                        >
                          {page.isExternal ? (
                            <a
                              href={page.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-4 rounded-lg border border-gray-200 hover:border-brandPurple/30 hover:bg-brandPurple/5 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-brandPurple transition-colors duration-300">
                                  {page.title}
                                </h3>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brandPurple flex-shrink-0 ml-2" />
                              </div>
                              {page.description && (
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                  {page.description}
                                </p>
                              )}
                              <div className="mt-2 text-xs text-brandPurple/70 font-mono break-all">
                                {page.path}
                              </div>
                            </a>
                          ) : (
                            <Link
                              to={page.path}
                              className="block p-4 rounded-lg border border-gray-200 hover:border-brandPurple/30 hover:bg-brandPurple/5 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-brandPurple transition-colors duration-300">
                                  {page.title}
                                </h3>
                                <div className="w-4 h-4 text-gray-400 group-hover:text-brandPurple flex-shrink-0 ml-2">
                                  →
                                </div>
                              </div>
                              {page.description && (
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                  {page.description}
                                </p>
                              )}
                              <div className="mt-2 text-xs text-brandPurple/70 font-mono">
                                {page.path}
                              </div>
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Footer Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 p-6 bg-gray-50 rounded-xl"
          >
            <div className="text-center">
              <h3 className="font-semibold mb-2">Need Help Finding Something?</h3>
              <p className="text-muted-foreground mb-4">
                If you can't find what you're looking for, feel free to contact us directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/contact"
                  className="bg-gradient-to-r from-brandPurple to-brandTeal text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Contact Us
                </Link>
                <Link
                  to="/"
                  className="text-brandPurple hover:text-brandTeal font-semibold px-6 py-2 rounded-lg hover:bg-brandPurple/5 transition-colors duration-300"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </motion.div>

          {/* SEO Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            <p>
              Last updated: December 26, 2024 | 
              <a 
                href="/sitemap.xml" 
                className="ml-1 text-brandPurple hover:text-brandTeal underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                XML Sitemap
              </a>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sitemap;
