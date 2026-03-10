import React from 'react';
import { extractPropsFromItems, getHeading, getTextByKey, SchemaItem } from '../utils/schemaHelpers';

interface PageTitleProps {
  title?: string;
  subtitle?: string;
  description?: string;
  items?: SchemaItem[];
  compact?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  description,
  items,
  compact = false
}) => {
  // Extract props from items if provided
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const finalTitle = title || extractedProps.title || getHeading(items) || getTextByKey(items, 'title') || '';
  const finalSubtitle = subtitle || extractedProps.subtitle || getTextByKey(items, 'subtitle') || '';
  const finalDescription = description || extractedProps.description || getTextByKey(items, 'description') || '';

  if (!finalTitle) {
    return (
      <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-muted-foreground">
            <p>No title to display</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{finalTitle}</h1>
        {finalSubtitle && (
          <h2 className="text-xl md:text-2xl text-muted-foreground mb-4">{finalSubtitle}</h2>
        )}
        {finalDescription && (
          <p className="text-lg text-muted-foreground">{finalDescription}</p>
        )}
      </div>
    </section>
  );
};

export default PageTitle;
