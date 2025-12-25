import React from 'react';
import { extractPropsFromItems, getTextByKey, SchemaItem } from '../utils/schemaHelpers';

interface ContentProps {
  content?: string;
  text?: string;
  items?: SchemaItem[];
  compact?: boolean;
}

const Content: React.FC<ContentProps> = ({
  content,
  text,
  items,
  compact = false
}) => {
  // Extract props from items if provided
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const finalContent = content || text || extractedProps.content || extractedProps.text || getTextByKey(items, 'content') || getTextByKey(items, 'text') || '';

  if (!finalContent) {
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
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: finalContent }}
        />
      </div>
    </section>
  );
};

export default Content;
