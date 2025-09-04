import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactHero } from '../ContactHero';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useMotionValue: () => ({ set: jest.fn() }),
  useMotionTemplate: () => 'test-template',
  animate: jest.fn(),
}));

// Mock scroll behavior
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: mockScrollIntoView,
});

describe('ContactHero', () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it('renders the contact hero title', () => {
    render(<ContactHero />);
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });

  it('has proper padding for transparent header', () => {
    render(<ContactHero />);
    const heroSection = screen.getByText('Get In Touch').closest('section');
    expect(heroSection).toHaveClass('pt-32');
  });

  it('renders the contact description', () => {
    render(<ContactHero />);
    expect(screen.getByText(/Have questions about our services/)).toBeInTheDocument();
  });

  it('renders the contact us badge', () => {
    render(<ContactHero />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders the contact button', () => {
    render(<ContactHero />);
    expect(screen.getByText('Contact Us Now')).toBeInTheDocument();
  });

  it('scrolls to form when button is clicked', () => {
    // Create a mock element with the contact-form id
    const mockElement = document.createElement('div');
    mockElement.id = 'contact-form';
    document.body.appendChild(mockElement);

    render(<ContactHero />);
    
    const button = screen.getByText('Contact Us Now');
    fireEvent.click(button);

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    // Clean up
    document.body.removeChild(mockElement);
  });

  it('handles missing form element gracefully', () => {
    render(<ContactHero />);
    
    const button = screen.getByText('Contact Us Now');
    
    // Should not throw error when element doesn't exist
    expect(() => fireEvent.click(button)).not.toThrow();
  });
});
