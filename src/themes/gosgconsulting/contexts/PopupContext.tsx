import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PopupContextType {
  openPopup: (popupName: string, initialEmail?: string) => void;
  closePopup: (popupName: string) => void;
  isOpen: (popupName: string) => boolean;
  contactModalOpen: boolean;
  setContactModalOpen: (open: boolean) => void;
  initialEmail: string | null;
  setInitialEmail: (email: string | null) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [openPopups, setOpenPopups] = useState<Set<string>>(new Set());
  const [initialEmail, setInitialEmail] = useState<string | null>(null);

  const openPopup = (popupName: string, email?: string) => {
    if (popupName === 'contact') {
      if (email) {
        setInitialEmail(email);
      }
      setContactModalOpen(true);
    }
    setOpenPopups(prev => new Set(prev).add(popupName));
  };

  const closePopup = (popupName: string) => {
    if (popupName === 'contact') {
      setContactModalOpen(false);
    }
    setOpenPopups(prev => {
      const next = new Set(prev);
      next.delete(popupName);
      return next;
    });
  };

  const isOpen = (popupName: string) => {
    if (popupName === 'contact') {
      return contactModalOpen;
    }
    return openPopups.has(popupName);
  };

  return (
    <PopupContext.Provider value={{
      openPopup,
      closePopup,
      isOpen,
      contactModalOpen,
      setContactModalOpen,
      initialEmail,
      setInitialEmail,
    }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider');
  }
  return context;
};
