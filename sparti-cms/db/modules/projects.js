import { query } from '../connection.js';

// Project management functions
export async function createProject(projectData) {
  try {
    const result = await query(`
      INSERT INTO projects 
        (title, description, status, category, priority, start_date, end_date, progress)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      projectData.title,
      projectData.description || null,
      projectData.status || 'active',
      projectData.category || null,
      projectData.priority || 'medium',
      projectData.start_date || null,
      projectData.end_date || null,
      projectData.progress || 0
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COUNT(ps.id) as total_steps,
        COUNT(CASE WHEN ps.status = 'completed' THEN 1 END) as completed_steps
      FROM projects p
      LEFT JOIN project_steps ps ON p.id = ps.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    return result.rows.map(row => ({
      ...row,
      total_steps: parseInt(row.total_steps) || 0,
      completed_steps: parseInt(row.completed_steps) || 0,
      completion_percentage: row.total_steps > 0 
        ? Math.round((row.completed_steps / row.total_steps) * 100) 
        : 0
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function updateProject(projectId, projectData) {
  try {
    const result = await query(`
      UPDATE projects 
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        category = COALESCE($5, category),
        priority = COALESCE($6, priority),
        start_date = COALESCE($7, start_date),
        end_date = COALESCE($8, end_date),
        progress = COALESCE($9, progress),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      projectId,
      projectData.title,
      projectData.description,
      projectData.status,
      projectData.category,
      projectData.priority,
      projectData.start_date,
      projectData.end_date,
      projectData.progress
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(projectId) {
  try {
    await query(`DELETE FROM projects WHERE id = $1`, [projectId]);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Project steps functions
export async function createProjectStep(stepData) {
  try {
    const result = await query(`
      INSERT INTO project_steps 
        (project_id, title, description, status, step_order, estimated_hours, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      stepData.project_id,
      stepData.title,
      stepData.description || null,
      stepData.status || 'pending',
      stepData.step_order || 0,
      stepData.estimated_hours || null,
      stepData.assigned_to || null,
      stepData.due_date || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating project step:', error);
    throw error;
  }
}

export async function getProjectSteps(projectId) {
  try {
    const result = await query(`
      SELECT * FROM project_steps 
      WHERE project_id = $1 
      ORDER BY step_order ASC, created_at ASC
    `, [projectId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching project steps:', error);
    throw error;
  }
}

export async function updateProjectStep(stepId, stepData) {
  try {
    const result = await query(`
      UPDATE project_steps 
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        step_order = COALESCE($5, step_order),
        estimated_hours = COALESCE($6, estimated_hours),
        actual_hours = COALESCE($7, actual_hours),
        assigned_to = COALESCE($8, assigned_to),
        due_date = COALESCE($9, due_date),
        completed_at = CASE WHEN $4 = 'completed' AND status != 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      stepId,
      stepData.title,
      stepData.description,
      stepData.status,
      stepData.step_order,
      stepData.estimated_hours,
      stepData.actual_hours,
      stepData.assigned_to,
      stepData.due_date
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating project step:', error);
    throw error;
  }
}

export async function deleteProjectStep(stepId) {
  try {
    await query(`DELETE FROM project_steps WHERE id = $1`, [stepId]);
    return true;
  } catch (error) {
    console.error('Error deleting project step:', error);
    throw error;
  }
}

