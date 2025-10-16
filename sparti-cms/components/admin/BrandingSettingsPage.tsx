import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Upload, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import gosgLogo from "@/assets/go-sg-logo-official.png";

const BrandingSettingsPage: React.FC = () => {
  const [brandingData, setBrandingData] = useState({
    site_name: 'GO SG',
    site_tagline: 'Digital Marketing Agency',
    site_logo: '',
    site_favicon: '',
    site_description: 'We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
      alert('Branding settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Branding Settings</h3>
        <p className="text-muted-foreground">
          Customize your site's branding elements including name, tagline, logo, and favicon
        </p>
      </div>

      {/* Site Information */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
          <Info className="h-5 w-5 text-brandPurple" />
          Site Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input 
                id="site_name"
                value={brandingData.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                placeholder="Your site name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_tagline">Tagline</Label>
              <Input 
                id="site_tagline"
                value={brandingData.site_tagline}
                onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                placeholder="Your site's tagline"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea 
                id="site_description"
                value={brandingData.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Brief description of your site"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Used for SEO and social sharing</p>
            </div>
          </div>
          
          {/* Logo & Favicon */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Logo</Label>
              <div className="bg-secondary/20 rounded-lg border border-dashed border-border p-8 text-center hover:bg-secondary/30 transition-colors cursor-pointer">
                {brandingData.site_logo ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={brandingData.site_logo || gosgLogo} 
                      alt="Site Logo" 
                      className="h-16 w-auto mb-4"
                    />
                    <Button variant="outline" size="sm">Replace Logo</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-secondary/40 rounded-lg flex items-center justify-center mb-4">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-medium text-foreground">Upload Logo</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG or SVG (max 2MB)</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Favicon</Label>
              <div className="bg-secondary/20 rounded-lg border border-dashed border-border p-6 text-center hover:bg-secondary/30 transition-colors cursor-pointer">
                {brandingData.site_favicon ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={brandingData.site_favicon} 
                      alt="Favicon" 
                      className="h-10 w-10 mb-4"
                    />
                    <Button variant="outline" size="sm">Replace Favicon</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-secondary/40 rounded-md flex items-center justify-center mb-4">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-medium text-foreground">Upload Favicon</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG or ICO (32x32px)</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Branding Preview</h4>
        
        <div className="bg-secondary/20 rounded-lg border border-border p-6">
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={brandingData.site_logo || gosgLogo} 
              alt="Site Logo" 
              className="h-16 w-auto"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{brandingData.site_name}</h2>
              <p className="text-muted-foreground">{brandingData.site_tagline}</p>
            </div>
            <div className="max-w-lg text-center mt-2">
              <p className="text-sm text-foreground">{brandingData.site_description}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-border">
        <Button 
          variant="default" 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-brandPurple hover:bg-brandPurple/90"
        >
          {isSaving ? 'Saving...' : 'Save Branding Settings'}
        </Button>
      </div>
    </div>
  );
};

export default BrandingSettingsPage;
