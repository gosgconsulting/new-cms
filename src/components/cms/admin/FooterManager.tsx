import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterLinkSection {
  id: string;
  title: string;
  links: FooterLink[];
}

interface FooterSettings {
  headline: string;
  description: string;
  linkSections: FooterLinkSection[];
  bottomLinks: FooterLink[];
  copyrightText: string;
}

const FooterManager: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings>({
    headline: 'Get Your SEO Strategy',
    description: "Ready to dominate search results? Let's discuss how we can help your business grow.",
    linkSections: [
      {
        id: '1',
        title: 'CONTACT',
        links: [
          { id: '1-1', label: 'WhatsApp', url: '/whatsapp' },
          { id: '1-2', label: 'Book a Meeting', url: '/book' },
        ],
      },
    ],
    bottomLinks: [
      { id: 'b1', label: 'Privacy Policy', url: '/privacy' },
      { id: 'b2', label: 'Terms of Service', url: '/terms' },
      { id: 'b3', label: 'Blog', url: '/blog' },
    ],
    copyrightText: '© 2025 GO SG CONSULTING. All rights reserved.',
  });

  const updateHeadline = (headline: string) => {
    setSettings({ ...settings, headline });
  };

  const updateDescription = (description: string) => {
    setSettings({ ...settings, description });
  };

  const updateCopyright = (copyrightText: string) => {
    setSettings({ ...settings, copyrightText });
  };

  // Link Section Management
  const addLinkSection = () => {
    const newSection: FooterLinkSection = {
      id: Date.now().toString(),
      title: 'New Section',
      links: [],
    };
    setSettings({
      ...settings,
      linkSections: [...settings.linkSections, newSection],
    });
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSettings({
      ...settings,
      linkSections: settings.linkSections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      ),
    });
  };

  const deleteLinkSection = (sectionId: string) => {
    setSettings({
      ...settings,
      linkSections: settings.linkSections.filter((section) => section.id !== sectionId),
    });
  };

  // Links within Section Management
  const addLinkToSection = (sectionId: string) => {
    const newLink: FooterLink = {
      id: `${sectionId}-${Date.now()}`,
      label: 'New Link',
      url: '/',
    };
    setSettings({
      ...settings,
      linkSections: settings.linkSections.map((section) =>
        section.id === sectionId
          ? { ...section, links: [...section.links, newLink] }
          : section
      ),
    });
  };

  const updateSectionLink = (
    sectionId: string,
    linkId: string,
    field: 'label' | 'url',
    value: string
  ) => {
    setSettings({
      ...settings,
      linkSections: settings.linkSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              links: section.links.map((link) =>
                link.id === linkId ? { ...link, [field]: value } : link
              ),
            }
          : section
      ),
    });
  };

  const deleteSectionLink = (sectionId: string, linkId: string) => {
    setSettings({
      ...settings,
      linkSections: settings.linkSections.map((section) =>
        section.id === sectionId
          ? { ...section, links: section.links.filter((link) => link.id !== linkId) }
          : section
      ),
    });
  };

  // Bottom Links Management
  const addBottomLink = () => {
    const newLink: FooterLink = {
      id: `bottom-${Date.now()}`,
      label: 'New Link',
      url: '/',
    };
    setSettings({
      ...settings,
      bottomLinks: [...settings.bottomLinks, newLink],
    });
  };

  const updateBottomLink = (linkId: string, field: 'label' | 'url', value: string) => {
    setSettings({
      ...settings,
      bottomLinks: settings.bottomLinks.map((link) =>
        link.id === linkId ? { ...link, [field]: value } : link
      ),
    });
  };

  const deleteBottomLink = (linkId: string) => {
    setSettings({
      ...settings,
      bottomLinks: settings.bottomLinks.filter((link) => link.id !== linkId),
    });
  };

  const handleSave = () => {
    toast.success('Footer settings saved successfully');
    console.log('Saving footer settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Footer Manager</h2>
          <p className="text-muted-foreground">Customize your website footer</p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      {/* Headline & Description */}
      <Card>
        <CardHeader>
          <CardTitle>Headline & Description</CardTitle>
          <CardDescription>Main footer messaging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={settings.headline}
              onChange={(e) => updateHeadline(e.target.value)}
              placeholder="Get Your SEO Strategy"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => updateDescription(e.target.value)}
              placeholder="Ready to dominate search results?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Link Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Link Sections</CardTitle>
          <CardDescription>Organize footer links into sections (e.g., Contact, Services)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.linkSections.map((section) => (
            <div key={section.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                  <Input
                    id={`section-title-${section.id}`}
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    placeholder="CONTACT"
                    className="font-semibold"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLinkSection(section.id)}
                  className="text-destructive hover:text-destructive mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 pl-4 border-l-2">
                {section.links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={link.label}
                        onChange={(e) =>
                          updateSectionLink(section.id, link.id, 'label', e.target.value)
                        }
                        placeholder="Link label"
                        className="text-sm"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateSectionLink(section.id, link.id, 'url', e.target.value)
                        }
                        placeholder="/url"
                        className="text-sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSectionLink(section.id, link.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addLinkToSection(section.id)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Link to Section
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={addLinkSection} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Link Section
          </Button>
        </CardContent>
      </Card>

      {/* Bottom Links */}
      <Card>
        <CardHeader>
          <CardTitle>Bottom Footer Links</CardTitle>
          <CardDescription>Legal and utility links (Privacy Policy, Terms, etc.)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {settings.bottomLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`bottom-label-${link.id}`} className="text-xs">
                      Label
                    </Label>
                    <Input
                      id={`bottom-label-${link.id}`}
                      value={link.label}
                      onChange={(e) => updateBottomLink(link.id, 'label', e.target.value)}
                      placeholder="Privacy Policy"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`bottom-url-${link.id}`} className="text-xs">
                      URL
                    </Label>
                    <Input
                      id={`bottom-url-${link.id}`}
                      value={link.url}
                      onChange={(e) => updateBottomLink(link.id, 'url', e.target.value)}
                      placeholder="/privacy"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteBottomLink(link.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={addBottomLink} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Bottom Link
          </Button>
        </CardContent>
      </Card>

      {/* Copyright */}
      <Card>
        <CardHeader>
          <CardTitle>Copyright Text</CardTitle>
          <CardDescription>Footer copyright notice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="copyright">Copyright Text</Label>
            <Input
              id="copyright"
              value={settings.copyrightText}
              onChange={(e) => updateCopyright(e.target.value)}
              placeholder="© 2025 Company Name. All rights reserved."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterManager;
