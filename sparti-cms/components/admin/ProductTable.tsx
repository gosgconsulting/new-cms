import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ProductStatusBadge from './ProductStatusBadge';

export interface ProductTableRow {
  id: number;
  name: string;
  slug: string;
  status: string;
  image_url: string | null;
  inventory_total: number;
  variant_count: number;
  category_name: string | null;
}

interface ProductTableProps {
  products: ProductTableRow[];
  selectedProducts: number[];
  onSelectProduct: (productId: number) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (productId: number) => void;
  onDelete: (productId: number) => void;
  isLoading?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  const formatInventory = (total: number, variantCount: number) => {
    if (variantCount === 0) {
      return `${total} in stock`;
    } else if (variantCount === 1) {
      return `${total} in stock for 1 variant`;
    } else {
      return `${total} in stock for ${variantCount} variants`;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all products"
                  className={someSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                />
              </TableHead>
              <TableHead className="min-w-[300px]">Product</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-48">Inventory</TableHead>
              <TableHead className="w-48">Category</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <TableRow
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectProduct(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{product.name}</span>
                        <span className="text-sm text-gray-500">/{product.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">
                      {formatInventory(product.inventory_total, product.variant_count)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">
                      {product.category_name || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductTable;
