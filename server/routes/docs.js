import express from 'express';
import { promises as fsp } from 'fs';
import { join, relative } from 'path';

const router = express.Router();

const DOC_DIRS = [
  join(process.cwd(), 'docs'),
  join(process.cwd(), 'sparti-cms', 'docs'),
];

const isMarkdownOrText = (filename) => {
  return filename.endsWith('.md') || filename.endsWith('.markdown') || filename.endsWith('.txt');
};

async function walkDir(root) {
  const entries = await fsp.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      const sub = await walkDir(full);
      files.push(...sub);
    } else {
      files.push(full);
    }
  }
  return files;
}

function extractFirstHeading(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) return h1[1].trim();
  }
  // fallback to first non-empty line
  const firstNonEmpty = lines.find((l) => l.trim().length > 0);
  return firstNonEmpty ? firstNonEmpty.trim().replace(/^#+\s*/, '') : 'Untitled';
}

function extractActions(content, filePath) {
  const lines = content.split('\n');
  const actions = [];
  let currentTask = null;

  const pushCurrent = () => {
    if (currentTask) {
      // default status if missing
      if (!currentTask.status) currentTask.status = 'todo';
      actions.push(currentTask);
      currentTask = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Task as H2 (##) or H3 (###)
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    if (h2 || h3) {
      pushCurrent();
      currentTask = {
        task: (h2 ? h2[1] : h3[1]).trim(),
        description: '',
        status: 'todo',
        filesTouched: [filePath],
      };
      continue;
    }

    // Status markers in text (simple heuristic)
    const statusMatch = line.match(/\b(status|state)\s*:\s*(todo|in[-\s]?progress|done)\b/i);
    if (statusMatch && currentTask) {
      currentTask.status = statusMatch[2].toLowerCase().replace(/\s+/, '-');
      continue;
    }

    // First paragraph after a heading becomes description
    if (currentTask && currentTask.description === '') {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        currentTask.description = trimmed;
      }
    }
  }
  pushCurrent();

  // If nothing parsed, provide a single summary row
  if (actions.length === 0) {
    actions.push({
      task: 'Review Document',
      description: 'Open and audit this document; create actionable steps if needed.',
      status: 'todo',
      filesTouched: [filePath],
    });
  }

  return actions;
}

async function listDocs() {
  const items = [];
  for (const dir of DOC_DIRS) {
    try {
      const all = await walkDir(dir);
      const mdFiles = all.filter((f) => isMarkdownOrText(f));
      for (const file of mdFiles) {
        try {
          const content = await fsp.readFile(file, 'utf-8');
          const title = extractFirstHeading(content);
          items.push({
            id: `doc:${encodeURIComponent(file)}`,
            title,
            path: file,
            relPath: relative(process.cwd(), file),
          });
        } catch {
          // skip unreadable files
        }
      }
    } catch {
      // directory may not exist; skip
    }
  }

  // Add synthetic "Database Overview" doc
  items.unshift({
    id: `doc:${encodeURIComponent('database:overview')}`,
    title: 'Database Overview',
    path: 'database:overview',
    relPath: 'database:overview',
  });

  // Sort by title
  items.sort((a, b) => a.title.localeCompare(b.title));
  return items;
}

async function buildDatabaseOverviewActions() {
  // Select relevant files to consolidate
  const candidates = [
    join(process.cwd(), 'docs', 'features', 'DATABASE.md'),
    join(process.cwd(), 'sparti-cms', 'docs', 'database-rules.md'),
    join(process.cwd(), 'docs', 'development', 'database-audit-implementation-plan.md'),
    join(process.cwd(), 'docs', 'setup', 'POSTGRES_MCP_SETUP.md'),
    join(process.cwd(), 'docs', 'setup', 'POSTGRES_MCP_SETUP_RAILWAY.md'),
  ];

  const actions = [];
  for (const file of candidates) {
    try {
      const content = await fsp.readFile(file, 'utf-8');
      const extracted = extractActions(content, relative(process.cwd(), file));
      // Prefix tasks with source for clarity
      extracted.forEach((a) => {
        actions.push({
          task: a.task,
          description: a.description,
          status: a.status,
          filesTouched: a.filesTouched,
        });
      });
    } catch {
      // skip missing files
    }
  }

  if (actions.length === 0) {
    actions.push({
      task: 'Document DB Architecture',
      description: 'Create an overview of core modules, relationships, tenancy, and workflows.',
      status: 'todo',
      filesTouched: ['database:overview'],
    });
  }

  return actions;
}

// List docs for Kanban
router.get('/api/docs/list', async (req, res) => {
  try {
    const items = await listDocs();
    res.json({ success: true, items });
  } catch (error) {
    console.error('[docs] list error:', error);
    res.status(500).json({ success: false, error: 'Failed to list docs' });
  }
});

// Return action items for a given doc path or synthetic id
router.get('/api/docs/actions', async (req, res) => {
  try {
    const rawPath = req.query.path;
    if (!rawPath || typeof rawPath !== 'string') {
      return res.status(400).json({ success: false, error: 'path is required' });
    }
    const decoded = decodeURIComponent(rawPath);

    if (decoded === 'database:overview') {
      const actions = await buildDatabaseOverviewActions();
      return res.json({ success: true, actions });
    }

    // Read and parse the requested file
    const content = await fsp.readFile(decoded, 'utf-8');
    const actions = extractActions(content, relative(process.cwd(), decoded));
    res.json({ success: true, actions });
  } catch (error) {
    console.error('[docs] actions error:', error);
    res.status(500).json({ success: false, error: 'Failed to read document actions' });
  }
});

export default router;