import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogPostHero } from '../BlogPostHero';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useMotionValue: () => ({ set: jest.fn() }),
  useMotionTemplate: () => 'test-template',
  animate: jest.fn(),
}));

// Mock react-scroll
jest.mock('react-scroll', () => ({
  Link: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

describe('BlogPostHero', () => {
  const mockHeadings = [
    { id: 'heading-1', text: 'Introduction', level: 2 },
    { id: 'heading-2', text: 'Main Content', level: 2 },
    { id: 'heading-3', text: 'Subsection', level: 3 },
  ];

  const mockTitle = 'Test Blog Post Title';

  it('renders the blog post title', () => {
    render(<BlogPostHero title={mockTitle} headings={mockHeadings} />);
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
  });

  it('renders table of contents with headings', () => {
    render(<BlogPostHero title={mockTitle} headings={mockHeadings} />);
    
    expect(screen.getByText('Table of Contents')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Subsection')).toBeInTheDocument();
  });

  it('renders blog post badge', () => {
    render(<BlogPostHero title={mockTitle} headings={mockHeadings} />);
    expect(screen.getByText('Blog Post')).toBeInTheDocument();
  });
});
