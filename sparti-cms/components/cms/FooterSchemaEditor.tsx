import React, { useState, useEffect } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../src/components/ui/accordion';
import { ArrowLeft, Save, Loader2, Plus, X, GripVertical, Code, Copy, Check } from 'lucide-react';
import { FooterSchema } from '../../types/schema';
import { ImageEditor } from '../content-editors';
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

interface FooterSchemaEditorProps {
  onBack: () => void;
}

// Define interfaces for different section types
interface StandardFooterSection {
  title: string;
  links: Array<{ id: string; label: string; link: string }>;
}

interface CustomFooterSection {
  id: string;
  title: string;
  subtitle?: string;
  button?: {
    label: string;
    link: string;
  };
  links?: Array<{ id?: string; label: string; link: string }>;
}

// Union type to handle both section formats
type FooterSection = StandardFooterSection | CustomFooterSection;

// Interface for blog link
interface BlogLink {
  id: string;
  label: string;
  link: string;
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
  const [copied, setCopied] = useState(false);

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

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[testing] Failed to copy JSON:', error);
    }
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
  
  // Helper function to check if a property exists in the schema
  const hasProperty = (prop: string): boolean => {
    return schema.hasOwnProperty(prop);
  };
  
  // Helper function to detect if a section is a custom section with section_x format
  const isCustomSectionFormat = (): boolean => {
    if (!schema.sections || !Array.isArray(schema.sections)) return false;
    
    // Check if any section has a section_1, section_2, etc. key
    return schema.sections.some(section => {
      return Object.keys(section).some(key => key.startsWith('section_'));
    });
  };
  
  // Helper function to get the appropriate section data based on format
  const getSectionData = (section: any, index: number): FooterSection => {
    if (isCustomSectionFormat()) {
      // For custom format, extract the section_x object
      const sectionKey = Object.keys(section)[0]; // e.g., "section_1"
      return section[sectionKey] as CustomFooterSection;
    } else {
      // For standard format, return as is
      return section as StandardFooterSection;
    }
  };
  
  // Helper function to update a blog link
  const updateBlog = (blog: BlogLink) => {
    updateSchema({ blog });
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

  const addSection = () => {
    let newSection;
    
    if (isCustomSectionFormat()) {
      // For custom format, create a new section with section_x key
      const nextSectionNum = (schema.sections?.length || 0) + 1;
      const sectionKey = `section_${nextSectionNum}`;
      newSection = {
        [sectionKey]: {
          id: sectionKey,
          title: 'New Section',
          links: []
        }
      };
    } else {
      // For standard format
      newSection = {
        title: 'New Section',
        links: []
      };
    }
    
    updateSections([...(schema.sections || []), newSection]);
  };

  const updateSection = (index: number, updatedSection: any) => {
    const newSections = [...(schema.sections || [])];
    newSections[index] = updatedSection;
    updateSections(newSections);
  };

  const removeSection = (index: number) => {
    const newSections = (schema.sections || []).filter((_, i) => i !== index);
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
        <div className="p-6">
          <Accordion type="multiple" className="w-full space-y-2">
            {/* Logo Section */}
            {schema.logo !== undefined && (
              <AccordionItem value="logo" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="text-lg font-semibold text-gray-900">Footer Logo</h3>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-4">
                    <ImageEditor
                      imageUrl={schema.logo?.src || ''}
                      imageAlt={schema.logo?.alt || ''}
                      onImageChange={(imageUrl) => updateLogo({ ...schema.logo, src: imageUrl })}
                      onAltChange={(alt) => updateLogo({ ...schema.logo, alt })}
                      simpleMode={true}
                    />
                    <div>
                      <Label className="text-xs">Alt Text</Label>
                      <Input
                        value={schema.logo?.alt || ''}
                        onChange={(e) => updateLogo({ ...schema.logo, alt: e.target.value })}
                        placeholder="Descriptive text for accessibility"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Navigation Sections */}
            {schema.sections !== undefined && (
              <AccordionItem value="sections" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <h3 className="text-lg font-semibold text-gray-900">Navigation Sections</h3>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addSection();
                      }} 
                      size="sm" 
                      variant="outline"
                      className="ml-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
              
              <div className="space-y-4">
                {(schema.sections || []).map((sectionObj, sectionIndex) => {
                  const section = getSectionData(sectionObj, sectionIndex);
                  const isCustomFormat = isCustomSectionFormat();
                  const sectionKey = isCustomFormat ? Object.keys(sectionObj)[0] : null;
                  
                  return (
                    <Card key={sectionIndex} className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            Section #{sectionIndex + 1} {sectionKey && `(${sectionKey})`}
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
                            value={section.title || ''}
                            onChange={(e) => {
                              const updatedSection = isCustomFormat 
                                ? { ...sectionObj, [sectionKey!]: { ...section, title: e.target.value } }
                                : { ...section, title: e.target.value };
                              updateSection(sectionIndex, updatedSection);
                            }}
                            placeholder="e.g., Navigation, Support, Company"
                            className="text-sm"
                          />
                        </div>
                        
                        {/* Subtitle field for custom format */}
                        {isCustomFormat && 'subtitle' in section && (
                          <div>
                            <Label className="text-xs">Section Subtitle</Label>
                            <Textarea
                              value={section.subtitle || ''}
                              onChange={(e) => {
                                const updatedSection = { 
                                  ...sectionObj, 
                                  [sectionKey!]: { ...section, subtitle: e.target.value } 
                                };
                                updateSection(sectionIndex, updatedSection);
                              }}
                              placeholder="Enter subtitle text..."
                              className="text-sm"
                              rows={2}
                            />
                          </div>
                        )}
                        
                        {/* Button field for custom format */}
                        {isCustomFormat && 'button' in section && section.button && (
                          <div className="space-y-3 border border-gray-200 rounded-md p-3">
                            <h4 className="text-sm font-medium">Button</h4>
                            <div>
                              <Label className="text-xs">Label</Label>
                              <Input
                                value={section.button.label || ''}
                                onChange={(e) => {
                                  const updatedSection = { 
                                    ...sectionObj, 
                                    [sectionKey!]: { 
                                      ...section, 
                                      button: { ...section.button, label: e.target.value } 
                                    } 
                                  };
                                  updateSection(sectionIndex, updatedSection);
                                }}
                                placeholder="e.g., Learn More, Contact Us"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Link</Label>
                              <Input
                                value={section.button.link || ''}
                                onChange={(e) => {
                                  const updatedSection = { 
                                    ...sectionObj, 
                                    [sectionKey!]: { 
                                      ...section, 
                                      button: { ...section.button, link: e.target.value } 
                                    } 
                                  };
                                  updateSection(sectionIndex, updatedSection);
                                }}
                                placeholder="e.g., /contact, https://example.com"
                                className="text-sm"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Links section - only show if links exist or it's a standard format */}
                        {(section.links || !isCustomFormat) && (
                          <MenuItemsList
                            items={(section.links || []).map(link => ({
                              id: link.id || `link_${Date.now()}_${Math.random()}`,
                              label: link.label,
                              link: link.link
                            }))}
                            onChange={(links) => {
                              const updatedSection = isCustomFormat 
                                ? { ...sectionObj, [sectionKey!]: { ...section, links } }
                                : { ...section, links };
                              updateSection(sectionIndex, updatedSection);
                            }}
                            title="Section Links"
                            addButtonText="Add Link"
                          />
                        )}
                        
                        {/* Social Media section */}
                        {'socialMedia' in section && section.socialMedia && (
                          <div className="space-y-3 border border-gray-200 rounded-md p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium">Social Media</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentSocialMedia = Array.isArray((section as any).socialMedia) ? ((section as any).socialMedia as any[]) : [];
                                  const newSocialMediaGroup = {
                                    links: []
                                  };
                                  const updatedSection = isCustomFormat 
                                    ? { ...sectionObj, [sectionKey!]: { ...section, socialMedia: [...currentSocialMedia, newSocialMediaGroup] } }
                                    : { ...section, socialMedia: [...currentSocialMedia, newSocialMediaGroup] };
                                  updateSection(sectionIndex, updatedSection);
                                }}
                                className="h-7 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Social Media Group
                              </Button>
                            </div>
                            
                            { (Array.isArray((section as any).socialMedia) ? ((section as any).socialMedia as any[]) : []).map((socialGroup: any, groupIndex: number) => (
                              <Card key={groupIndex} className="bg-gray-50">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs">Social Media Group #{groupIndex + 1}</CardTitle>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const updatedSocialMedia = (Array.isArray((section as any).socialMedia) ? ((section as any).socialMedia as any[]) : []).filter((_: any, i: number) => i !== groupIndex);
                                        const updatedSection = isCustomFormat 
                                          ? { ...sectionObj, [sectionKey!]: { ...section, socialMedia: updatedSocialMedia } }
                                          : { ...section, socialMedia: updatedSocialMedia };
                                        updateSection(sectionIndex, updatedSection);
                                      }}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <MenuItemsList
                                    items={(socialGroup.links || []).map((link: any) => ({
                                      id: link.id || `social_${Date.now()}_${Math.random()}`,
                                      label: link.label,
                                      link: link.link,
                                      icon: link.icon
                                    }))}
                                    onChange={(links) => {
                                      const updatedSocialMedia = [...(Array.isArray((section as any).socialMedia) ? ((section as any).socialMedia as any[]) : [])];
                                      updatedSocialMedia[groupIndex] = { links };
                                      const updatedSection = isCustomFormat 
                                        ? { ...sectionObj, [sectionKey!]: { ...section, socialMedia: updatedSocialMedia } }
                                        : { ...section, socialMedia: updatedSocialMedia };
                                      updateSection(sectionIndex, updatedSection);
                                    }}
                                    title="Social Media Links"
                                    addButtonText="Add Social Link"
                                    showDropdown={false}
                                  />
                                </CardContent>
                              </Card>
                            ))}
                            
                            {(!(Array.isArray((section as any).socialMedia)) || ((section as any).socialMedia as any[]).length === 0) && (
                              <div className="text-center py-4 text-gray-400 text-xs border-2 border-dashed border-gray-300 rounded bg-white">
                                No social media groups added yet
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
                  {(schema.sections?.length === 0 || !schema.sections) && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-sm">No sections added yet</p>
                      <Button onClick={addSection} size="sm" variant="outline" className="mt-2">
                        Add Section
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Blog Link Section */}
            {schema.blog !== undefined && (
              <AccordionItem value="blog" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="text-lg font-semibold text-gray-900">Blog Link</h3>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={schema.blog.label || ''}
                        onChange={(e) => updateBlog({...schema.blog, label: e.target.value})}
                        placeholder="e.g., Blog, News, Articles"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Link</Label>
                      <Input
                        value={schema.blog.link || ''}
                        onChange={(e) => updateBlog({...schema.blog, link: e.target.value})}
                        placeholder="e.g., /blog, /news"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Legal Links Section */}
            {schema.legalLinks !== undefined && (
              <AccordionItem value="legal-links" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="text-lg font-semibold text-gray-900">Legal Links</h3>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <MenuItemsList
                    items={schema.legalLinks}
                    onChange={updateLegalLinks}
                    title="Legal Links"
                    addButtonText="Add Legal Link"
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Content Section */}
            {(schema.copyright !== undefined || schema.description !== undefined) && (
              <AccordionItem value="content" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="text-lg font-semibold text-gray-900">Footer Content</h3>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-4">
                    {schema.copyright !== undefined && (
                      <div>
                        <Label className="text-xs">Copyright Text</Label>
                        <Input
                          value={schema.copyright}
                          onChange={(e) => updateCopyright(e.target.value)}
                          placeholder="e.g., © 2024 Company Name. All rights reserved."
                          className="text-sm"
                        />
                      </div>
                    )}
                    {schema.description !== undefined && (
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
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Display Options Section */}
            {(schema.showCurrencySwitcher !== undefined || schema.showLanguageSwitcher !== undefined) && (
              <AccordionItem value="display-options" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <h3 className="text-lg font-semibold text-gray-900">Display Options</h3>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-4">
                    {schema.showCurrencySwitcher !== undefined && (
                      <ToggleField
                        id="show-currency-switcher"
                        label="Show Currency Switcher"
                        checked={schema.showCurrencySwitcher}
                        onChange={(checked) => updateDisplayOption('showCurrencySwitcher', checked)}
                        description="Display currency selection dropdown"
                      />
                    )}
                    {schema.showLanguageSwitcher !== undefined && (
                      <ToggleField
                        id="show-language-switcher"
                        label="Show Language Switcher"
                        checked={schema.showLanguageSwitcher}
                        onChange={(checked) => updateDisplayOption('showLanguageSwitcher', checked)}
                        description="Display language selection dropdown"
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Custom Fields Section */}
            <AccordionItem value="custom-fields" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <DynamicFieldsSection
                  schema={schema}
                  knownFields={getKnownFields('footer')}
                  onUpdateSchema={handleDynamicFieldsUpdate}
                  title="Custom Fields"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      
      {/* JSON Editor Dialog */}
      <Dialog open={showJSONEditor} onOpenChange={setShowJSONEditor}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Footer Schema JSON Editor</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyJSON}
                disabled={!jsonString}
                className="ml-4"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                  </>
                )}
              </Button>
            </DialogTitle>
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