import {
  listPosts,
  getPost,
  getPostBySlug,
  listCategories,
  getCategory,
  listTags,
  listAuthors,
  getAuthor,
  getFeaturedMedia,
} from '../wordpress.js';

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const wordpressToolDefinitions = [
  {
    name: 'wp_list_posts',
    description:
      'List WordPress blog posts with optional filters. Returns paginated results with titles, slugs, excerpts, dates, authors, categories, and tags.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Page number for pagination (default: 1).',
        },
        per_page: {
          type: 'number',
          description: 'Number of posts per page (default: 10, max: 100).',
        },
        search: {
          type: 'string',
          description: 'Search keyword to filter posts by title and content.',
        },
        status: {
          type: 'string',
          enum: ['publish', 'draft', 'private', 'pending', 'future', 'any'],
          description: "Filter by post status (default: 'publish'). Use 'any' for all statuses. Requires authentication for non-public statuses.",
        },
        categories: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter by category IDs.',
        },
        tags: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter by tag IDs.',
        },
        author: {
          type: 'number',
          description: 'Filter by author user ID.',
        },
        order: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: "Sort order (default: 'desc').",
        },
        orderby: {
          type: 'string',
          enum: ['date', 'modified', 'title', 'author', 'id', 'relevance'],
          description: "Field to sort by (default: 'date').",
        },
        after: {
          type: 'string',
          description: 'Return posts published after this ISO 8601 date (e.g. 2024-01-01T00:00:00).',
        },
        before: {
          type: 'string',
          description: 'Return posts published before this ISO 8601 date.',
        },
        sticky: {
          type: 'boolean',
          description: 'Filter to only sticky (true) or non-sticky (false) posts.',
        },
      },
    },
  },
  {
    name: 'wp_get_post',
    description:
      'Fetch a single WordPress post by its ID or slug, returning the full content, excerpt, metadata, categories, and tags.',
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
    name: 'wp_list_categories',
    description: 'List all WordPress categories with post counts.',
    inputSchema: {
      type: 'object',
      properties: {
        per_page: {
          type: 'number',
          description: 'Number of categories to return (default: 100, max: 100).',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination.',
        },
        search: {
          type: 'string',
          description: 'Search keyword to filter categories by name.',
        },
        parent: {
          type: 'number',
          description: 'Filter to children of a specific category ID. Use 0 for top-level.',
        },
        hide_empty: {
          type: 'boolean',
          description: 'Whether to hide categories with no posts (default: false).',
        },
      },
    },
  },
  {
    name: 'wp_get_category',
    description: 'Get details about a specific WordPress category by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Category ID.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'wp_list_tags',
    description: 'List all WordPress tags with post counts.',
    inputSchema: {
      type: 'object',
      properties: {
        per_page: {
          type: 'number',
          description: 'Number of tags to return (default: 100, max: 100).',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination.',
        },
        search: {
          type: 'string',
          description: 'Search keyword to filter tags by name.',
        },
        hide_empty: {
          type: 'boolean',
          description: 'Whether to hide tags with no posts (default: false).',
        },
      },
    },
  },
  {
    name: 'wp_list_authors',
    description: 'List WordPress users/authors.',
    inputSchema: {
      type: 'object',
      properties: {
        per_page: {
          type: 'number',
          description: 'Number of authors to return (default: 100).',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination.',
        },
      },
    },
  },
  {
    name: 'wp_get_author',
    description: 'Get details about a specific WordPress author by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Author/user ID.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'wp_get_featured_media',
    description: 'Fetch details (URL, dimensions, alt text) of a featured media attachment by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Media attachment ID.',
        },
      },
      required: ['id'],
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
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

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleListPosts(args: ToolArgs) {
  const result = await listPosts({
    page: args.page as number | undefined,
    per_page: args.per_page as number | undefined,
    search: args.search as string | undefined,
    status: args.status as string | undefined,
    categories: args.categories as number[] | undefined,
    tags: args.tags as number[] | undefined,
    author: args.author as number | undefined,
    order: args.order as 'asc' | 'desc' | undefined,
    orderby: args.orderby as string | undefined,
    after: args.after as string | undefined,
    before: args.before as string | undefined,
    sticky: args.sticky as boolean | undefined,
  });

  const posts = result.data.map((p) => ({
    id: p.id,
    date: p.date,
    modified: p.modified,
    slug: p.slug,
    status: p.status,
    link: p.link,
    title: p.title.rendered,
    excerpt: p.excerpt.rendered,
    author: p.author,
    featured_media: p.featured_media,
    categories: p.categories,
    tags: p.tags,
    format: p.format,
  }));

  return text({
    posts,
    total: result.total,
    total_pages: result.totalPages,
    page: args.page ?? 1,
    per_page: args.per_page ?? 10,
  });
}

