import { query } from '../connection.js';

export async function getTerms() {
  try {
    const result = await query(`
      SELECT t.*, tt.taxonomy, tt.description as taxonomy_description
      FROM terms t
      LEFT JOIN term_taxonomy tt ON t.id = tt.term_id
      ORDER BY t.name
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching terms:', error);
    throw error;
  }
}

export async function getTerm(id) {
  try {
    const result = await query(`
      SELECT t.*, tt.taxonomy, tt.description as taxonomy_description
      FROM terms t
      LEFT JOIN term_taxonomy tt ON t.id = tt.term_id
      WHERE t.id = $1
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching term:', error);
    throw error;
  }
}

export async function createTerm(data) {
  try {
    // Insert the term
    const termResult = await query(`
      INSERT INTO terms (name, slug, description, meta_title, meta_description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      data.name,
      data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      data.description || '',
      data.meta_title || `${data.name} - GO SG Digital Marketing`,
      data.meta_description || data.description || `Learn about ${data.name} with GO SG's expert insights and strategies.`
    ]);

    const term = termResult.rows[0];

    // Create taxonomy relationship if specified
    if (data.taxonomy) {
      await query(`
        INSERT INTO term_taxonomy (term_id, taxonomy, description)
        VALUES ($1, $2, $3)
      `, [term.id, data.taxonomy, data.description || `${data.taxonomy} for ${data.name} content`]);
    }

    return term;
  } catch (error) {
    console.error('Error creating term:', error);
    throw error;
  }
}

export async function updateTerm(id, data) {
  try {
    const result = await query(`
      UPDATE terms SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        meta_title = COALESCE($5, meta_title),
        meta_description = COALESCE($6, meta_description),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, data.name, data.slug, data.description, data.meta_title, data.meta_description]);
    
    if (result.rows.length === 0) {
      throw new Error('Term not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating term:', error);
    throw error;
  }
}

export async function deleteTerm(id) {
  try {
    // Delete relationships first
    await query(`DELETE FROM term_relationships WHERE term_taxonomy_id IN (SELECT id FROM term_taxonomy WHERE term_id = $1)`, [id]);
    
    // Delete taxonomy entries
    await query(`DELETE FROM term_taxonomy WHERE term_id = $1`, [id]);
    
    // Delete the term
    const result = await query(`DELETE FROM terms WHERE id = $1 RETURNING *`, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Term not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting term:', error);
    throw error;
  }
}
