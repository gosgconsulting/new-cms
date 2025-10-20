import { buildHead, escapeHtml, escapeAttr } from '../pageRenderer.js';

describe('escape helpers', () => {
  test('escapeHtml basic', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  test('escapeAttr quotes', () => {
    expect(escapeAttr('a"b')).toBe('a&quot;b');
  });
});

describe('buildHead', () => {
  test('uses page meta first', () => {
    const seo = { meta_title: 'SEO Title', meta_description: 'SEO Desc', og_image: '/img.png', site_favicon: '/fav.ico' };
    const page = { meta_title: 'Page Title', meta_description: 'Page Desc' };
    const head = buildHead(seo, page);
    expect(head).toContain('<title>Page Title</title>');
    expect(head).toContain('content="Page Desc"');
    expect(head).toContain('og:image');
    expect(head).toContain('fav.ico');
  });
});


