import { Link } from "react-router-dom";
import { Calendar, Phone, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { fetchSiteSchema } from "@/services/api";

/**
 * WordPress Theme Component: Footer
 * 
 * Component: Will be converted to footer.php
 * Template Name: Footer
 * 
 * Dynamic Elements:
 * - Footer widgets/menus (will use WordPress widget areas)
 * - Copyright text (will use dynamic year and site name)
 * - Social links (will come from theme options)
 */
interface FooterProps {
  onContactClick?: () => void;
}

interface FooterSection1 {
  section_1: {
    id: string;
    title: string;
    subtitle: string;
    button: {
      label: string;
      link: string;
    };
  };
}

interface FooterSchema {
  sections: Array<FooterSection1>;
  copyright: string;
  legalLinks: Array<{
    id: string;
    label: string;
    link: string;
  }>;
  blog: {
    id: string;
    label: string;
    link: string;
  };
}

const Footer = ({ onContactClick }: FooterProps) => {
  const [footerData, setFooterData] = useState<FooterSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        setLoading(true);
        const response = await fetchSiteSchema('footer');
        setFooterData(response.data as FooterSchema);
        setError(null);
      } catch (err) {
        console.error('Error loading footer data:', err);
        setError('Failed to load footer data');
      } finally {
        setLoading(false);
      }
    };

    loadFooterData();
  }, []);

  return (
    <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          
          {/* Bottom Bar - Legal Links */}
          <div className="pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
                {footerData?.legalLinks?.map((link) => (
                  <a 
                    key={link.id} 
                    href={link.link} 
                    className="hover:text-brandTeal transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                {footerData?.blog && (
                  <Link 
                    to={footerData.blog.link} 
                    className="hover:text-brandTeal transition-colors"
                  >
                    {footerData.blog.label}
                  </Link>
                )}
              </div>
              
              <p className="text-sm text-gray-400">
                {footerData?.copyright || `© ${new Date().getFullYear()} GO SG CONSULTING. All rights reserved.`}
              </p>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default Footer;