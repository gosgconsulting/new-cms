# WordPress API Integration Guide

## Overview

This project now integrates with the WordPress blog at `https://cms.gosgconsulting.com/` using the WordPress REST API. The integration allows the React application to display blog posts dynamically from your WordPress site.

## Features Implemented

### ✅ Core Integration
- **WordPress REST API Service** (`src/services/wordpressApi.ts`)
- **Custom React Hooks** (`src/hooks/use-wordpress-posts.tsx`)
- **Updated Blog Components** to use WordPress data
- **Error Handling** and loading states
- **Automatic Content Sanitization** for safe HTML rendering

### ✅ Components Updated
1. **Blog Page** (`src/pages/Blog.tsx`) - Lists all blog posts
2. **Blog Post Page** (`src/pages/BlogPost.tsx`) - Individual post view
3. **Blog Section** (`src/components/BlogSection.tsx`) - Homepage preview

## API Service Features

### WordPress API Service (`wordpressApi.ts`)

#### Key Methods:
```typescript
// Get multiple posts with filtering
await wordpressApi.getPosts({
  per_page: 10,
  orderby: 'date',
  order: 'desc',
  categories: [1, 2],
  search: 'SEO'
});

// Get single post by slug
await wordpressApi.getPostBySlug('your-post-slug');

// Get single post by ID
await wordpressApi.getPostById(42);
```

#### Utility Methods:
```typescript
// Strip HTML tags for safe display
wordpressApi.stripHtml(htmlContent);

// Generate excerpt from content
wordpressApi.generateExcerpt(content, 200);

// Format date for display
wordpressApi.formatDate(dateString);
```

### Custom Hooks (`use-wordpress-posts.tsx`)

#### Available Hooks:
```typescript
// Get multiple posts with options
const { posts, isLoading, error } = useWordPressPosts({
  per_page: 10,
  search: 'SEO',
  orderby: 'date'
});

// Get single post by slug or ID
const { post, isLoading, error } = useWordPressPost({
  slug: 'post-slug'
});

// Get latest posts for previews
const { posts, isLoading, error } = useLatestWordPressPosts(3);
```

## Data Structure

### WordPress Post Object
```typescript
interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  // Enhanced fields
  author_name?: string;
  featured_image_url?: string;
}
```

## Configuration

### API Endpoint
The WordPress REST API base URL is configured in:
```typescript
const WORDPRESS_BASE_URL = 'https://cms.gosgconsulting.com/wp-json/wp/v2';
```

### Query Parameters Supported
- `per_page`: Number of posts to fetch (default: 10)
- `page`: Page number for pagination
- `search`: Search term to filter posts
- `categories`: Array of category IDs
- `tags`: Array of tag IDs
- `author`: Author ID
- `orderby`: Sort field ('date', 'title', 'id', etc.)
- `order`: Sort direction ('asc' or 'desc')

## Error Handling

### Automatic Retry Logic
- 3 retry attempts with exponential backoff
- Maximum retry delay: 30 seconds
- Graceful fallback to error states

### Error States
```typescript
if (error) {
  // Display user-friendly error message
  return <div>Unable to load blog posts. Please try again later.</div>;
}
```

## Caching Strategy

### React Query Integration
- **5 minutes** cache for post lists
- **10 minutes** cache for individual posts
- Automatic background refetching
- Optimistic updates support

## Security Features

### Content Sanitization
- HTML content rendered with `dangerouslySetInnerHTML` for rich content
- Title and excerpt content stripped of HTML for safe display
- Automatic XSS protection through React's built-in escaping

### CORS Handling
- WordPress REST API is publicly accessible
- No authentication required for published content
- Respects WordPress privacy settings

## Performance Optimizations

### Image Handling
- Featured images loaded from WordPress media library
- Fallback placeholder images for posts without featured media
- Responsive image sizing with CSS

### Content Loading
- Lazy loading with React Query
- Background refetching for fresh content
- Efficient re-rendering with React keys

## Usage Examples

### Basic Blog List
```tsx
import { useWordPressPosts } from '@/hooks/use-wordpress-posts';

function BlogList() {
  const { posts, isLoading, error } = useWordPressPosts();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts</div>;
  
  return (
    <div>
      {posts?.map(post => (
        <article key={post.id}>
          <h2>{wordpressApi.stripHtml(post.title.rendered)}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        </article>
      ))}
    </div>
  );
}
```

### Search Functionality
```tsx
const { posts } = useWordPressPosts({
  search: searchTerm,
  per_page: 5
});
```

### Category Filtering
```tsx
const { posts } = useWordPressPosts({
  categories: [1, 2, 3], // SEO, Marketing, etc.
  orderby: 'date',
  order: 'desc'
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure WordPress REST API is publicly accessible
2. **Missing Featured Images**: Check WordPress media library permissions
3. **Slow Loading**: Consider reducing `per_page` limit
4. **Content Not Showing**: Verify posts are published (not draft)

### Debug Mode
Enable debug logging by looking for `[testing]` prefixed console logs:
```javascript
console.log('[testing] WordPress API response:', data);
```

### API Testing
Test the WordPress API directly in browser:
```
https://cms.gosgconsulting.com/wp-json/wp/v2/posts?per_page=1
```

## Migration Notes

### From Database to WordPress
- Removed direct database blog post queries
- Maintained same UI/UX experience
- Enhanced with WordPress-specific features (rich content, media)
- Improved SEO with proper meta data from WordPress

### Data Mapping
| Database Field | WordPress Field | Notes |
|----------------|-----------------|-------|
| `title` | `title.rendered` | HTML stripped for display |
| `content` | `content.rendered` | Rich HTML content |
| `excerpt` | `excerpt.rendered` | Auto-generated if empty |
| `featured_image` | `featured_image_url` | From embedded media |
| `author` | `author_name` | From embedded author data |
| `published_at` | `date` | ISO date format |

## Future Enhancements

### Planned Features
- [ ] Categories and tags display
- [ ] Author pages
- [ ] Advanced search with filters
- [ ] Pagination for large post lists
- [ ] Comments integration
- [ ] Related posts suggestions
- [ ] Social sharing buttons

### WordPress Plugin Recommendations
- **Yoast SEO**: Enhanced meta data
- **Advanced Custom Fields**: Custom post fields
- **WP REST API Controller**: Extended API endpoints
- **WordPress SEO**: Better content optimization

## Support

For WordPress API issues:
1. Check WordPress admin dashboard
2. Verify REST API settings
3. Test API endpoints directly
4. Review server logs for errors
5. Contact WordPress hosting provider if needed

For React integration issues:
1. Check browser console for errors
2. Verify React Query cache
3. Test API service methods individually
4. Review component error boundaries
