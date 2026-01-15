import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Variant = {
  id: number;
  sku: string | null;
  title: string;
  price: number | string;
  compare_at_price: number | string | null;
  inventory_quantity: number;
  inventory_management: boolean;
};

interface ProductVariantTableProps {
  productId: number;
  productSlug: string;
  variants: Variant[];
  currentTenantId: string;
}

const formatMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return `$${num.toFixed(2)}`;
};

const ProductVariantTable: React.FC<ProductVariantTableProps> = ({ variants }) => {
  if (!variants || variants.length === 0) {
    return <div className="text-sm text-muted-foreground">No variants available.</div>;
  }

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-2">Variants</div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Compare at</TableHead>
              <TableHead className="text-right">Inventory</TableHead>
              <TableHead className="text-center">Manage Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => {
              const price = typeof v.price === 'string' ? parseFloat(v.price) : v.price;
              const comparePrice = v.compare_at_price !== null && v.compare_at_price !== undefined
                ? (typeof v.compare_at_price === 'string' ? parseFloat(v.compare_at_price) : v.compare_at_price)
                : null;

              return (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.id}</TableCell>
                  <TableCell>{v.title}</TableCell>
                  <TableCell className="font-mono text-xs">{v.sku || '-'}</TableCell>
                  <TableCell className="text-right">{formatMoney(price)}</TableCell>
                  <TableCell className="text-right">
                    {comparePrice && comparePrice > (price || 0) ? formatMoney(comparePrice) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{v.inventory_management ? v.inventory_quantity : '-'}</TableCell>
                  <TableCell className="text-center">{v.inventory_management ? '✓' : ''}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductVariantTable;