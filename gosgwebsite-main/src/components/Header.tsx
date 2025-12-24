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
import UIHeader01 from "@/components/ui/header-01";

/**
 * WordPress Theme Component: Header
 * 
 * Component: Will be converted to header.php
 * Template Name: Header
 * 
 * Dynamic Elements:
 * - Logo (will be replaced with get_custom_logo or theme option)
 */
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

const Header = ({ onContactClick }: HeaderProps) => {
  // Keep existing states/hooks if needed for future CMS data, but render the new header UI
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

  // Get logo height class from CMS or use default
  const getLogoHeightClass = () => {
    if (headerData?.logo?.height) {
      return headerData.logo.height;
    }
    return 'h-12';
  };

  return (
    // Render the new header design, which is already sticky and separate from hero
    <UIHeader01 onContactClick={onContactClick} />
  );
};

export default Header;