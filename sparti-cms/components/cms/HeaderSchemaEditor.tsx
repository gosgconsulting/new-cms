import React from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { HeaderSchema } from '../../types/schema';
import { LogoEditor } from './schema-form-helpers/LogoEditor';
import { MenuItemsList } from './schema-form-helpers/MenuItemEditor';
import { ToggleField } from './schema-form-helpers/ToggleField';
import { useSchemaEditor } from '../../hooks/useSchemaEditor';

interface HeaderSchemaEditorProps {
  onBack: () => void;
}

const defaultHeaderSchema: HeaderSchema = {
  logo: {
    src: '',
    alt: '',
    height: 'h-8'
  },
  menu: [],
  showCart: true,
  showSearch: true,
  showAccount: true
};

export const HeaderSchemaEditor: React.FC<HeaderSchemaEditorProps> = ({ onBack }) => {
  const { schema, loading, saving, saveSchema, updateSchema } = useSchemaEditor<HeaderSchema>({
    schemaKey: 'header',
    defaultSchema: defaultHeaderSchema
  });

  const handleSave = async () => {
    await saveSchema(schema);
  };

  const updateLogo = (logo: HeaderSchema['logo']) => {
    updateSchema({ logo });
  };

  const updateMenu = (menu: HeaderSchema['menu']) => {
    updateSchema({ menu });
  };

  const updateDisplayOption = (option: keyof Pick<HeaderSchema, 'showCart' | 'showSearch' | 'showAccount'>, value: boolean) => {
    updateSchema({ [option]: value });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading header schema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Header Schema Editor</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Configure your site's header navigation, logo, and display options
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Logo Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo Configuration</h3>
            <LogoEditor
              logo={schema.logo}
              onChange={updateLogo}
              showHeight={true}
              title="Header Logo"
            />
          </div>

          {/* Menu Items Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Menu</h3>
            <MenuItemsList
              items={schema.menu}
              onChange={updateMenu}
              title="Menu Items"
              addButtonText="Add Menu Item"
            />
          </div>

          {/* Display Options Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <ToggleField
                  id="show-cart"
                  label="Show Shopping Cart"
                  checked={schema.showCart}
                  onChange={(checked) => updateDisplayOption('showCart', checked)}
                  description="Display shopping cart icon in header"
                />
                <ToggleField
                  id="show-search"
                  label="Show Search"
                  checked={schema.showSearch}
                  onChange={(checked) => updateDisplayOption('showSearch', checked)}
                  description="Display search icon in header"
                />
                <ToggleField
                  id="show-account"
                  label="Show Account"
                  checked={schema.showAccount}
                  onChange={(checked) => updateDisplayOption('showAccount', checked)}
                  description="Display account/user icon in header"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSchemaEditor;
