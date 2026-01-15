import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Copy, Download, X, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ProductJsonViewerProps {
  productId: number;
  productSlug: string;
  currentTenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductJsonViewer({
  productId,
  productSlug,
  currentTenantId,
  open,
  onOpenChange,
}: ProductJsonViewerProps) {
  const [copied, setCopied] = useState(false);

  // Fetch complete product data including variants
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product-full-data', productId, productSlug, currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }

      // Fetch product - this will return WooCommerce data if available
      const productResponse = await api.get(
        `/api/shop/products/${productId}`,
        { tenantId: currentTenantId }
      );

      if (!productResponse.ok) {
        throw new Error('Failed to fetch product');
      }

      const productResult = await productResponse.json();
      const product = productResult.data || {};
      const source = productResult.source || 'local';

      // Fetch variants (if not already included in WooCommerce product)
      let variants = [];
      if (source === 'woocommerce' && product.variations) {
        // WooCommerce product already includes variations
        variants = product.variations || [];
      } else {
        // Fetch variants separately for local products
        try {
          const identifier = productSlug || productId;
          const variantsResponse = await api.get(
            `/api/shop/products/${identifier}/variants`,
            { tenantId: currentTenantId }
          );
          if (variantsResponse.ok) {
            const variantsResult = await variantsResponse.json();
            variants = variantsResult.data || [];
          }
        } catch (e) {
          console.warn('[testing] Could not fetch variants:', e);
        }
      }

      // Combine all data
      const fullData = {
        product,
        variants: source === 'woocommerce' ? product.variations || [] : variants,
        metadata: {
          fetched_at: new Date().toISOString(),
          tenant_id: currentTenantId,
          source: source,
          product_id: productId,
          product_slug: productSlug,
        },
        // Include all WooCommerce fields if available
        ...(source === 'woocommerce' ? {
          woocommerce_data: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            permalink: product.permalink,
            type: product.type,
            status: product.status,
            featured: product.featured,
            catalog_visibility: product.catalog_visibility,
            description: product.description,
            short_description: product.short_description,
            sku: product.sku,
            price: product.price,
            regular_price: product.regular_price,
            sale_price: product.sale_price,
            date_on_sale_from: product.date_on_sale_from,
            date_on_sale_to: product.date_on_sale_to,
            on_sale: product.on_sale,
            purchasable: product.purchasable,
            total_sales: product.total_sales,
            virtual: product.virtual,
            downloadable: product.downloadable,
            downloads: product.downloads,
            download_limit: product.download_limit,
            download_expiry: product.download_expiry,
            external_url: product.external_url,
            button_text: product.button_text,
            tax_status: product.tax_status,
            tax_class: product.tax_class,
            manage_stock: product.manage_stock,
            stock_quantity: product.stock_quantity,
            stock_status: product.stock_status,
            backorders: product.backorders,
            backorders_allowed: product.backorders_allowed,
            backordered: product.backordered,
            sold_individually: product.sold_individually,
            weight: product.weight,
            dimensions: product.dimensions,
            shipping_required: product.shipping_required,
            shipping_taxable: product.shipping_taxable,
            shipping_class: product.shipping_class,
            shipping_class_id: product.shipping_class_id,
            reviews_allowed: product.reviews_allowed,
            average_rating: product.average_rating,
            rating_count: product.rating_count,
            related_ids: product.related_ids,
            upsell_ids: product.upsell_ids,
            cross_sell_ids: product.cross_sell_ids,
            parent_id: product.parent_id,
            purchase_note: product.purchase_note,
            categories: product.categories,
            tags: product.tags,
            images: product.images,
            attributes: product.attributes,
            default_attributes: product.default_attributes,
            variations: product.variations,
            grouped_products: product.grouped_products,
            menu_order: product.menu_order,
            meta_data: product.meta_data,
            date_created: product.date_created,
            date_created_gmt: product.date_created_gmt,
            date_modified: product.date_modified,
            date_modified_gmt: product.date_modified_gmt,
          }
        } : {}),
      };

      return fullData;
    },
    enabled: open && !!currentTenantId,
    retry: 1,
  });

  const jsonString = productData ? JSON.stringify(productData, null, 2) : '';

  const handleCopy = async () => {
    if (jsonString) {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (jsonString) {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-${productId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Product Data (JSON)</DialogTitle>
          <DialogDescription>
            Complete product data including variants fetched from API
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!jsonString || copied}
              >
                {copied ? (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!jsonString}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto border rounded-md bg-gray-50 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading product data...</span>
              </div>
            ) : error ? (
              <div className="text-red-600 p-4">
                <p className="font-semibold">Error loading product data:</p>
                <p className="text-sm mt-1">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            ) : jsonString ? (
              <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-words">
                {jsonString}
              </pre>
            ) : (
              <div className="text-gray-500 p-4">No data available</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
