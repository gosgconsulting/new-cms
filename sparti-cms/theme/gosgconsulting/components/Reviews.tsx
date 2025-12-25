import React from 'react';
import { extractPropsFromItems, getArrayItems, SchemaItem } from '../utils/schemaHelpers';

interface ReviewItem {
  id?: string;
  name?: string;
  author?: string;
  role?: string;
  text?: string;
  content?: string;
  rating?: number;
  image?: string;
  imageSrc?: string;
  src?: string;
  [key: string]: unknown;
}

interface ReviewsProps {
  title?: string;
  reviews?: ReviewItem[];
  items?: SchemaItem[];
  compact?: boolean;
}

const Reviews: React.FC<ReviewsProps> = ({
  title,
  reviews = [],
  items,
  compact = false
}) => {
  // Extract props from items if provided
  const extractedProps = items ? extractPropsFromItems(items) : {};
  const finalTitle = title || extractedProps.title || '';

  // Get reviews from items array if available
  let finalReviews = reviews;
  if (items && reviews.length === 0) {
    const reviewsArray = getArrayItems(items, 'reviews');
    if (reviewsArray.length > 0) {
      finalReviews = reviewsArray.map((item: SchemaItem) => {
        // Handle review items that have props (like Moski B2B structure)
        if (item.props && typeof item.props === 'object') {
          return {
            id: item.id || item.key,
            name: item.props.name || item.name || item.author,
            author: item.props.name || item.name || item.author,
            role: item.props.title || item.role || item.position,
            text: item.props.content || item.text || item.content || item.description,
            content: item.props.content || item.text || item.content || item.description,
            rating: item.props.rating || item.rating || item.stars || 5,
            image: item.src || item.image || item.imageSrc,
            imageSrc: item.src || item.image || item.imageSrc,
          };
        }
        // Handle standard review items
        return {
          id: item.key || item.id,
          name: item.name || item.author || item.content,
          author: item.name || item.author || item.content,
          role: item.role || item.position,
          text: item.text || item.content || item.description,
          content: item.text || item.content || item.description,
          rating: item.rating || item.stars || 5,
          image: item.src || item.image || item.imageSrc,
          imageSrc: item.src || item.image || item.imageSrc,
        };
      });
    }
  }

  if (finalReviews.length === 0) {
    return (
      <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          {finalTitle && (
            <h2 className="text-2xl font-bold text-center mb-6">{finalTitle}</h2>
          )}
          <div className="text-center text-muted-foreground">
            <p>No reviews to display</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 px-4 ${compact ? 'py-6' : ''}`}>
      <div className="container mx-auto max-w-6xl">
        {finalTitle && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{finalTitle}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalReviews.slice(0, compact ? 3 : undefined).map((review, index) => (
            <div
              key={review.id || index}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                {review.image || review.imageSrc ? (
                  <img
                    src={review.image || review.imageSrc}
                    alt={review.name || review.author || `Review ${index + 1}`}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">
                      {(review.name || review.author || 'R').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{review.name || review.author || `Reviewer ${index + 1}`}</h4>
                  {review.role && (
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  )}
                </div>
              </div>
              {review.rating && (
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
              {review.text || review.content ? (
                <p className="text-muted-foreground">
                  {review.text || review.content}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
