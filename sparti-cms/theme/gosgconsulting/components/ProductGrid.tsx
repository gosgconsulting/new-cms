import React from 'react';
import { extractPropsFromItems, getArrayItems, SchemaItem } from '../utils/schemaHelpers';

interface ProductGridProps {
  title?: string;
  products?: Array<{
    id?: string;
    name?: string;
    title?: string;
    description?: string;
    price?: string;
    image?: string;
    imageSrc?: string;
    src?: string;
    url?: string;
    link?: string;
    [key: string]: unknown;
  }>;
  items?: SchemaItem[];
  compact?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  products = [],
  items,
  compact = false
}) => {
  // Extract props from items if provided
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const titleItem = items?.find(i => i.key === 'title' && i.type === 'heading');
  const subtitleItem = items?.find(i => i.key === 'subtitle' && i.type === 'heading');
  const finalTitle = title || titleItem?.content || extractedProps.title || '';
  const finalSubtitle = subtitleItem?.content || extractedProps.subtitle || '';
  
  // Get products from items array if available
  let finalProducts = products;
  if (items && products.length === 0) {
    const productsArray = getArrayItems(items, 'products');
    if (productsArray.length > 0) {
      finalProducts = productsArray.map((item: SchemaItem) => ({
        id: item.key || item.id,
        name: item.content || item.name || item.title,
        title: item.content || item.name || item.title,
        description: item.description || item.text,
        price: item.price,
        image: item.src || item.image || item.imageSrc,
        imageSrc: item.src || item.image || item.imageSrc,
        url: item.link || item.url,
        ...(item.props && typeof item.props === 'object' ? item.props as Record<string, unknown> : {})
      }));
    }
  }

  // If still no products, show placeholder
  if (finalProducts.length === 0) {
    return (
      <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          {finalTitle && (
            <h2 className="text-2xl font-bold text-center mb-6">{finalTitle}</h2>
          )}
          <div className="text-center text-muted-foreground">
            <p>No products to display</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
      <div className="container mx-auto max-w-6xl">
        {(finalTitle || finalSubtitle) && (
          <div className="text-center mb-8">
            {finalTitle && (
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{finalTitle}</h2>
            )}
            {finalSubtitle && (
              <p className="text-muted-foreground">{finalSubtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {finalProducts.slice(0, compact ? 4 : undefined).map((product, index) => (
            <div
              key={product.id || index}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {product.image || product.imageSrc ? (
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image || product.imageSrc}
                    alt={product.name || product.title || `Product ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : null}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name || product.title || `Product ${index + 1}`}</h3>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                )}
                {product.price && (
                  <p className="text-lg font-bold text-primary">{product.price}</p>
                )}
                {(product.url || product.link) && (
                  <a
                    href={product.url || product.link}
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    View Details →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
