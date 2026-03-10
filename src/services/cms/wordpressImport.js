import { XMLParser } from 'fast-xml-parser';

/**
 * Parse WordPress XML (WXR) export file
 * @param {string} xmlContent - XML content as string
 * @returns {Promise<Object>} Parsed WordPress data
 */
export function parseWordPressXML(xmlContent) {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false,
      arrayMode: false
    });

    const result = parser.parse(xmlContent);
    
    // WordPress WXR format structure
    const channel = result.rss?.channel || result.rss?.['wp:channel'] || {};
    const items = Array.isArray(channel.item) ? channel.item : (channel.item ? [channel.item] : []);

    return {
      title: channel.title || '',
      description: channel.description || '',
      link: channel.link || '',
      items: items
    };
  } catch (error) {
    console.error('[testing] Error parsing WordPress XML:', error);
    throw new Error(`Failed to parse WordPress XML: ${error.message}`);
  }
}

/**
 * Parse WordPress JSON export file
 * @param {string} jsonContent - JSON content as string
 * @returns {Promise<Object>} Parsed WordPress data
 */
export function parseWordPressJSON(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    
    // Handle different JSON export formats
    if (data.posts && Array.isArray(data.posts)) {
      return {
        title: data.title || '',
        description: data.description || '',
        link: data.link || '',
        items: data.posts
      };
    } else if (Array.isArray(data)) {
      return {
        title: '',
        description: '',
        link: '',
        items: data
      };
    } else {
      throw new Error('Invalid WordPress JSON format');
    }
  } catch (error) {
    console.error('[testing] Error parsing WordPress JSON:', error);
    throw new Error(`Failed to parse WordPress JSON: ${error.message}`);
  }
}

/**
 * Extract posts from parsed WordPress data
 * @param {Object} data - Parsed WordPress data
 * @returns {Array<Object>} Array of post objects
 */
export function extractPosts(data) {
  const items = data.items || [];
  
  return items.map((item, index) => {
    // Handle XML format
    if (item['content:encoded'] || item['wp:post_content']) {
      return {
        title: item.title?.['#text'] || item.title || `Post ${index + 1}`,
        content: item['content:encoded']?.['#text'] || item['content:encoded'] || item['wp:post_content']?.['#text'] || item['wp:post_content'] || '',
        excerpt: item['excerpt:encoded']?.['#text'] || item['excerpt:encoded'] || item['wp:post_excerpt']?.['#text'] || item['wp:post_excerpt'] || '',
        slug: extractSlug(item),
        status: item['wp:status']?.['#text'] || item['wp:status'] || item.status || 'draft',
        postType: item['wp:post_type']?.['#text'] || item['wp:post_type'] || item.post_type || 'post',
        publishedAt: extractDate(item),
        categories: extractItemCategories(item),
        tags: extractItemTags(item),
        featuredImage: extractFeaturedImage(item),
        meta: extractMeta(item)
      };
    }
    
    // Handle JSON format
    return {
      title: item.title || item.post_title || `Post ${index + 1}`,
      content: item.content || item.post_content || '',
      excerpt: item.excerpt || item.post_excerpt || '',
      slug: item.slug || item.post_name || generateSlug(item.title || item.post_title || `Post ${index + 1}`),
      status: item.status || item.post_status || 'draft',
      postType: item.post_type || 'post',
      publishedAt: item.date || item.post_date || item.published_at || null,
      categories: item.categories || [],
      tags: item.tags || [],
      featuredImage: item.featured_image || item.thumbnail || null,
      meta: item.meta || {}
    };
  }).filter(post => post.postType === 'post'); // Only import posts, not pages or other types
}

/**
 * Extract categories from parsed WordPress data
 * @param {Object} data - Parsed WordPress data
 * @returns {Array<Object>} Array of category objects
 */
export function extractCategories(data) {
  const categories = new Map();
  const items = data.items || [];

  items.forEach(item => {
    // Handle XML format
    if (item.category) {
      const cats = Array.isArray(item.category) ? item.category : [item.category];
      cats.forEach(cat => {
        if (cat['@_domain'] === 'category' || cat['@_domain'] === 'post_category') {
          const name = cat['#text'] || cat;
          const slug = cat['@_nicename'] || generateSlug(name);
          if (name && !categories.has(slug)) {
            categories.set(slug, {
              name: name,
              slug: slug,
              description: cat['@_description'] || ''
            });
          }
        }
      });
    }
    
    // Handle JSON format - categories are already extracted in extractPosts
  });

  return Array.from(categories.values());
}

/**
 * Extract tags from parsed WordPress data
 * @param {Object} data - Parsed WordPress data
 * @returns {Array<Object>} Array of tag objects
 */
