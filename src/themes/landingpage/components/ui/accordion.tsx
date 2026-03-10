import React, { createContext, useContext, useState } from 'react';

interface AccordionContextType {
  type: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);
const AccordionItemContext = createContext<AccordionItemContextType | undefined>(undefined);

interface AccordionProps {
  type: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  type,
  value: controlledValue,
  defaultValue,
  onValueChange,
  collapsible = false,
  className = '',
  children
}) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (type === 'single' ? '' : [])
  );

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string | string[]) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange, collapsible }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ value, className = '', children }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionItem must be used within Accordion');

  const { type, value: accordionValue } = context;
  
  const isOpen = React.useMemo(() => {
    if (type === 'single') {
      return accordionValue === value;
    } else {
      return (accordionValue as string[]).includes(value);
    }
  }, [type, accordionValue, value]);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div className={className} data-value={value}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ className = '', children }) => {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);
  
  if (!accordionContext) throw new Error('AccordionTrigger must be used within Accordion');
  if (!itemContext) throw new Error('AccordionTrigger must be used within AccordionItem');

  const { type, value, onValueChange } = accordionContext;
  const { value: itemValue, isOpen } = itemContext;
  
  const handleClick = () => {
    if (type === 'single') {
      const currentValue = value as string;
      const newValue = currentValue === itemValue ? '' : itemValue;
      onValueChange?.(newValue);
    } else {
      const currentValue = value as string[];
      const newValue = currentValue.includes(itemValue)
        ? currentValue.filter(v => v !== itemValue)
        : [...currentValue, itemValue];
      onValueChange?.(newValue);
    }
  };

  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between py-4 font-medium transition-all hover:underline text-left ${className}`}
      onClick={handleClick}
      aria-expanded={isOpen}
    >
      {children}
      <svg
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

const AccordionContent: React.FC<AccordionContentProps> = ({ className = '', children }) => {
  const itemContext = useContext(AccordionItemContext);
  
  if (!itemContext) throw new Error('AccordionContent must be used within AccordionItem');

  const { isOpen } = itemContext;

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${className}`}
      style={{ 
        maxHeight: isOpen ? '1000px' : '0px',
        opacity: isOpen ? 1 : 0,
        paddingBottom: isOpen ? '1.5rem' : '0px'
      }}
    >
      <div className="text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
