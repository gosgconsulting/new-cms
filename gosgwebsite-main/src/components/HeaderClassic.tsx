import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import gosgLogo from "@/assets/go-sg-logo-official.png";
import { useEffect, useState } from "react";
import { fetchSiteSchema } from "@/services/api";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  onContactClick?: () => void;
}

interface HeaderSchema {
  logo: {
    src: string;
    alt: string;
    height: string;
  };
  button: {
    label: string;
    link: string;
  };
}

const HeaderClassic = ({ onContactClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerData, setHeaderData] = useState<HeaderSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        setLoading(true);
        const response = await fetchSiteSchema('header');
        setHeaderData(response.data as HeaderSchema);
        setError(null);
      } catch (err) {
        console.error('Error loading header data:', err);
        setError('Failed to load header data');
      } finally {
        setLoading(false);
      }
    };

    loadHeaderData();
  }, []);

  const getLogoHeightClass = () => {
    if (headerData?.logo?.height) {
      return headerData.logo.height;
    }
    return 'h-12';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 backdrop-blur-md transition-all duration-300 ${
      isScrolled ? 'bg-background/95 shadow-sm border-b border-border' : 'bg-transparent'
    }`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center z-10">
            <img 
              src={headerData?.logo?.src || gosgLogo} 
              alt={headerData?.logo?.alt || "GO SG Digital Marketing Agency"} 
              className={`${getLogoHeightClass()} w-auto`}
            />
          </Link>

          {/* Contact Us Button - Desktop Only */}
          <Button 
            onClick={onContactClick}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
          >
            <span>Learn More</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          {/* Mobile Contact Button */}
          <Button 
            onClick={onContactClick}
            className="md:hidden flex items-center gap-1 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <span>Learn More</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeaderClassic;