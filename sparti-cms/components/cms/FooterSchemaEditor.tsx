import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { ArrowLeft, Save, Loader2, Plus, X, GripVertical, Code } from 'lucide-react';
import { FooterSchema } from '../../types/schema';
import { LogoEditor } from './schema-form-helpers/LogoEditor';
import { MenuItemsList } from './schema-form-helpers/MenuItemEditor';
import { ToggleField } from './schema-form-helpers/ToggleField';
import { useSchemaEditor } from '../../hooks/useSchemaEditor';
import { useAuth } from '../auth/AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../../src/components/ui/dialog";

interface FooterSchemaEditorProps {
  onBack: () => void;
}

interface FooterSection {
  title: string;
  links: Array<{ id: string; label: string; link: string }>;
}

const defaultFooterSchema: FooterSchema = {
  logo: {
    src: '',
    alt: ''
  },
  sections: [],
  legalLinks: [],
  copyright: '',
  description: '',
  showCurrencySwitcher: true,
  showLanguageSwitcher: true
};

export const FooterSchemaEditor: React.FC<FooterSchemaEditorProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { schema, loading, saving, saveSchema, updateSchema, setSchema } = useSchemaEditor<FooterSchema>({
    schemaKey: 'footer',
    defaultSchema: defaultFooterSchema
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

  const updateLogo = (logo: FooterSchema['logo']) => {
    updateSchema({ logo });
  };

  const updateSections = (sections: FooterSchema['sections']) => {
    updateSchema({ sections });
  };

  const updateLegalLinks = (legalLinks: FooterSchema['legalLinks']) => {
    updateSchema({ legalLinks });
  };

  const updateCopyright = (copyright: string) => {
    updateSchema({ copyright });
  };

  const updateDescription = (description: string) => {
    updateSchema({ description });
  };

  const updateDisplayOption = (option: keyof Pick<FooterSchema, 'showCurrencySwitcher' | 'showLanguageSwitcher'>, value: boolean) => {
    updateSchema({ [option]: value });
  };

  const addSection = () => {
    const newSection: FooterSection = {
      title: 'New Section',
      links: []
    };
    updateSections([...schema.sections, newSection]);
  };

  const updateSection = (index: number, updatedSection: FooterSection) => {
    const newSections = [...schema.sections];
    newSections[index] = updatedSection;
    updateSections(newSections);
  };

  const removeSection = (index: number) => {
    const newSections = schema.sections.filter((_, i) => i !== index);
    updateSections(newSections);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading footer schema...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Footer Schema Editor</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Configure your site's footer content, links, and display options
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer Logo</h3>
            <LogoEditor
              logo={schema.logo}
              onChange={updateLogo}
              showHeight={false}
              title="Footer Logo"
            />
          </div>

          {/* Navigation Sections */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Navigation Sections</h3>
              <Button onClick={addSection} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
            
            <div className="space-y-4">
              {schema.sections.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        Section #{sectionIndex + 1}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(sectionIndex)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Section Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(sectionIndex, { ...section, title: e.target.value })}
                        placeholder="e.g., Navigation, Support, Company"
                        className="text-sm"
                      />
                    </div>
                    <MenuItemsList
                      items={section.links}
                      onChange={(links) => updateSection(sectionIndex, { ...section, links })}
                      title="Section Links"
                      addButtonText="Add Link"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {schema.sections.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm">No sections added yet</p>
                <Button onClick={addSection} size="sm" variant="outline" className="mt-2">
                  Add Section
                </Button>
              </div>
            )}
          </div>

          {/* Legal Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Links</h3>
            <MenuItemsList
              items={schema.legalLinks}
              onChange={updateLegalLinks}
              title="Legal Links"
              addButtonText="Add Legal Link"
            />
          </div>

          {/* Content Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer Content</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-xs">Copyright Text</Label>
                  <Input
                    value={schema.copyright}
                    onChange={(e) => updateCopyright(e.target.value)}
                    placeholder="e.g., © 2024 Company Name. All rights reserved."
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={schema.description}
                    onChange={(e) => updateDescription(e.target.value)}
                    placeholder="Brief description of your company or website..."
                    className="text-sm"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Display Options Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
            <Card>
              <CardContent className="p-6 space-y-4">
                <ToggleField
                  id="show-currency-switcher"
                  label="Show Currency Switcher"
                  checked={schema.showCurrencySwitcher}
                  onChange={(checked) => updateDisplayOption('showCurrencySwitcher', checked)}
                  description="Display currency selection dropdown"
                />
                <ToggleField
                  id="show-language-switcher"
                  label="Show Language Switcher"
                  checked={schema.showLanguageSwitcher}
                  onChange={(checked) => updateDisplayOption('showLanguageSwitcher', checked)}
                  description="Display language selection dropdown"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* JSON Editor Dialog */}
      <Dialog open={showJSONEditor} onOpenChange={setShowJSONEditor}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Footer Schema JSON Editor</DialogTitle>
            <DialogDescription>
              Edit the complete footer schema structure. Be careful with this editor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4">
            <Textarea
              value={jsonString}
              onChange={handleJsonChange}
              className="w-full h-full font-mono text-sm resize-none"
              placeholder="Enter footer schema as JSON..."
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

export default FooterSchemaEditor;
