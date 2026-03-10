import models from '../sequelize/models/index.js';
const { Tag, Post, PostTag } = models;

/**
 * Get all tags with post counts
 * @returns {Promise<Array>} Array of tags
 */
export async function getTags() {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']],
    });
    
    // Update post_count for each tag
    for (const tag of tags) {
      const count = await PostTag.count({
        where: { tag_id: tag.id }
      });
      await tag.update({ post_count: count });
    }
    
    return tags.map(tag => tag.toJSON());
  } catch (error) {
    console.error('[testing] Error fetching tags:', error);
    throw error;
  }
}

/**
 * Get a single tag by ID
 * @param {number} id - Tag ID
 * @returns {Promise<Object|null>} Tag object or null
 */
export async function getTag(id) {
  try {
    const tag = await Tag.findByPk(id);
    
    if (!tag) return null;
    
    // Update post_count
    const count = await PostTag.count({
      where: { tag_id: tag.id }
    });
    await tag.update({ post_count: count });
    
    return tag.toJSON();
  } catch (error) {
    console.error('[testing] Error fetching tag:', error);
    throw error;
  }
}

/**
 * Create a new tag
 * @param {Object} data - Tag data
 * @param {string} data.name - Tag name
 * @param {string} [data.slug] - URL slug
 * @param {string} [data.description] - Description
 * @param {string} [data.meta_title] - SEO title
 * @param {string} [data.meta_description] - SEO description
 * @returns {Promise<Object>} Created tag
 */
export async function createTag(data) {
  try {
    // Generate slug if not provided
    const slug = data.slug || data.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const tag = await Tag.create({
      name: data.name,
      slug,
      description: data.description || '',
      meta_title: data.meta_title || `${data.name} - GO SG Digital Marketing`,
      meta_description: data.meta_description || data.description || `Learn about ${data.name} with GO SG's expert insights and strategies.`,
      post_count: 0,
    });
    
    console.log('[testing] Tag created:', tag.id);
    return tag.toJSON();
  } catch (error) {
    console.error('[testing] Error creating tag:', error);
    throw error;
  }
}

/**
 * Update an existing tag
 * @param {number} id - Tag ID
 * @param {Object} data - Tag data to update
 * @returns {Promise<Object>} Updated tag
 */
export async function updateTag(id, data) {
  try {
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      throw new Error('Tag not found');
    }
    
    await tag.update({
      name: data.name !== undefined ? data.name : tag.name,
      slug: data.slug !== undefined ? data.slug : tag.slug,
      description: data.description !== undefined ? data.description : tag.description,
      meta_title: data.meta_title !== undefined ? data.meta_title : tag.meta_title,
      meta_description: data.meta_description !== undefined ? data.meta_description : tag.meta_description,
    });
    
    // Update post_count
    const count = await PostTag.count({
      where: { tag_id: tag.id }
    });
    await tag.update({ post_count: count });
    
    console.log('[testing] Tag updated:', tag.id);
    return tag.toJSON();
  } catch (error) {
    console.error('[testing] Error updating tag:', error);
    throw error;
  }
}

/**
 * Delete a tag
 * @param {number} id - Tag ID
 * @returns {Promise<Object>} Deleted tag
 */
export async function deleteTag(id) {
  try {
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      throw new Error('Tag not found');
    }

    const tagData = tag.toJSON();
    await tag.destroy();
    
    console.log('[testing] Tag deleted:', id);
    return tagData;
  } catch (error) {
    console.error('[testing] Error deleting tag:', error);
    throw error;
  }
}

/**
 * Update post count for a tag
 * @param {number} tagId - Tag ID
 * @returns {Promise<void>}
 */
async function updateTagPostCount(tagId) {
  try {
    const count = await PostTag.count({
      where: { tag_id: tagId }
    });
    
    await Tag.update(
      { post_count: count },
      { where: { id: tagId } }
    );
  } catch (error) {
    console.error('[testing] Error updating tag post count:', error);
    // Don't throw - this is a background update
  }
}

/**
 * Get tags for a specific post
 * @param {number} postId - Post ID
 * @returns {Promise<Array>} Array of tags
 */
export async function getPostTags(postId) {
  try {
    const post = await Post.findByPk(postId, {
      include: [{
        model: Tag,
        as: 'tags',
        through: { attributes: [] }, // Exclude junction table attributes
      }],
    });
    
    if (!post) return [];
    
    return post.tags.map(tag => tag.toJSON());
  } catch (error) {
    console.error('[testing] Error fetching post tags:', error);
    throw error;
  }
}

/**
 * Find or create a tag by slug
 * @param {string} slug - Tag slug
 * @param {Object} data - Tag data
 * @returns {Promise<Object>} Tag object
 */
export async function findOrCreateTag(slug, data) {
  try {
    // Try to find existing tag by slug
    const existing = await Tag.findOne({ where: { slug } });
    
    if (existing) {
      console.log('[testing] Found existing tag:', slug);
      return existing.toJSON();
    }
    
    // Create new tag
    const tag = await createTag({
      name: data.name || slug,
      slug: slug,
      description: data.description || '',
      meta_title: data.meta_title,
      meta_description: data.meta_description
    });
    
    return tag;
  } catch (error) {
    console.error('[testing] Error in findOrCreateTag:', error);
    throw error;
  }
}

/**
 * Set tags for a post (replaces existing)
 * @param {number} postId - Post ID
 * @param {Array<number>} tagIds - Array of tag IDs
 * @returns {Promise<void>}
 */
export async function setPostTags(postId, tagIds) {
  try {
    const post = await Post.findByPk(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Get tags
    const tags = await Tag.findAll({
      where: { id: tagIds }
    });
    
    // Set tags (this replaces existing)
    await post.setTags(tags);
    
    // Update post_count for each tag
    for (const tagId of tagIds) {
      await updateTagPostCount(tagId);
    }
    
    console.log('[testing] Post tags updated for post:', postId);
  } catch (error) {
    console.error('[testing] Error setting post tags:', error);
    throw error;
  }
}

/**
 * Bulk create tags
 * @param {Array<Object>} tagsData - Array of tag data objects
 * @returns {Promise<Array>} Array of created tags
 */
export async function bulkCreateTags(tagsData) {
  try {
    const createdTags = [];
    
    for (const tagData of tagsData) {
      try {
        const tag = await createTag(tagData);
        createdTags.push(tag);
      } catch (error) {
        console.error('[testing] Error creating tag in bulk:', tagData.name, error);
        // Continue with other tags even if one fails
      }
    }
    
    return createdTags;
  } catch (error) {
    console.error('[testing] Error bulk creating tags:', error);
    throw error;
  }
}
