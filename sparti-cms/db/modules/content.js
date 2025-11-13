import { query } from '../connection.js';

export async function getPosts() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function getPost(id) {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

export async function createPost(data) {
  try {
    // Insert the post
    const postResult = await query(`
      INSERT INTO posts (
        title, slug, content, excerpt, status, post_type, author_id,
        meta_title, meta_description, meta_keywords, canonical_url,
        og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
        published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      data.title,
      data.slug,
      data.content || '',
      data.excerpt || '',
      data.status || 'draft',
      data.post_type || 'post',
      data.author_id,
      data.meta_title || '',
      data.meta_description || '',
      data.meta_keywords || '',
      data.canonical_url || '',
      data.og_title || '',
      data.og_description || '',
      data.og_image || '',
      data.twitter_title || '',
      data.twitter_description || '',
      data.twitter_image || '',
      data.published_at
    ]);

    const post = postResult.rows[0];

    // Handle categories
    if (data.categories && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        // Get the term_taxonomy_id for this category
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
        `, [categoryId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [post.id, taxonomyResult.rows[0].id]);
        }
      }
    }

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        // Get the term_taxonomy_id for this tag
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
        `, [tagId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [post.id, taxonomyResult.rows[0].id]);
        }
      }
    }

    return await getPost(post.id);
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updatePost(id, data) {
  try {
    // Update the post
    const postResult = await query(`
      UPDATE posts SET
        title = COALESCE($2, title),
        slug = COALESCE($3, slug),
        content = COALESCE($4, content),
        excerpt = COALESCE($5, excerpt),
        status = COALESCE($6, status),
        author_id = COALESCE($7, author_id),
        meta_title = COALESCE($8, meta_title),
        meta_description = COALESCE($9, meta_description),
        meta_keywords = COALESCE($10, meta_keywords),
        og_title = COALESCE($11, og_title),
        og_description = COALESCE($12, og_description),
        twitter_title = COALESCE($13, twitter_title),
        twitter_description = COALESCE($14, twitter_description),
        published_at = COALESCE($15, published_at),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, data.title, data.slug, data.content, data.excerpt, data.status, data.author_id, data.meta_title, data.meta_description, data.meta_keywords, data.og_title, data.og_description, data.twitter_title, data.twitter_description, data.published_at]);

    if (postResult.rows.length === 0) {
      throw new Error('Post not found');
    }

    // Clear existing relationships
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [id]);

    // Handle categories
    if (data.categories && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
        `, [categoryId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [id, taxonomyResult.rows[0].id]);
        }
      }
    }

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
        `, [tagId]);
        
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [id, taxonomyResult.rows[0].id]);
        }
      }
    }

    return await getPost(id);
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deletePost(id) {
  try {
    // Delete relationships first
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [id]);
    
    // Delete the post
    const result = await query(`DELETE FROM posts WHERE id = $1 RETURNING *`, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Post not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}
