/**
 * GO SG Brand Design System Components
 * 
 * This file contains standardized components following the GO SG brand guidelines.
 * All components use semantic design tokens from the design system.
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Brand Logo Component
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

export const GOSGLogo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  if (variant === 'icon') {
    return (
      <div className={cn(
        "bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-primary-foreground font-bold",
        sizeClasses[size],
        sizeClasses[size].replace('h-', 'w-'),
        className
      )}>
        <span className="text-lg">G</span>
      </div>
    );
  }

  return (
    <img 
      src="/lovable-uploads/d2d7d623-f729-433e-b350-0e40b4a32b91.png" 
      alt="GO SG CONSULTING Logo" 
      className={cn(sizeClasses[size], className)}
    />
  );
};

// Brand Button Components
interface BrandButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const GOSGButton: React.FC<BrandButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl",
    outline: "border border-border bg-surface hover:bg-surface-variant text-on-surface"
  };
  
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
    xl: "h-12 px-8 py-6 text-base"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Brand Gradient Text
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export const GOSGGradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className 
}) => {
  return (
    <span className={cn(
      "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold",
      className
    )}>
      {children}
    </span>
  );
};

// Brand Card
interface BrandCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export const GOSGCard: React.FC<BrandCardProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const variantClasses = {
    default: "bg-card text-card-foreground border border-border",
    elevated: "bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl transition-shadow",
    outlined: "bg-surface text-on-surface border-2 border-primary/20 hover:border-primary/40 transition-colors"
  };

  return (
    <div className={cn(
      "rounded-xl p-6",
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
};

// Brand Section Badge
interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const GOSGSectionBadge: React.FC<SectionBadgeProps> = ({
  children,
  className
}) => {
  return (
    <span className={cn(
      "inline-block py-1 px-3 mb-4 bg-accent/20 text-accent text-sm font-medium rounded-full uppercase tracking-wider",
      className
    )}>
      {children}
    </span>
  );
};