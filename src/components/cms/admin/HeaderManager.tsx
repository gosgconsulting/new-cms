import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface NavLink {
  id: string;
  label: string;
  url: string;
}

interface HeaderSettings {
  logoUrl: string;
  navLinksEnabled: boolean;
  navLinks: NavLink[];
  ctaButton: {
    enabled: boolean;
    text: string;
    url: string;
  };
}

const HeaderManager: React.FC = () => {
  const [settings, setSettings] = useState<HeaderSettings>({
    logoUrl: '/assets/go-sg-logo.png',
    navLinksEnabled: true,
    navLinks: [
      { id: '1', label: 'Home', url: '/' },
      { id: '2', label: 'Services', url: '/services' },
      { id: '3', label: 'About', url: '/about' },
      { id: '4', label: 'Contact', url: '/contact' },
    ],
    ctaButton: {
      enabled: true,
      text: 'Get Started',
      url: '/contact',
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, upload to storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setSettings({ ...settings, logoUrl: url });
  };

  const addNavLink = () => {
    const newLink: NavLink = {
      id: Date.now().toString(),
      label: 'New Link',
      url: '/',
    };
    setSettings({
      ...settings,
      navLinks: [...settings.navLinks, newLink],
    });
  };

  const updateNavLink = (id: string, field: 'label' | 'url', value: string) => {
    setSettings({
      ...settings,
      navLinks: settings.navLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    });
  };

  const deleteNavLink = (id: string) => {
    setSettings({
      ...settings,
      navLinks: settings.navLinks.filter((link) => link.id !== id),
    });
  };

  const toggleNavLinks = (enabled: boolean) => {
    setSettings({
      ...settings,
      navLinksEnabled: enabled,
    });
  };

  const toggleCTA = (enabled: boolean) => {
    setSettings({
      ...settings,
      ctaButton: { ...settings.ctaButton, enabled },
    });
  };

  const updateCTA = (field: 'text' | 'url', value: string) => {
    setSettings({
      ...settings,
      ctaButton: { ...settings.ctaButton, [field]: value },
    });
  };

  const handleSave = () => {
    // In a real implementation, save to database
    toast.success('Header settings saved successfully');
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Header Manager</h2>
          <p className="text-muted-foreground">Customize your website header</p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Upload or link to your logo image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {settings.logoUrl && (
              <div className="w-32 h-16 border rounded-md flex items-center justify-center bg-muted">
                <img
                  src={settings.logoUrl}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <div className="flex gap-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-url">Or Enter Logo URL</Label>
            <Input
              id="logo-url"
              type="url"
              placeholder="https://example.com/logo.png"
              value={settings.logoUrl}
              onChange={(e) => handleLogoUrlChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Links</CardTitle>
          <CardDescription>Manage your header navigation menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between pb-4">
            <div className="space-y-0.5">
              <Label htmlFor="nav-enabled">Enable Navigation Links</Label>
              <p className="text-sm text-muted-foreground">
                Show navigation links in the header
              </p>
            </div>
            <Switch
              id="nav-enabled"
              checked={settings.navLinksEnabled}
              onCheckedChange={toggleNavLinks}
            />
          </div>

          {settings.navLinksEnabled && (
            <>
              <div className="space-y-3 pt-4 border-t">
            {settings.navLinks.map((link, index) => (
              <div
                key={link.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`link-label-${link.id}`} className="text-xs">
                      Label
                    </Label>
                    <Input
                      id={`link-label-${link.id}`}
                      value={link.label}
                      onChange={(e) => updateNavLink(link.id, 'label', e.target.value)}
                      placeholder="Link label"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`link-url-${link.id}`} className="text-xs">
                      URL
                    </Label>
                    <Input
                      id={`link-url-${link.id}`}
                      value={link.url}
                      onChange={(e) => updateNavLink(link.id, 'url', e.target.value)}
                      placeholder="/page"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNavLink(link.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
              </div>
              <Button onClick={addNavLink} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Navigation Link
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* CTA Button Section */}
      <Card>
        <CardHeader>
          <CardTitle>Call-to-Action Button</CardTitle>
          <CardDescription>Configure your header CTA button</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cta-enabled">Enable CTA Button</Label>
              <p className="text-sm text-muted-foreground">
                Show a call-to-action button in the header
              </p>
            </div>
            <Switch
              id="cta-enabled"
              checked={settings.ctaButton.enabled}
              onCheckedChange={toggleCTA}
            />
          </div>

          {settings.ctaButton.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="cta-text">Button Text</Label>
                <Input
                  id="cta-text"
                  value={settings.ctaButton.text}
                  onChange={(e) => updateCTA('text', e.target.value)}
                  placeholder="Get Started"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta-url">Button URL</Label>
                <Input
                  id="cta-url"
                  value={settings.ctaButton.url}
                  onChange={(e) => updateCTA('url', e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderManager;