export function extractTags(data) {
  const tags = new Map();
  const items = data.items || [];

  items.forEach(item => {
    // Handle XML format
    if (item.category) {
      const cats = Array.isArray(item.category) ? item.category : [item.category];
      cats.forEach(cat => {
        if (cat['@_domain'] === 'post_tag' || cat['@_domain'] === 'tag') {
          const name = cat['#text'] || cat;
          const slug = cat['@_nicename'] || generateSlug(name);
          if (name && !tags.has(slug)) {
            tags.set(slug, {
              name: name,
              slug: slug,
              description: ''
            });
          }
        }
      });
    }
    
    // Handle JSON format - tags are already extracted in extractPosts
  });

  return Array.from(tags.values());
}

/**
 * Extract categories from a single post item
 * @param {Object} item - Post item
 * @returns {Array<string>} Array of category names/slugs
 */
function extractItemCategories(item) {
  const categories = [];
  
  if (item.category) {
    const cats = Array.isArray(item.category) ? item.category : [item.category];
    cats.forEach(cat => {
      if (cat['@_domain'] === 'category' || cat['@_domain'] === 'post_category') {
        categories.push(cat['#text'] || cat);
      }
    });
  }
  
  return categories;
}

/**
 * Extract tags from a single post item
 * @param {Object} item - Post item
 * @returns {Array<string>} Array of tag names/slugs
 */
function extractItemTags(item) {
  const tags = [];
  
  if (item.category) {
    const cats = Array.isArray(item.category) ? item.category : [item.category];
    cats.forEach(cat => {
      if (cat['@_domain'] === 'post_tag' || cat['@_domain'] === 'tag') {
        tags.push(cat['#text'] || cat);
      }
    });
  }
  
  return tags;
}

/**
 * Extract slug from post item
 * @param {Object} item - Post item
 * @returns {string} Post slug
 */
function extractSlug(item) {
  // Try various WordPress slug fields
  if (item['wp:post_name']?.['#text']) return item['wp:post_name']['#text'];
  if (item['wp:post_name']) return item['wp:post_name'];
  if (item.link) {
    const url = new URL(item.link);
    const pathParts = url.pathname.split('/').filter(p => p);
    return pathParts[pathParts.length - 1] || generateSlug(item.title?.['#text'] || item.title || '');
  }
  return generateSlug(item.title?.['#text'] || item.title || '');
}

/**
 * Extract date from post item
 * @param {Object} item - Post item
 * @returns {string|null} ISO date string or null
 */
function extractDate(item) {
  // Try various date fields
  const dateStr = item['wp:post_date']?.['#text'] || 
                  item['wp:post_date'] || 
                  item.pubDate?.['#text'] || 
                  item.pubDate ||
                  item.date ||
                  item.post_date;
  
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Extract featured image from post item
 * @param {Object} item - Post item
 * @returns {string|null} Image URL or null
 */
function extractFeaturedImage(item) {
  // Try various featured image fields
  return item['wp:attachment_url']?.['#text'] ||
         item['wp:attachment_url'] ||
         item.featured_image ||
         item.thumbnail ||
         null;
}

/**
 * Extract meta data from post item
 * @param {Object} item - Post item
 * @returns {Object} Meta data object
 */
function extractMeta(item) {
  const meta = {};
  
  if (item['wp:postmeta']) {
    const metas = Array.isArray(item['wp:postmeta']) ? item['wp:postmeta'] : [item['wp:postmeta']];
    metas.forEach(m => {
      const key = m['wp:meta_key']?.['#text'] || m['wp:meta_key'];
      const value = m['wp:meta_value']?.['#text'] || m['wp:meta_value'];
      if (key) {
        meta[key] = value;
      }
    });
  }
  
  return meta;
}

/**
 * Extract image URLs from HTML content
 * @param {string} content - HTML content
 * @returns {Array<string>} Array of image URLs
 */
export function extractImages(content) {
  if (!content) return [];
  
  const imageUrls = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urlRegex = /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|svg)/gi;
  
  // Extract from img tags
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      imageUrls.push(match[1]);
    }
  }
  
  // Extract standalone URLs
  while ((match = urlRegex.exec(content)) !== null) {
    if (match[0] && !imageUrls.includes(match[0])) {
      imageUrls.push(match[0]);
    }
  }
  
  return imageUrls;
}

/**
 * Update image references in content
 * @param {string} content - HTML content
 * @param {Map<string, string>} imageMap - Map of original URL to local URL
 * @returns {string} Updated content
 */
export function updateImageReferences(content, imageMap) {
  if (!content || !imageMap) return content;
  
  let updatedContent = content;
  
  imageMap.forEach((localUrl, originalUrl) => {
    // Replace in img src attributes
    updatedContent = updatedContent.replace(
      new RegExp(`src=["']${escapeRegex(originalUrl)}["']`, 'gi'),
      `src="${localUrl}"`
    );
    
    // Replace standalone URLs
    updatedContent = updatedContent.replace(
      new RegExp(escapeRegex(originalUrl), 'g'),
      localUrl
    );
  });
  
  return updatedContent;
}

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Text to slugify
 * @returns {string} Slug
 */
function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}