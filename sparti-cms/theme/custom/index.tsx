import React from 'react';

interface CustomThemeProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

/**
 * Custom Theme
 * Minimal placeholder theme used by the visual builder when a tenant selects "custom".
 */
const CustomTheme: React.FC<CustomThemeProps> = ({
  tenantName = 'Custom',
  tenantSlug = 'custom',
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-xl w-full border rounded-lg bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{tenantName} Theme</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a minimal placeholder theme for <code className="px-1 py-0.5 rounded bg-muted">{tenantSlug}</code>.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Add your implementation under{' '}
          <code className="px-1 py-0.5 rounded bg-muted">sparti-cms/theme/custom/</code> (export a default React component).
        </p>
      </div>
    </div>
  );
};

export default CustomTheme;
