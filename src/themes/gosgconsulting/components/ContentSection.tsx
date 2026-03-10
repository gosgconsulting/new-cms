import React from 'react';
import { extractPropsFromItems, getHeading, getTextByKey, SchemaItem } from '../utils/schemaHelpers';

interface ContentSectionProps {
  title?: string;
  description?: string;
  content?: string;
  items?: SchemaItem[];
  compact?: boolean;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  description,
  content,
  items,
  compact = false
}) => {
  // Extract props from items if provided
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const finalTitle = title || extractedProps.title || getHeading(items) || '';
  const finalDescription = description || extractedProps.description || getTextByKey(items, 'description') || '';
  const finalContent = content || extractedProps.content || getTextByKey(items, 'content') || '';

  if (!finalTitle && !finalDescription && !finalContent) {
    return (
      <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-muted-foreground">
            <p>No content to display</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
      <div className="container mx-auto max-w-4xl">
        {finalTitle && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{finalTitle}</h2>
        )}
        {finalDescription && (
          <p className="text-lg text-muted-foreground text-center mb-6">{finalDescription}</p>
        )}
        {finalContent && (
          <div 
            className="prose prose-lg max-w-none text-center"
            dangerouslySetInnerHTML={{ __html: finalContent }}
          />
        )}
      </div>
    </section>
  );
};

export default ContentSection;
