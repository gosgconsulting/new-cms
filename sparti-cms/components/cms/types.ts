// Section types for CMS components

export interface Section {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  data: Record<string, any>;
  components?: string[];
  fields?: string[];
}

export interface TabData {
  id: string;
  label: string;
  content: any[];
}

export interface ClientLogo {
  id: string;
  name: string;
  image: string;
}

export interface CTAButton {
  id: string;
  text: string;
  url: string;
  isPrimary: boolean;
}

export interface PainPoint {
  title: string;
  icon: string;
  description?: string;
}

export interface ResultItem {
  img: string;
  label: string;
  client?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  highlight?: string;
  description: string;
  buttonText?: string;
  buttonUrl?: string;
  images?: string[];
}

export interface SEOService {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
  company?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  url: string;
  date: string;
  author: string;
}

export interface ContactLink {
  text: string;
  url: string;
  icon?: string;
}

export interface LegalLink {
  text: string;
  url: string;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
  icon: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
}

export interface StatItem {
  value: string;
  label: string;
  icon: string;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}
