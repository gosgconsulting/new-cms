import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Textarea } from '../../../src/components/ui/textarea';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { ArrowLeft, Save, Loader2, Code } from 'lucide-react';
import { HeaderSchema } from '../../types/schema';
import { LogoEditor } from './schema-form-helpers/LogoEditor';
import { MenuItemsList } from './schema-form-helpers/MenuItemEditor';
import { ToggleField } from './schema-form-helpers/ToggleField';
import { DynamicFieldsSection } from './schema-form-helpers/DynamicFieldsSection';
import { useSchemaEditor } from '../../hooks/useSchemaEditor';
import { useAuth } from '../auth/AuthProvider';
import { getKnownFields } from '../../utils/schemaHelpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../../src/components/ui/dialog";

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
  const { user } = useAuth();
  const { schema, loading, saving, saveSchema, updateSchema, setSchema } = useSchemaEditor<HeaderSchema>({
    schemaKey: 'header',
    defaultSchema: defaultHeaderSchema
  });
  
  const [showJSONEditor, setShowJSONEditor] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (showJSONEditor) {
      setJsonString(JSON.stringify(schema, null, 2));
      setJsonError(null);
    }
  }, [showJSONEditor, schema]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJsonString = e.target.value;
    setJsonString(newJsonString);
    try {
      const parsed = JSON.parse(newJsonString);
      setSchema(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON format.');
    }
  };

  const handleSave = async () => {
    await saveSchema(schema);
  };

  const updateLogo = (logo: HeaderSchema['logo']) => {
    updateSchema({ logo });
  };

  const updateMenu = (menu: HeaderSchema['menu']) => {
    updateSchema({ menu });
  };
  
  const updateButton = (button: any) => {
    updateSchema({ button });
  };

  const updateDisplayOption = (option: keyof Pick<HeaderSchema, 'showCart' | 'showSearch' | 'showAccount'>, value: boolean) => {
    updateSchema({ [option]: value });
  };

  // Handler for dynamic fields that can handle field deletion
  const handleDynamicFieldsUpdate = (updates: Record<string, any>) => {
    // Check if any field is being deleted (undefined value)
    const hasDeletions = Object.values(updates).some(v => v === undefined);
    
    if (hasDeletions) {
      // For deletions, we need to reconstruct the schema without deleted fields
      const updatedSchema = { ...schema };
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) {
          delete updatedSchema[key];
        } else {
          updatedSchema[key] = value;
        }
      }
      setSchema(updatedSchema);
    } else {
      // Regular partial update
      updateSchema(updates);
    }
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
            <div className="flex items-center gap-2">
              {user?.is_super_admin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowJSONEditor(true)}
                >
                  <Code className="h-4 w-4 mr-2" />
                  JSON Editor
                </Button>
              )}
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

          {/* Button Section */}
          {schema.button !== undefined && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Call to Action Button</h3>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-xs">Button Label</Label>
                    <Input
                      value={schema.button.label || ''}
                      onChange={(e) => updateButton({...schema.button, label: e.target.value})}
                      placeholder="e.g., Contact Us, Get Started"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Button Link</Label>
                    <Input
                      value={schema.button.link || ''}
                      onChange={(e) => updateButton({...schema.button, link: e.target.value})}
                      placeholder="e.g., /contact, /get-started"
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Menu Items Section */}
          {schema.menu !== undefined && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Menu</h3>
              <MenuItemsList
                items={schema.menu}
                onChange={updateMenu}
                title="Menu Items"
                addButtonText="Add Menu Item"
              />
            </div>
          )}

          {/* Display Options Section */}
          {(schema.showCart !== undefined || schema.showSearch !== undefined || schema.showAccount !== undefined) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
              <Card>
                <CardContent className="p-6 space-y-4">
                  {schema.showCart !== undefined && (
                    <ToggleField
                      id="show-cart"
                      label="Show Shopping Cart"
                      checked={schema.showCart}
                      onChange={(checked) => updateDisplayOption('showCart', checked)}
                      description="Display shopping cart icon in header"
                    />
                  )}
                  {schema.showSearch !== undefined && (
                    <ToggleField
                      id="show-search"
                      label="Show Search"
                      checked={schema.showSearch}
                      onChange={(checked) => updateDisplayOption('showSearch', checked)}
                      description="Display search icon in header"
                    />
                  )}
                  {schema.showAccount !== undefined && (
                    <ToggleField
                      id="show-account"
                      label="Show Account"
                      checked={schema.showAccount}
                      onChange={(checked) => updateDisplayOption('showAccount', checked)}
                      description="Display account/user icon in header"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Custom Fields Section */}
          <DynamicFieldsSection
            schema={schema}
            knownFields={getKnownFields('header')}
            onUpdateSchema={handleDynamicFieldsUpdate}
            title="Custom Fields"
          />
        </div>
      </div>
      
      {/* JSON Editor Dialog */}
      <Dialog open={showJSONEditor} onOpenChange={setShowJSONEditor}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Header Schema JSON Editor</DialogTitle>
            <DialogDescription>
              Edit the complete header schema structure. Be careful with this editor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4">
            <Textarea
              value={jsonString}
              onChange={handleJsonChange}
              className="w-full h-full font-mono text-sm resize-none"
              placeholder="Enter header schema as JSON..."
            />
            {jsonError && <p className="text-destructive text-sm mt-2">{jsonError}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                handleSave();
                setShowJSONEditor(false);
              }}
              disabled={!!jsonError}
            >
              Save & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeaderSchemaEditor;
