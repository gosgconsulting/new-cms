import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { extractPropsFromItems, getTextByKey, getButton, SchemaItem } from '../utils/schemaHelpers';

interface NewsletterProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  items?: SchemaItem[];
  compact?: boolean;
}

const Newsletter: React.FC<NewsletterProps> = ({
  title,
  description,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  items,
  compact = false
}) => {
  const [email, setEmail] = useState('');

  // Extract props from items if provided
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const titleItem = items?.find(i => i.key === 'title' && i.type === 'heading');
  const subtitleItem = items?.find(i => i.key === 'subtitle' && i.type === 'heading');
  const placeholderItem = items?.find(i => i.key === 'placeholder' && i.type === 'text');
  const buttonItem = items?.find(i => i.key === 'button' && i.type === 'button');
  
  const finalTitle = title || titleItem?.content || extractedProps.title || getTextByKey(items, 'title') || 'Subscribe to our Newsletter';
  const finalDescription = description || subtitleItem?.content || extractedProps.description || getTextByKey(items, 'description') || 'Stay updated with our latest news and offers.';
  const finalPlaceholder = placeholder || placeholderItem?.content || extractedProps.placeholder || 'Enter your email';
  const button = buttonItem ? { text: buttonItem.content || '', url: buttonItem.link || '' } : getButton(items);
  const finalButtonText = buttonText || button?.text || extractedProps.buttonText || 'Subscribe';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('[testing] Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <section className={`py-12 px-4 ${compact ? 'py-6' : ''} bg-primary/5`}>
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{finalTitle}</h2>
          {finalDescription && (
            <p className="text-muted-foreground">{finalDescription}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" className="whitespace-nowrap">
            {finalButtonText}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
