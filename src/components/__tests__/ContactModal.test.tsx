import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactModal from '../ContactModal';
import { ContactModalProvider } from '@/contexts/ContactModalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-tenant' }, error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ContactModalProvider>
      {children}
    </ContactModalProvider>
  </QueryClientProvider>
);

describe('ContactModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockToast.mockClear();
  });

  it('renders when open', () => {
    render(
      <TestWrapper>
        <ContactModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
    expect(screen.getByText(/Have questions about our services/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <ContactModal isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.queryByText('Get In Touch')).not.toBeInTheDocument();
  });

  it('calls onClose when X button is clicked', () => {
    render(
      <TestWrapper>
        <ContactModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <TestWrapper>
        <ContactModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Find the backdrop (first div with fixed positioning)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('submits form with valid data', async () => {
    render(
      <TestWrapper>
        <ContactModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Test message' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Wait for success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Message sent!',
        description: "We'll get back to you within 24 hours.",
      });
    });
  });

  it('shows required validation for empty fields', () => {
    render(
      <TestWrapper>
        <ContactModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(messageInput).toBeRequired();
  });
});
