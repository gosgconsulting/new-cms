import { query } from '../db.js';

// ---------------------------------------------------------------------------
// Tool definitions (schemas consumed by the MCP ListTools handler)
// ---------------------------------------------------------------------------

export const postToolDefinitions = [
  {
    name: 'list_posts',
    description:
      'List blog posts with optional filters. Returns paginated results including id, title, slug, status, published_at, author_id, and category/tag counts.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'published', 'private', 'trash'],
          description: 'Filter by post status. Omit to return all statuses.',
        },
        tenant_id: {
          type: 'string',
          description: 'Filter by tenant ID.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of posts to return (default: 20, max: 100).',
        },
        offset: {
          type: 'number',
          description: 'Number of posts to skip for pagination (default: 0).',
        },
      },
    },
  },
  {
    name: 'get_post',
    description:
      'Fetch a single blog post by its ID or slug, including associated categories and tags.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Post ID (use either id or slug, not both).',
        },
        slug: {
          type: 'string',
          description: 'Post slug (use either id or slug, not both).',
        },
      },
    },
  },
  {
    name: 'search_posts',
    description: 'Full-text search across post titles and content.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term to match against title and content.',
        },
        tenant_id: {
          type: 'string',
          description: 'Limit search to a specific tenant.',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'private', 'trash'],
          description: 'Filter results by status.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_post',
    description:
      'Create a new blog post. Returns the newly created post object.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Post title (required).',
        },
        slug: {
          type: 'string',
          description:
            'URL slug (required, must be unique). Use lowercase letters, numbers, and hyphens only.',
        },
        content: {
          type: 'string',
          description: 'Full HTML/Markdown content of the post.',
        },
        excerpt: {
          type: 'string',
          description: 'Short summary shown in post listings.',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'private'],
          description: "Post status (default: 'draft').",
        },
        author_id: {
          type: 'number',
          description: 'ID of the author user.',
        },
        tenant_id: {
          type: 'string',
          description: 'Tenant this post belongs to.',
        },
        featured_image_id: {
          type: 'number',
          description: 'ID of the featured media image.',
        },
        categories: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of category IDs to attach.',
        },
        tags: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of tag IDs to attach.',
        },
        meta_title: { type: 'string', description: 'SEO meta title.' },
        meta_description: { type: 'string', description: 'SEO meta description.' },
        meta_keywords: { type: 'string', description: 'SEO meta keywords.' },
        og_title: { type: 'string', description: 'Open Graph title.' },
        og_description: { type: 'string', description: 'Open Graph description.' },
        twitter_title: { type: 'string', description: 'Twitter card title.' },
        twitter_description: { type: 'string', description: 'Twitter card description.' },
      },
      required: ['title', 'slug'],
    },
  },
  {
    name: 'update_post',
    description:
      'Update an existing blog post by ID. Only the fields you provide will be updated.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the post to update (required).',
        },
        title: { type: 'string' },
        slug: { type: 'string' },
        content: { type: 'string' },
        excerpt: { type: 'string' },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'private', 'trash'],
        },
        author_id: { type: 'number' },
        featured_image_id: { type: 'number' },
        categories: {
          type: 'array',
          items: { type: 'number' },
          description: 'Replace the full set of categories with these IDs.',
        },
        tags: {
          type: 'array',
          items: { type: 'number' },
          description: 'Replace the full set of tags with these IDs.',
        },
        meta_title: { type: 'string' },
        meta_description: { type: 'string' },
        meta_keywords: { type: 'string' },
        og_title: { type: 'string' },
        og_description: { type: 'string' },
        twitter_title: { type: 'string' },
        twitter_description: { type: 'string' },
      },
      required: ['id'],
    },
  },
  {
    name: 'publish_post',
    description:
      "Set a post's status to 'published' and record the published_at timestamp if not already set.",
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the post to publish.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'unpublish_post',
    description: "Revert a post back to 'draft' status.",
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the post to unpublish.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_categories',
    description: 'List all available blog categories.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: {
          type: 'string',
          description: 'Filter categories by tenant.',
        },
      },
    },
  },
  {
    name: 'list_tags',
    description: 'List all available blog tags.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: {
          type: 'string',
          description: 'Filter tags by tenant.',
        },
      },
    },
  },
  {
    name: 'create_category',
    description: 'Create a new category in the CMS.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Category name (e.g. "Technology").',
        },
        slug: {
          type: 'string',
          description: 'Unique URL slug.',
        },
        description: {
          type: 'string',
        },
        parent_id: {
          type: 'number',
          description: 'ID of the parent category, if nested.',
        },
        tenant_id: {
          type: 'string',
          description: 'Tenant ID the category belongs to.',
        },
      },
      required: ['name', 'slug'],
    },
  },
  {
    name: 'get_post_stats',
    description:
      'Return a summary count of posts grouped by status (published, draft, private, trash).',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: {
          type: 'string',
          description: 'Scope stats to a specific tenant.',
        },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

type ToolArgs = Record<string, unknown>;

function text(content: unknown): { content: Array<{ type: 'text'; text: string }>; isError: false } {
  return {
    content: [{ type: 'text', text: JSON.stringify(content, null, 2) }],
    isError: false,
  };
}

function errorText(message: string): { content: Array<{ type: 'text'; text: string }>; isError: true } {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

// --- list_posts ---
async function listPosts(args: ToolArgs) {
  const status = args.status as string | undefined;
  const tenantId = args.tenant_id as string | undefined;
  const limit = Math.min(Number(args.limit ?? 20), 100);
  const offset = Number(args.offset ?? 0);

  const params: unknown[] = [];
  const conditions: string[] = [];

  if (status) {
    params.push(status);
    conditions.push(`p.status = $${params.length}`);
  }
  if (tenantId) {
    params.push(tenantId);
    conditions.push(`p.tenant_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const sql = `
    SELECT
      p.id, p.title, p.slug, p.excerpt, p.status, p.post_type,
      p.author_id, p.tenant_id, p.view_count,
      p.created_at, p.updated_at, p.published_at,
      p.meta_title, p.meta_description,
      COUNT(DISTINCT pc.category_id) AS category_count,
      COUNT(DISTINCT pt.tag_id) AS tag_count
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    ${where}
    GROUP BY p.id
    ORDER BY p.updated_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const result = await query(sql, params);
  return text({ posts: result.rows, total: result.rowCount });
}

// --- get_post ---
async function getPost(args: ToolArgs) {
  const id = args.id as number | undefined;
  const slug = args.slug as string | undefined;

  if (!id && !slug) {
    return errorText('Provide either "id" or "slug".');
  }

  const condition = id ? 'p.id = $1' : 'p.slug = $1';
  const param = id ?? slug;

  const sql = `
    SELECT
      p.*,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
        FILTER (WHERE c.id IS NOT NULL), '[]'
      ) AS categories,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
        FILTER (WHERE t.id IS NOT NULL), '[]'
      ) AS tags
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE ${condition}
    GROUP BY p.id
  `;

  const result = await query(sql, [param]);
  if (!result.rows[0]) {
    return errorText(`Post not found (${id ? `id=${id}` : `slug=${slug}`}).`);
  }
  return text(result.rows[0]);
}

// --- search_posts ---
async function searchPosts(args: ToolArgs) {
  const searchTerm = args.query as string;
  const tenantId = args.tenant_id as string | undefined;
  const status = args.status as string | undefined;
  const limit = Math.min(Number(args.limit ?? 20), 100);

  const params: unknown[] = [`%${searchTerm}%`];
  const conditions: string[] = ['(title ILIKE $1 OR content ILIKE $1)'];

  if (tenantId) {
    params.push(tenantId);
    conditions.push(`tenant_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  params.push(limit);

  const sql = `
    SELECT id, title, slug, excerpt, status, author_id, tenant_id, created_at, updated_at, published_at
    FROM posts
    WHERE ${conditions.join(' AND ')}
    ORDER BY updated_at DESC
    LIMIT $${params.length}
  `;

  const result = await query(sql, params);
  return text({ posts: result.rows, total: result.rowCount });
}

// --- create_post ---
async function createPost(args: ToolArgs) {
  const categories = (args.categories as number[] | undefined) ?? [];
  const tags = (args.tags as number[] | undefined) ?? [];

  // Build dynamic INSERT
  const allowedFields = [
    'title', 'slug', 'content', 'excerpt', 'status', 'post_type',
    'author_id', 'tenant_id', 'featured_image_id', 'parent_id', 'menu_order',
    'meta_title', 'meta_description', 'meta_keywords', 'canonical_url', 'robots_meta',
    'og_title', 'og_description', 'og_image',
    'twitter_title', 'twitter_description', 'twitter_image',
  ] as const;

  const cols: string[] = [];
  const vals: unknown[] = [];

  for (const field of allowedFields) {
    if (args[field] !== undefined) {
      cols.push(field);
      vals.push(args[field]);
    }
  }

  if (cols.length === 0) {
    return errorText('No valid fields provided for post creation.');
  }

  // Always set timestamps
  cols.push('created_at', 'updated_at');
  vals.push(new Date(), new Date());

  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `
    INSERT INTO posts (${cols.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await query(sql, vals);
  const post = result.rows[0];
  if (!post) {
    return errorText('Failed to create post.');
  }

  // Attach categories and tags
  await syncRelations(post.id as number, categories, tags);

  return text(post);
}

// --- update_post ---
async function updatePost(args: ToolArgs) {
  const id = args.id as number;
  const categories = args.categories as number[] | undefined;
  const tags = args.tags as number[] | undefined;

  const allowedFields = [
    'title', 'slug', 'content', 'excerpt', 'status', 'post_type',
    'author_id', 'featured_image_id', 'parent_id', 'menu_order',
    'meta_title', 'meta_description', 'meta_keywords', 'canonical_url', 'robots_meta',
    'og_title', 'og_description', 'og_image',
    'twitter_title', 'twitter_description', 'twitter_image',
  ] as const;

  const setClauses: string[] = [];
  const vals: unknown[] = [];

  for (const field of allowedFields) {
    if (args[field] !== undefined) {
      vals.push(args[field]);
      setClauses.push(`${field} = $${vals.length}`);
    }
  }

  if (setClauses.length === 0 && categories === undefined && tags === undefined) {
    return errorText('No fields to update were provided.');
  }

  if (setClauses.length > 0) {
    vals.push(new Date());
    setClauses.push(`updated_at = $${vals.length}`);
    vals.push(id);

    const sql = `
      UPDATE posts
      SET ${setClauses.join(', ')}
      WHERE id = $${vals.length}
      RETURNING *
    `;
    const result = await query(sql, vals);
    if (!result.rows[0]) {
      return errorText(`Post with id=${id} not found.`);
    }
  }

  if (categories !== undefined || tags !== undefined) {
    await syncRelations(id, categories ?? null, tags ?? null);
  }

  // Return updated post with relations
  return getPost({ id });
}

// --- publish_post ---
async function publishPost(args: ToolArgs) {
  const id = args.id as number;
  const result = await query(
    `UPDATE posts
     SET status = 'published',
         published_at = COALESCE(published_at, NOW()),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  if (!result.rows[0]) {
    return errorText(`Post with id=${id} not found.`);
  }
  return text(result.rows[0]);
}

// --- unpublish_post ---
async function unpublishPost(args: ToolArgs) {
  const id = args.id as number;
  const result = await query(
    `UPDATE posts
     SET status = 'draft', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  if (!result.rows[0]) {
    return errorText(`Post with id=${id} not found.`);
  }
  return text(result.rows[0]);
}

// --- list_categories ---
async function listCategories(args: ToolArgs) {
  const tenantId = args.tenant_id as string | undefined;
  const params: unknown[] = [];
  const where = tenantId ? (params.push(tenantId), `WHERE tenant_id = $1`) : '';

  const result = await query(
    `SELECT id, name, slug, description, parent_id, post_count FROM categories ${where} ORDER BY name`,
    params
  );
  return text(result.rows);
}

// --- create_category ---
async function createCategory(args: ToolArgs) {
  const name = args.name as string;
  const slug = args.slug as string;
  const description = (args.description as string | undefined) ?? '';
  const parentId = args.parent_id as number | null | undefined;
  const tenantId = args.tenant_id as string | null | undefined;

  const sql = `
    INSERT INTO categories (name, slug, description, parent_id, tenant_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (slug, COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000')) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id
    RETURNING *
  `;

  const result = await query(sql, [name, slug, description, parentId ?? null, tenantId ?? null]);
  if (!result.rows[0]) {
    return errorText('Failed to sync category.');
  }

  return text(result.rows[0]);
}

// --- list_tags ---
async function listTags(args: ToolArgs) {
  const tenantId = args.tenant_id as string | undefined;
  const params: unknown[] = [];
  const where = tenantId ? (params.push(tenantId), `WHERE tenant_id = $1`) : '';

  const result = await query(
    `SELECT id, name, slug, description, post_count FROM tags ${where} ORDER BY name`,
    params
  );
  return text(result.rows);
}

// --- get_post_stats ---
async function getPostStats(args: ToolArgs) {
  const tenantId = args.tenant_id as string | undefined;
  const params: unknown[] = [];
  const where = tenantId ? (params.push(tenantId), `WHERE tenant_id = $1`) : '';

  const result = await query(
    `SELECT
       COUNT(*) AS total,
       COUNT(CASE WHEN status = 'published' THEN 1 END) AS published,
       COUNT(CASE WHEN status = 'draft'     THEN 1 END) AS draft,
       COUNT(CASE WHEN status = 'private'   THEN 1 END) AS private,
       COUNT(CASE WHEN status = 'trash'     THEN 1 END) AS trash
     FROM posts ${where}`,
    params
  );
  return text(result.rows[0]);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function syncRelations(
  postId: number,
  categories: number[] | null,
  tags: number[] | null
): Promise<void> {
  if (categories !== null) {
    await query('DELETE FROM post_categories WHERE post_id = $1', [postId]);
    for (const catId of categories) {
      await query(
        'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [postId, catId]
      );
    }
  }

  if (tags !== null) {
    await query('DELETE FROM post_tags WHERE post_id = $1', [postId]);
    for (const tagId of tags) {
      await query(
        'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [postId, tagId]
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Dispatcher — called by the MCP CallTool handler
// ---------------------------------------------------------------------------

export async function handlePostTool(
  name: string,
  args: ToolArgs
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError: boolean }> {
  try {
    switch (name) {
      case 'list_posts':       return await listPosts(args);
      case 'get_post':         return await getPost(args);
      case 'search_posts':     return await searchPosts(args);
      case 'create_post':      return await createPost(args);
      case 'update_post':      return await updatePost(args);
      case 'publish_post':     return await publishPost(args);
      case 'unpublish_post':   return await unpublishPost(args);
      case 'list_categories':  return await listCategories(args);
      case 'create_category':  return await createCategory(args);
      case 'list_tags':        return await listTags(args);
      case 'get_post_stats':   return await getPostStats(args);
      default:
        return errorText(`Unknown tool: ${name}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorText(`Tool "${name}" failed: ${message}`);
  }
}
