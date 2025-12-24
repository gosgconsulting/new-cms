import { ReactNode } from 'react';

interface SecurityWrapperProps {
  children: ReactNode;
  className?: string;
}

export function SecurityWrapper({ children, className }: SecurityWrapperProps) {

  return (
    <div className={className}>
      {children}
    </div>
  );
}