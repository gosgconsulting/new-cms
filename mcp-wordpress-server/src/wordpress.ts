/**
 * WordPress REST API client using Application Password authentication.
 * https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/#application-passwords
 */

function getConfig() {
  const url = process.env.WORDPRESS_URL?.replace(/\/$/, '');
  const username = process.env.WORDPRESS_USERNAME;
  const appPassword = process.env.WORDPRESS_APP_PASSWORD;

  if (!url || !username || !appPassword) {
    throw new Error('WORDPRESS_URL, WORDPRESS_USERNAME, and WORDPRESS_APP_PASSWORD must be set.');
  }

  return { url, username, appPassword };
}

function buildAuthHeader(): string {
  const { username, appPassword } = getConfig();
  const token = Buffer.from(`${username}:${appPassword}`).toString('base64');
  return `Basic ${token}`;
}

export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  format: string;
  meta: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
}

export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: Record<string, string>;
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  author: number;
  caption: { rendered: string };
  alt_text: string;
  media_type: string;
  mime_type: string;
  source_url: string;
  media_details: {
    width?: number;
    height?: number;
    file?: string;
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
}

export interface ListPostsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  categories?: number[];
  tags?: number[];
  author?: number;
  order?: 'asc' | 'desc';
  orderby?: string;
  after?: string;
  before?: string;
  sticky?: boolean;
}

async function wpFetch<T>(path: string, params?: Record<string, string | number | boolean | number[]>): Promise<{ data: T; total: number; totalPages: number }> {
  const { url } = getConfig();
  const endpoint = new URL(`${url}/wp-json/wp/v2${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        endpoint.searchParams.set(key, value.join(','));
      } else {
        endpoint.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(endpoint.toString(), {
    headers: {
      Authorization: buildAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WordPress API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as T;
  const total = Number(response.headers.get('X-WP-Total') ?? 0);
  const totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 1);

  return { data, total, totalPages };
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function listPosts(params: ListPostsParams = {}) {
  const query: Record<string, string | number | boolean | number[]> = {
    page: params.page ?? 1,
    per_page: Math.min(params.per_page ?? 10, 100),
    _embed: false,
  };

  if (params.search) query.search = params.search;
  if (params.status) query.status = params.status;
  if (params.categories?.length) query.categories = params.categories;
  if (params.tags?.length) query.tags = params.tags;
  if (params.author) query.author = params.author;
  if (params.order) query.order = params.order;
  if (params.orderby) query.orderby = params.orderby;
  if (params.after) query.after = params.after;
  if (params.before) query.before = params.before;
  if (params.sticky !== undefined) query.sticky = params.sticky;

  return wpFetch<WPPost[]>('/posts', query);
}

export async function getPost(id: number) {
  return wpFetch<WPPost>(`/posts/${id}`);
}

export async function getPostBySlug(slug: string) {
  const result = await wpFetch<WPPost[]>('/posts', { slug });
  const post = result.data[0];
  if (!post) throw new Error(`Post not found with slug: ${slug}`);
  return { data: post, total: result.total, totalPages: result.totalPages };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listCategories(params: { per_page?: number; page?: number; search?: string; parent?: number; hide_empty?: boolean } = {}) {
  const query: Record<string, string | number | boolean | number[]> = {
    per_page: Math.min(params.per_page ?? 100, 100),
    page: params.page ?? 1,
  };
  if (params.search) query.search = params.search;
  if (params.parent !== undefined) query.parent = params.parent;
  if (params.hide_empty !== undefined) query.hide_empty = params.hide_empty;

  return wpFetch<WPCategory[]>('/categories', query);
}

export async function getCategory(id: number) {
  return wpFetch<WPCategory>(`/categories/${id}`);
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function listTags(params: { per_page?: number; page?: number; search?: string; hide_empty?: boolean } = {}) {
  const query: Record<string, string | number | boolean | number[]> = {
    per_page: Math.min(params.per_page ?? 100, 100),
    page: params.page ?? 1,
  };
  if (params.search) query.search = params.search;
  if (params.hide_empty !== undefined) query.hide_empty = params.hide_empty;

  return wpFetch<WPTag[]>('/tags', query);
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------

export async function listAuthors(params: { per_page?: number; page?: number } = {}) {
  const query: Record<string, string | number | boolean | number[]> = {
    per_page: Math.min(params.per_page ?? 100, 100),
    page: params.page ?? 1,
  };
  return wpFetch<WPUser[]>('/users', query);
}

export async function getAuthor(id: number) {
  return wpFetch<WPUser>(`/users/${id}`);
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export async function getFeaturedMedia(id: number) {
  return wpFetch<WPMedia>(`/media/${id}`);
}
