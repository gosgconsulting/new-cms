import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProductStatusBadgeProps {
  status: string;
}

const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
        };
      case 'draft':
        return {
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
        };
      case 'archived':
        return {
          label: 'Archived',
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default ProductStatusBadge;
