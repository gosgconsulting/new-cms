import React from 'react';
import { extractPropsFromItems, getArrayItems, getImage, SchemaItem } from '../utils/schemaHelpers';

interface ShowcaseProps {
  title?: string;
  description?: string;
  items?: Array<{
    title?: string;
    description?: string;
    image?: string;
    imageSrc?: string;
    src?: string;
    [key: string]: unknown;
  }>;
  itemsSchema?: SchemaItem[];
  compact?: boolean;
}

const Showcase: React.FC<ShowcaseProps> = ({
  title,
  description,
  items = [],
  itemsSchema,
  compact = false
}) => {
  // Extract props from items if provided
  const extractedProps = itemsSchema ? extractPropsFromItems(itemsSchema) : {};
  const finalTitle = title || extractedProps.title || '';
  const finalDescription = description || extractedProps.description || '';

  // Get showcase items from items array if available
  let finalItems = items;
  if (itemsSchema && items.length === 0) {
    // Look for array items with key 'items' (common pattern)
    const itemsArray = getArrayItems(itemsSchema, 'items');
    if (itemsArray.length > 0) {
      finalItems = itemsArray.map((item: SchemaItem) => ({
        title: item.content || item.title || item.name,
        description: item.description || item.text,
        image: item.src || item.image || item.imageSrc,
        imageSrc: item.src || item.image || item.imageSrc,
        url: item.link || item.url,
        link: item.link || item.url,
        ...(item.props && typeof item.props === 'object' ? item.props as Record<string, unknown> : {})
      }));
    } else {
      // Try showcase key
      const showcaseArray = getArrayItems(itemsSchema, 'showcase');
      if (showcaseArray.length > 0) {
        finalItems = showcaseArray.map((item: SchemaItem) => ({
          title: item.content || item.title || item.name,
          description: item.description || item.text,
          image: item.src || item.image || item.imageSrc,
          imageSrc: item.src || item.image || item.imageSrc,
          url: item.link || item.url,
          link: item.link || item.url,
          ...(item.props && typeof item.props === 'object' ? item.props as Record<string, unknown> : {})
        }));
      } else {
        // Try to extract from main items
        const image = getImage(itemsSchema);
        if (image || finalTitle) {
          finalItems = [{
            title: finalTitle,
            description: finalDescription,
            image: image?.src,
            imageSrc: image?.src
          }];
        }
      }
    }
  }

  if (finalItems.length === 0 && !finalTitle) {
    return (
      <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-muted-foreground">
            <p>No showcase content to display</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
      <div className="container mx-auto max-w-6xl">
        {finalTitle && (
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{finalTitle}</h2>
            {finalDescription && (
              <p className="text-muted-foreground max-w-2xl mx-auto">{finalDescription}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalItems.slice(0, compact ? 3 : undefined).map((item, index) => {
            const content = (
              <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {(item.image || item.imageSrc) && (
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={item.image || item.imageSrc}
                      alt={item.title || `Showcase ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  {item.title && (
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </div>
            );

            if (item.url || item.link) {
              const linkUrl = typeof item.url === 'string' ? item.url : typeof item.link === 'string' ? item.link : undefined;
              if (linkUrl) {
                return (
                  <a key={index} href={linkUrl} className="block">
                    {content}
                  </a>
                );
              }
            }

            return <div key={index}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
};

export default Showcase;
