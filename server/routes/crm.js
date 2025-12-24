import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectSteps,
  createProjectStep,
  updateProjectStep,
  deleteProjectStep
} from '../../sparti-cms/db/index.js';

const router = express.Router();

// ===== CONTACTS ROUTES =====

// Get all contacts (filtered by tenant)
router.get('/contacts', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    
    // Get tenant ID from authenticated user
    const tenantId = req.tenantId || req.user.tenant_id;
    
    console.log('[testing] API: Getting contacts', { limit, offset, search, tenantId });
    const result = await getContacts(limit, offset, search, tenantId);
    res.json(result);
  } catch (error) {
    console.error('[testing] API: Error getting contacts:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

// Get contact by ID (filtered by tenant)
router.get('/contacts/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tenant ID from authenticated user
    const tenantId = req.tenantId || req.user.tenant_id;
    
    console.log('[testing] API: Getting contact:', id, 'for tenant:', tenantId);
    const contact = await getContact(id, tenantId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('[testing] API: Error getting contact:', error);
    res.status(500).json({ error: 'Failed to get contact' });
  }
});

// Create new contact
router.post('/contacts', authenticateUser, async (req, res) => {
  try {
    // Get tenant ID from authenticated user
    const tenantId = req.tenantId || req.user.tenant_id;
    
    console.log('[testing] API: Creating contact:', req.body, 'for tenant:', tenantId);
    const contact = await createContact(req.body, tenantId);
    res.json({ success: true, contact });
  } catch (error) {
    console.error('[testing] API: Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/contacts/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tenant ID from authenticated user
    const tenantId = req.tenantId || req.user.tenant_id;
    
    // First check if contact exists and belongs to tenant
    const existingContact = await getContact(id, tenantId);
    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    console.log('[testing] API: Updating contact:', id, req.body, 'for tenant:', tenantId);
    const contact = await updateContact(id, req.body);
    res.json({ success: true, contact });
  } catch (error) {
    console.error('[testing] API: Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/contacts/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tenant ID from authenticated user
    const tenantId = req.tenantId || req.user.tenant_id;
    
    // First check if contact exists and belongs to tenant
    const existingContact = await getContact(id, tenantId);
    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    console.log('[testing] API: Deleting contact:', id, 'for tenant:', tenantId);
    await deleteContact(id);
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('[testing] API: Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ===== PROJECTS ROUTES =====

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    console.log('[testing] API: Getting projects');
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    console.error('[testing] API: Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Create new project
router.post('/projects', async (req, res) => {
  try {
    console.log('[testing] API: Creating project:', req.body);
    const project = await createProject(req.body);
    res.json({ success: true, project });
  } catch (error) {
    console.error('[testing] API: Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Updating project:', id, req.body);
    const project = await updateProject(id, req.body);
    res.json({ success: true, project });
  } catch (error) {
    console.error('[testing] API: Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Deleting project:', id);
    await deleteProject(id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('[testing] API: Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ===== PROJECT STEPS ROUTES =====

// Get project steps
router.get('/projects/:projectId/steps', async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('[testing] API: Getting project steps for:', projectId);
    const steps = await getProjectSteps(projectId);
    res.json(steps);
  } catch (error) {
    console.error('[testing] API: Error getting project steps:', error);
    res.status(500).json({ error: 'Failed to get project steps' });
  }
});

// Create project step
router.post('/projects/:projectId/steps', async (req, res) => {
  try {
    const { projectId } = req.params;
    const stepData = { ...req.body, project_id: projectId };
    console.log('[testing] API: Creating project step:', stepData);
    const step = await createProjectStep(stepData);
    res.json({ success: true, step });
  } catch (error) {
    console.error('[testing] API: Error creating project step:', error);
    res.status(500).json({ error: 'Failed to create project step' });
  }
});

// Update project step
router.put('/project-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Updating project step:', id, req.body);
    const step = await updateProjectStep(id, req.body);
    res.json({ success: true, step });
  } catch (error) {
    console.error('[testing] API: Error updating project step:', error);
    res.status(500).json({ error: 'Failed to update project step' });
  }
});

// Delete project step
router.delete('/project-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[testing] API: Deleting project step:', id);
    await deleteProjectStep(id);
    res.json({ success: true, message: 'Project step deleted successfully' });
  } catch (error) {
    console.error('[testing] API: Error deleting project step:', error);
    res.status(500).json({ error: 'Failed to delete project step' });
  }
});

export default router;