async function handleGetPost(args: ToolArgs) {
  const id = args.id as number | undefined;
  const slug = args.slug as string | undefined;

  if (!id && !slug) {
    return errorText('Provide either "id" or "slug".');
  }

  const result = id ? await getPost(id) : await getPostBySlug(slug!);
  const p = result.data;

  return text({
    id: p.id,
    date: p.date,
    modified: p.modified,
    slug: p.slug,
    status: p.status,
    link: p.link,
    title: p.title.rendered,
    content: p.content.rendered,
    excerpt: p.excerpt.rendered,
    author: p.author,
    featured_media: p.featured_media,
    categories: p.categories,
    tags: p.tags,
    format: p.format,
    meta: p.meta,
  });
}

async function handleListCategories(args: ToolArgs) {
  const result = await listCategories({
    per_page: args.per_page as number | undefined,
    page: args.page as number | undefined,
    search: args.search as string | undefined,
    parent: args.parent as number | undefined,
    hide_empty: args.hide_empty as boolean | undefined,
  });

  return text({
    categories: result.data,
    total: result.total,
    total_pages: result.totalPages,
  });
}

async function handleGetCategory(args: ToolArgs) {
  const id = args.id as number;
  const result = await getCategory(id);
  return text(result.data);
}

async function handleListTags(args: ToolArgs) {
  const result = await listTags({
    per_page: args.per_page as number | undefined,
    page: args.page as number | undefined,
    search: args.search as string | undefined,
    hide_empty: args.hide_empty as boolean | undefined,
  });

  return text({
    tags: result.data,
    total: result.total,
    total_pages: result.totalPages,
  });
}

async function handleListAuthors(args: ToolArgs) {
  const result = await listAuthors({
    per_page: args.per_page as number | undefined,
    page: args.page as number | undefined,
  });

  return text({
    authors: result.data.map((u) => ({
      id: u.id,
      name: u.name,
      slug: u.slug,
      link: u.link,
      description: u.description,
      avatar_urls: u.avatar_urls,
    })),
    total: result.total,
  });
}

async function handleGetAuthor(args: ToolArgs) {
  const id = args.id as number;
  const result = await getAuthor(id);
  const u = result.data;
  return text({
    id: u.id,
    name: u.name,
    slug: u.slug,
    link: u.link,
    description: u.description,
    avatar_urls: u.avatar_urls,
  });
}

async function handleGetFeaturedMedia(args: ToolArgs) {
  const id = args.id as number;
  const result = await getFeaturedMedia(id);
  const m = result.data;
  return text({
    id: m.id,
    date: m.date,
    slug: m.slug,
    link: m.link,
    title: m.title.rendered,
    caption: m.caption.rendered,
    alt_text: m.alt_text,
    media_type: m.media_type,
    mime_type: m.mime_type,
    source_url: m.source_url,
    media_details: m.media_details,
  });
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export async function handleWordPressTool(
  name: string,
  args: ToolArgs
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError: boolean }> {
  try {
    switch (name) {
      case 'wp_list_posts':         return await handleListPosts(args);
      case 'wp_get_post':           return await handleGetPost(args);
      case 'wp_list_categories':    return await handleListCategories(args);
      case 'wp_get_category':       return await handleGetCategory(args);
      case 'wp_list_tags':          return await handleListTags(args);
      case 'wp_list_authors':       return await handleListAuthors(args);
      case 'wp_get_author':         return await handleGetAuthor(args);
      case 'wp_get_featured_media': return await handleGetFeaturedMedia(args);
      default:
        return errorText(`Unknown tool: ${name}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorText(`Tool "${name}" failed: ${message}`);
  }
}
