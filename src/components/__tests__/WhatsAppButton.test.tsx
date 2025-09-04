import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WhatsAppButton from '../WhatsAppButton';
import { ContactModalProvider } from '@/contexts/ContactModalContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the useContactModal hook
const mockOpenModal = jest.fn();
// Mock window.open for WhatsApp link
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen });

jest.mock('@/contexts/ContactModalContext', () => ({
  useContactModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
    isModalOpen: false,
  }),
  ContactModalProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('WhatsAppButton', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 400, // Set scrollY to show the button
    });
    
    // Mock the scroll event
    window.dispatchEvent(new Event('scroll'));
  });

  it('renders the WhatsApp button when scrolled down', () => {
    render(<WhatsAppButton />);
    
    // The button should be visible after scrolling
    const whatsappButton = screen.getByRole('button');
    expect(whatsappButton).toBeInTheDocument();
  });

  it('opens chat bubble when clicked', () => {
    render(<WhatsAppButton />);
    
    // Click the WhatsApp button
    const whatsappButton = screen.getByRole('button');
    fireEvent.click(whatsappButton);
    
    // Chat bubble should appear
    expect(screen.getByText('Have a question?')).toBeInTheDocument();
    expect(screen.getByText('Chat with us!')).toBeInTheDocument();
    expect(screen.getByText('+65 8024 6850')).toBeInTheDocument();
  });

  it('closes chat bubble when X button is clicked', () => {
    render(<WhatsAppButton />);
    
    // Open chat bubble
    const whatsappButton = screen.getByRole('button');
    fireEvent.click(whatsappButton);
    
    // Chat bubble should appear
    expect(screen.getByText('Have a question?')).toBeInTheDocument();
    
    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Chat bubble should disappear
    expect(screen.queryByText('Have a question?')).not.toBeInTheDocument();
  });

  it('opens contact modal when send button is clicked', () => {
    render(<WhatsAppButton />);
    
    // Open chat bubble
    const whatsappButton = screen.getByRole('button');
    fireEvent.click(whatsappButton);
    
    // Click the send button
    const sendButton = screen.getByRole('button', { name: '' });
    fireEvent.click(sendButton);
    
    // Contact modal should be opened
    expect(mockOpenModal).toHaveBeenCalled();
  });

  it('opens contact modal when Enter key is pressed in input', () => {
    render(<WhatsAppButton />);
    
    // Open chat bubble
    const whatsappButton = screen.getByRole('button');
    fireEvent.click(whatsappButton);
    
    // Press Enter in the input field
    const inputField = screen.getByPlaceholderText('Write your message...');
    fireEvent.keyDown(inputField, { key: 'Enter', code: 'Enter' });
    
    // Contact modal should be opened
    expect(mockOpenModal).toHaveBeenCalled();
  });
  
  it('opens WhatsApp when direct WhatsApp link is clicked', () => {
    render(<WhatsAppButton />);
    
    // Open chat bubble
    const whatsappButton = screen.getByRole('button');
    fireEvent.click(whatsappButton);
    
    // Click the WhatsApp direct link
    const whatsappLink = screen.getByText('Contact us directly on WhatsApp: +65 8024 6850');
    fireEvent.click(whatsappLink);
    
    // WhatsApp should be opened
    expect(mockWindowOpen).toHaveBeenCalledWith('https://wa.me/6580246850', '_blank');
  });
});
