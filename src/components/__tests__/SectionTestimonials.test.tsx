import React from 'react';
import { render, screen } from '@testing-library/react';
import SectionTestimonials from '../SectionTestimonials';

// Mock the TestimonialsColumn component
jest.mock('@/components/ui/testimonials-columns-1', () => ({
  TestimonialsColumn: ({ testimonials, className }: any) => (
    <div data-testid="testimonials-column" className={className}>
      {testimonials.map((t: any, i: number) => (
        <div key={i} data-testid="testimonial-item">
          <div>{t.text}</div>
          <div>{t.name}</div>
          <div>{t.role}</div>
        </div>
      ))}
    </div>
  )
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('SectionTestimonials', () => {
  it('renders SEM testimonials correctly', () => {
    render(<SectionTestimonials category="sem" />);
    
    expect(screen.getByText('What our clients say about Search Engine Marketing')).toBeInTheDocument();
    expect(screen.getByText('Client Success')).toBeInTheDocument();
    expect(screen.getByText('Real results from real businesses')).toBeInTheDocument();
    
    // Should have 3 testimonial columns (1 visible on mobile, 2 more for larger screens)
    expect(screen.getAllByTestId('testimonials-column').length).toBe(3);
  });

  it('renders SMA testimonials correctly', () => {
    render(<SectionTestimonials category="sma" />);
    
    expect(screen.getByText('What our clients say about Social Media Advertising')).toBeInTheDocument();
  });

  it('renders SEO testimonials correctly', () => {
    render(<SectionTestimonials category="seo" />);
    
    expect(screen.getByText('What our clients say about Search Engine Optimization')).toBeInTheDocument();
  });

  it('renders Technology testimonials correctly', () => {
    render(<SectionTestimonials category="technology" />);
    
    expect(screen.getByText('What our clients say about our Tech Services')).toBeInTheDocument();
  });

  it('applies custom background color', () => {
    const { container } = render(<SectionTestimonials category="sem" bgColor="bg-custom-color" />);
    
    // Check if the section has the custom background class
    expect(container.firstChild).toHaveClass('bg-custom-color');
  });
});
