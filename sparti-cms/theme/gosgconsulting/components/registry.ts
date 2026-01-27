/**
 * Component Registry for Dynamic Page Renderer
 * 
 * This registry maps component types from the schema to actual React components
 */

import HeroSection from './HeroSection';
import HomeHeroSection from './HomeHeroSection';
import ChallengeSection from './ChallengeSection';
import Gallery4Section from './Gallery4Section';
import BlogSection from './BlogSection';
import ContactForm from './ContactForm';
import CTASection from './CTASection';
import AboutSection2 from './ui/about-section-2';
import PricingPage from './ui/pricing-page';
import SimplePricingSection from './SimplePricingSection';
import SimpleTextSection from './SimpleTextSection';
import SimpleListSection from './SimpleListSection';
import SimpleStatsSection from './SimpleStatsSection';
import ResultsCarouselSection from './ResultsCarouselSection';

// Auto-generated component imports
import Accordion from './Accordion';
import Array from './Array';
import AvatarGroup from './AvatarGroup';
import Blog from './Blog';
import ContactFormDialog from './ContactFormDialog';
import ContactModal from './ContactModal';
import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import ModalContactForm from './ModalContactForm';
import Newsletter from './Newsletter';
import Reviews from './Reviews';
import { SEOHead } from './SEOHead';
import Showcase from './Showcase';
import StickyChat from './StickyChat';
import WhatsAppButton from './WhatsAppButton';

// Auto-generated component imports
import AboutSection from './AboutSection';
import BackgroundImage from './BackgroundImage';
import ContactInfo from './ContactInfo';
import ContentSection from './ContentSection';
import FAQAccordion from './FAQAccordion';
import FAQSection from './FAQSection';
import FeaturesSection from './FeaturesSection';
import GallerySection from './GallerySection';
import HeroSectionSimple from './HeroSectionSimple';
import ImageGallery from './ImageGallery';
import IngredientsSection from './IngredientsSection';
import PageTitle from './PageTitle';
import PainPointSection from './PainPointSection';
import ProductGrid from './ProductGrid';
import ResultsSection from './ResultsSection';
import SEO from './SEO';
import SEOExplanation from './SEOExplanation';
import ServicesGrid from './ServicesGrid';
import ServicesSection from './ServicesSection';
import ServicesShowcase from './ServicesShowcase';
import SimpleHeader from './SimpleHeader';
import SimpleHeroBanner from './SimpleHeroBanner';
import SocialMedia from './SocialMedia';
import TeamSection from './TeamSection';
import TestimonialsSection from './TestimonialsSection';
import VideoSection from './VideoSection';
import WhatsIncludedSection from './WhatsIncludedSection';
import WhyChooseUsSection from './WhyChooseUsSection';

// Flowbite components
import FlowbiteWhatsIncludedSectionWrapper from './FlowbiteWhatsIncludedSectionWrapper';

/**
 * Registry of components available for dynamic rendering
 * The keys should match the "type" field in the component schema
 */
export const componentRegistry = {
  // Main components
  HeroSection,
  HomeHeroSection,
  ChallengeSection,
  ResultsCarouselSection,
  Gallery4Section,
  BlogSection,
  ContactForm,
  CTASection,

  // UI components
  AboutSection2,
  PricingPage,

  // Simple components
  SimplePricingSection,
  SimpleTextSection,
  SimpleListSection,
  SimpleStatsSection,

  // Auto-generated components
  Accordion,
  Array,
  AvatarGroup,
  Blog,
  ContactFormDialog,
  ContactModal,
  Content,
  Footer,
  Header,
  ModalContactForm,
  Newsletter,
  Reviews,
  SEOHead,
  Showcase,
  StickyChat,
  WhatsAppButton,
  // Auto-generated components
  AboutSection,
  BackgroundImage,
  ContactInfo,
  ContentSection,
  FAQAccordion,
  FAQSection,
  FeaturesSection,
  GallerySection,
  HeroSectionSimple,
  ImageGallery,
  IngredientsSection,
  PageTitle,
  PainPointSection,
  ProductGrid,
  ResultsSection,
  SEO,
  SEOExplanation,
  ServicesGrid,
  ServicesSection,
  ServicesShowcase,
  SimpleHeader,
  SimpleHeroBanner,
  SocialMedia,
  TeamSection,
  TestimonialsSection,
  VideoSection,
  WhatsIncludedSection,
  WhyChooseUsSection,

  // Flowbite components
  'flowbite-whats-included-section': FlowbiteWhatsIncludedSectionWrapper,
};

export type ComponentRegistryType = typeof componentRegistry;
export type ComponentType = keyof ComponentRegistryType;