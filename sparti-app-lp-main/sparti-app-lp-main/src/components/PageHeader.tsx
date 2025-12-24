import { ReactNode } from 'react';
import { useCopilot } from '@/contexts/CopilotContext';
import SidebarBrandDropdown from '@/components/SidebarBrandDropdown';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  hideBrandSelector?: boolean;
}

export const PageHeader = ({ title, description, actions, hideBrandSelector = false }: PageHeaderProps) => {
  const { selectedCopilot, selectedBrand } = useCopilot();

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Brand selector - only show when copilot is selected AND brand is selected AND not explicitly hidden */}
          {selectedCopilot && selectedBrand && !hideBrandSelector && (
            <div className="w-48">
              <SidebarBrandDropdown />
            </div>
          )}
          
          {actions && (
            <div>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
