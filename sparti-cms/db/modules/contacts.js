import { query } from '../connection.js';

// Contact management functions
export async function createContact(contactData) {
  try {
    const result = await query(`
      INSERT INTO contacts 
        (first_name, last_name, email, phone, company, source, notes, status, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) 
      DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = COALESCE(EXCLUDED.phone, contacts.phone),
        company = COALESCE(EXCLUDED.company, contacts.company),
        source = CASE WHEN contacts.source = 'form' THEN EXCLUDED.source ELSE contacts.source END,
        notes = COALESCE(EXCLUDED.notes, contacts.notes),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      contactData.first_name,
      contactData.last_name || null,
      contactData.email,
      contactData.phone || null,
      contactData.company || null,
      contactData.source || 'form',
      contactData.notes || null,
      contactData.status || 'new',
      contactData.tags || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function getContacts(limit = 50, offset = 0, search = '') {
  try {
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = `WHERE 
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1 OR 
        company ILIKE $1`;
      params = [`%${search}%`, limit, offset];
    } else {
      params = [limit, offset];
    }
    
    const result = await query(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        company,
        source,
        status,
        tags,
        created_at,
        updated_at
      FROM contacts 
      ${whereClause}
      ORDER BY created_at DESC
      ${search ? 'LIMIT $2 OFFSET $3' : 'LIMIT $1 OFFSET $2'}
    `, params);
    
    // Get total count - use consistent parameter indexing
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM contacts 
      ${whereClause}
    `, search ? [`%${search}%`] : []);
    
    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

export async function getContact(contactId) {
  try {
    const result = await query(`
      SELECT * FROM contacts WHERE id = $1
    `, [contactId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
}

export async function updateContact(contactId, contactData) {
  try {
    const result = await query(`
      UPDATE contacts 
      SET 
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        company = COALESCE($6, company),
        source = COALESCE($7, source),
        notes = COALESCE($8, notes),
        status = COALESCE($9, status),
        tags = COALESCE($10, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      contactId,
      contactData.first_name,
      contactData.last_name,
      contactData.email,
      contactData.phone,
      contactData.company,
      contactData.source,
      contactData.notes,
      contactData.status,
      contactData.tags
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

export async function deleteContact(contactId) {
  try {
    await query(`DELETE FROM contacts WHERE id = $1`, [contactId]);
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

export async function getContactsWithMessages(limit = 50, offset = 0, search = '') {
  try {
    let whereClause = '';
    let params = [limit, offset];
    
    if (search) {
      whereClause = `WHERE 
        c.first_name ILIKE $3 OR 
        c.last_name ILIKE $3 OR 
        c.email ILIKE $3 OR 
        c.company ILIKE $3`;
      params.push(`%${search}%`);
    }
    
    const result = await query(`
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.company,
        c.source,
        c.status,
        c.tags,
        c.notes,
        c.created_at,
        c.updated_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN fs.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', fs.id,
                'form_name', fs.form_name,
                'message', fs.message,
                'submitted_at', fs.submitted_at
              )
            END
          ) FILTER (WHERE fs.id IS NOT NULL), 
          '[]'::json
        ) as form_messages
      FROM contacts c
      LEFT JOIN form_submissions fs ON c.email = fs.email
      ${whereClause}
      GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.company, c.source, c.status, c.tags, c.notes, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    // Get total count
    const countResult = await query(`
      SELECT COUNT(DISTINCT c.id) as total 
      FROM contacts c
      LEFT JOIN form_submissions fs ON c.email = fs.email
      ${whereClause}
    `, search ? [`%${search}%`] : []);
    
    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching contacts with messages:', error);
    throw error;
  }
}

