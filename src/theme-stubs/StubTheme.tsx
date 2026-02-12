import React from 'react';

/**
 * Placeholder component used when theme folder is excluded from deployment (e.g. Vercel CMS-only; themes served from Blob).
 * Build resolves sparti-cms/theme/* to these stubs when VITE_SKIP_THEMES=1 or VERCEL=1.
 */
export default function StubTheme() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
      Theme not loaded. Serve theme from Blob or include theme in deployment.
    </div>
  );
}
