// Main database module index
// Re-exports all database functions from organized modules

// Connection and utilities
export { query, canUserAccessTenant } from './connection.js';
export { default as pool } from './connection.js';

// Layout helpers
export { getLayoutBySlug, upsertLayoutBySlug } from './modules/layouts.js';

// Initialization
export {
  initializeDatabase,
  initializeTenantTables,
  initializeUsersTables
} from './modules/initialization.js';

// Branding and site settings
export {
  getBrandingSettings,
  getPublicSEOSettings,
  updateBrandingSetting,
  getSiteSchema,
  updateSiteSchema,
  updateMultipleBrandingSettings,
  getsitesettingsbytenant,
  getSiteSettingByKey,
  updateSiteSettingByKey,
  updateSEOSettings,
  migrateLogoToDatabase,
  migrateFaviconToDatabase
} from './modules/branding.js';

// Forms
export {
  getFormById,
  getEmailSettingsByFormId,
  saveFormSubmissionExtended,
  saveFormSubmission,
  getFormSubmissions
} from './modules/forms.js';

// Contacts
export {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactsWithMessages
} from './modules/contacts.js';

// Projects
export {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  createProjectStep,
  getProjectSteps,
  updateProjectStep,
  deleteProjectStep
} from './modules/projects.js';

// Pages management
export {
  initializeSEOPagesTables,
  createPage,
  getPages,
  getPage,
  updatePage,
  deletePage,
  getAllPagesWithTypes,
  updatePageSlug,
  validateSlug,
  logSlugChange,
  getSlugChangeHistory,
  updatePageName,
  toggleSEOIndex,
  getPageWithLayout,
  updatePageData,
  updatePageLayout
} from './modules/pages.js';

// Content/Posts management
export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} from './modules/content.js';

// Terms/Taxonomy management
export {
  getTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm
} from './modules/terms.js';

