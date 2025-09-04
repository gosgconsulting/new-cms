import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContactModalContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

export const useContactModal = () => {
  const context = useContext(ContactModalContext);
  if (!context) {
    throw new Error('useContactModal must be used within a ContactModalProvider');
  }
  return context;
};

interface ContactModalProviderProps {
  children: ReactNode;
}

export const ContactModalProvider = ({ children }: ContactModalProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ContactModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ContactModalContext.Provider>
  );
};
