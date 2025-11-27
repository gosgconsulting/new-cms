import models from '../sequelize/models/index.js';
const { Category, Post, PostCategory } = models;

/**
 * Get all categories with post counts
 * @returns {Promise<Array>} Array of categories
 */
export async function getCategories() {
  try {
    const categories = await Category.findAll({
      attributes: {
        include: [
          [
            Category.sequelize.literal(`(
              SELECT COUNT(DISTINCT pc.post_id)
              FROM post_categories pc
              WHERE pc.category_id = "Category".id
            )`),
            'post_count'
          ]
        ]
      },
      order: [['name', 'ASC']],
    });
    
    // Update post_count in the model
    for (const category of categories) {
      const count = await PostCategory.count({
        where: { category_id: category.id }
      });
      await category.update({ post_count: count });
    }
    
    return categories.map(cat => cat.toJSON());
  } catch (error) {
    console.error('[testing] Error fetching categories:', error);
    throw error;
  }
}

/**
 * Get a single category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object|null>} Category object or null
 */
export async function getCategory(id) {
  try {
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });
    
    if (!category) return null;
    
    // Update post_count
    const count = await PostCategory.count({
      where: { category_id: category.id }
    });
    await category.update({ post_count: count });
    
    return category.toJSON();
  } catch (error) {
    console.error('[testing] Error fetching category:', error);
    throw error;
  }
}

/**
 * Create a new category
 * @param {Object} data - Category data
 * @param {string} data.name - Category name
 * @param {string} data.slug - URL slug
 * @param {string} [data.description] - Description
 * @param {number} [data.parent_id] - Parent category ID
 * @param {string} [data.meta_title] - SEO title
 * @param {string} [data.meta_description] - SEO description
 * @returns {Promise<Object>} Created category
 */
export async function createCategory(data) {
  try {
    // Generate slug if not provided
    const slug = data.slug || data.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const category = await Category.create({
      name: data.name,
      slug,
      description: data.description || '',
      parent_id: data.parent_id || null,
      meta_title: data.meta_title || `${data.name} - GO SG Digital Marketing`,
      meta_description: data.meta_description || data.description || `Learn about ${data.name} with GO SG's expert insights and strategies.`,
      post_count: 0,
    });
    
    console.log('[testing] Category created:', category.id);
    return category.toJSON();
  } catch (error) {
    console.error('[testing] Error creating category:', error);
    throw error;
  }
}

/**
 * Update an existing category
 * @param {number} id - Category ID
 * @param {Object} data - Category data to update
 * @returns {Promise<Object>} Updated category
 */
export async function updateCategory(id, data) {
  try {
    const category = await Category.findByPk(id);
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    await category.update({
      name: data.name !== undefined ? data.name : category.name,
      slug: data.slug !== undefined ? data.slug : category.slug,
      description: data.description !== undefined ? data.description : category.description,
      parent_id: data.parent_id !== undefined ? data.parent_id : category.parent_id,
      meta_title: data.meta_title !== undefined ? data.meta_title : category.meta_title,
      meta_description: data.meta_description !== undefined ? data.meta_description : category.meta_description,
    });
    
    // Update post_count
    const count = await PostCategory.count({
      where: { category_id: category.id }
    });
    await category.update({ post_count: count });
    
    console.log('[testing] Category updated:', category.id);
    return category.toJSON();
  } catch (error) {
    console.error('[testing] Error updating category:', error);
    throw error;
  }
}

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Deleted category
 */
export async function deleteCategory(id) {
  try {
    const category = await Category.findByPk(id);
    
    if (!category) {
      throw new Error('Category not found');
    }

    // Update child categories to remove parent reference
    await Category.update(
      { parent_id: null },
      { where: { parent_id: id } }
    );
    
    const categoryData = category.toJSON();
    await category.destroy();
    
    console.log('[testing] Category deleted:', id);
    return categoryData;
  } catch (error) {
    console.error('[testing] Error deleting category:', error);
    throw error;
  }
}

/**
 * Update post count for a category
 * @param {number} categoryId - Category ID
 * @returns {Promise<void>}
 */
async function updateCategoryPostCount(categoryId) {
  try {
    const count = await PostCategory.count({
      where: { category_id: categoryId }
    });
    
    await Category.update(
      { post_count: count },
      { where: { id: categoryId } }
    );
  } catch (error) {
    console.error('[testing] Error updating category post count:', error);
    // Don't throw - this is a background update
  }
}

/**
 * Get categories for a specific post
 * @param {number} postId - Post ID
 * @returns {Promise<Array>} Array of categories
 */
export async function getPostCategories(postId) {
  try {
    const post = await Post.findByPk(postId, {
      include: [{
        model: Category,
        as: 'categories',
        through: { attributes: [] }, // Exclude junction table attributes
      }],
    });
    
    if (!post) return [];
    
    return post.categories.map(cat => cat.toJSON());
  } catch (error) {
    console.error('[testing] Error fetching post categories:', error);
    throw error;
  }
}

/**
 * Set categories for a post (replaces existing)
 * @param {number} postId - Post ID
 * @param {Array<number>} categoryIds - Array of category IDs
 * @returns {Promise<void>}
 */
export async function setPostCategories(postId, categoryIds) {
  try {
    const post = await Post.findByPk(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Get categories
    const categories = await Category.findAll({
      where: { id: categoryIds }
    });
    
    // Set categories (this replaces existing)
    await post.setCategories(categories);
    
    // Update post_count for each category
    for (const categoryId of categoryIds) {
      await updateCategoryPostCount(categoryId);
    }
    
    console.log('[testing] Post categories updated for post:', postId);
  } catch (error) {
    console.error('[testing] Error setting post categories:', error);
    throw error;
  }
}
