import { renderPageBySlug } from '../pageRenderer.js';

// Integration-ish test: assumes pages table seeded with '/'
describe('renderPageBySlug', () => {
  test('renders homepage HTML', async () => {
    const result = await renderPageBySlug('/');
    expect(result.status).toBe(200);
    expect(result.html).toContain('<!doctype html>');
    expect(result.html).toContain('<title');
  });
});


