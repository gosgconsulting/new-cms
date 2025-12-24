import { query } from '../connection.js';

// Contact management functions
export async function createContact(contactData, tenantId = null) {
  try {
    const result = await query(`
      INSERT INTO contacts 
        (first_name, last_name, email, phone, company, source, notes, status, tags, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) 
      DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = COALESCE(EXCLUDED.phone, contacts.phone),
        company = COALESCE(EXCLUDED.company, contacts.company),
        source = CASE WHEN contacts.source = 'form' THEN EXCLUDED.source ELSE contacts.source END,
        notes = COALESCE(EXCLUDED.notes, contacts.notes),
        tenant_id = COALESCE(EXCLUDED.tenant_id, contacts.tenant_id),
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
      contactData.tags || null,
      tenantId
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function getContacts(limit = 50, offset = 0, search = '', tenantId = null) {
  try {
    let whereClause = '';
    let params = [];
    let paramIndex = 1;
    
    // Build WHERE clause conditions
    const conditions = [];
    
    // Add tenant filter
    if (tenantId) {
      conditions.push(`tenant_id = $${paramIndex}`);
      params.push(tenantId);
      paramIndex++;
    }
    
    // Add search filter
    if (search) {
      conditions.push(`(
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        company ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Combine conditions
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add limit and offset parameters
    const limitParam = `$${paramIndex}`;
    const offsetParam = `$${paramIndex + 1}`;
    params.push(limit, offset);
    
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
        tenant_id,
        created_at,
        updated_at
      FROM contacts 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `, params);
    
    // Get total count using same WHERE clause
    const countParams = params.slice(0, paramIndex - 1); // Remove limit and offset
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM contacts 
      ${whereClause}
    `, countParams);
    
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

export async function getContact(contactId, tenantId = null) {
  try {
    let whereClause = 'WHERE id = $1';
    let params = [contactId];
    
    if (tenantId) {
      whereClause += ' AND tenant_id = $2';
      params.push(tenantId);
    }
    
    const result = await query(`
      SELECT * FROM contacts ${whereClause}
    `, params);
    
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

export async function getContactsWithMessages(limit = 50, offset = 0, search = '', tenantId = null) {
  try {
    let whereClause = '';
    let params = [];
    let paramIndex = 1;
    
    // Build WHERE clause conditions
    const conditions = [];
    
    // Add tenant filter
    if (tenantId) {
      conditions.push(`c.tenant_id = $${paramIndex}`);
      params.push(tenantId);
      paramIndex++;
    }
    
    // Add search filter
    if (search) {
      conditions.push(`(
        c.first_name ILIKE $${paramIndex} OR 
        c.last_name ILIKE $${paramIndex} OR 
        c.email ILIKE $${paramIndex} OR 
        c.company ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Combine conditions
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add limit and offset parameters
    const limitParam = `$${paramIndex}`;
    const offsetParam = `$${paramIndex + 1}`;
    params.push(limit, offset);
    
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
        c.tenant_id,
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
      LEFT JOIN form_submissions fs ON c.email = fs.email AND (fs.tenant_id = c.tenant_id OR fs.tenant_id IS NULL)
      ${whereClause}
      GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.company, c.source, c.status, c.tags, c.notes, c.tenant_id, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `, params);
    
    // Get total count using same WHERE clause
    const countParams = params.slice(0, paramIndex - 1); // Remove limit and offset
    const countResult = await query(`
      SELECT COUNT(DISTINCT c.id) as total 
      FROM contacts c
      LEFT JOIN form_submissions fs ON c.email = fs.email AND (fs.tenant_id = c.tenant_id OR fs.tenant_id IS NULL)
      ${whereClause}
    `, countParams);
    
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

