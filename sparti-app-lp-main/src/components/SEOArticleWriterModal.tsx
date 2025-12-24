import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PenTool, 
  BookOpen,
  Zap,
  Settings
} from 'lucide-react';
import { LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

interface SEOArticleWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrand?: Brand | null;
}

const SEOArticleWriterModal: React.FC<SEOArticleWriterModalProps> = ({
  isOpen,
  onClose,
  selectedBrand: propSelectedBrand
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(propSelectedBrand || null);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [formData, setFormData] = useState({
    blogTitle: '',
    articleLength: 'medium',
    articleType: 'blog',
    language: 'English'
  });

  // Fetch brands when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchBrands();
    }
  }, [isOpen, user]);

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user?.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setBrands(data || []);
      
      // If there's only one brand, auto-select it
      if (data && data.length === 1) {
        setSelectedBrand(data[0]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to load brands",
        variant: "destructive"
      });
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleLaunchSEOAgent = () => {
    if (!selectedBrand) {
      toast({
        title: "Brand Required",
        description: "Please select a brand before launching the SEO AI Writer.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.blogTitle.trim()) {
      toast({
        title: "Blog Title Required",
        description: "Please enter a blog title for your article.",
        variant: "destructive"
      });
      return;
    }

    // Store form data in sessionStorage to pass to AI Content Editor
    sessionStorage.setItem('seoFormData', JSON.stringify({
      ...formData,
      brandId: selectedBrand.id,
      brandName: selectedBrand.name
    }));
    
    // Navigate to AI Content Editor with agent parameter
    navigate(`/app/ai-editor?agent=seo&generate=true`);
    onClose();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Prepare brand options for SearchableSelect
  const brandOptions = brands.map(brand => ({
    value: brand.id,
    label: brand.name
  }));

  // Prepare language options for SearchableSelect
  const languageOptions = LANGUAGES_WITH_POPULAR_FIRST.map(lang => ({
    value: lang.value,
    label: lang.label
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 text-white">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">SEO AI Writer Configuration</DialogTitle>
              <DialogDescription className="mt-1">
                Configure your AI-powered content creation settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Brand Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Brand Selection
              </CardTitle>
              <CardDescription>
                Choose the brand context for your content creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingBrands ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="brand-select">Select Brand</Label>
                  <SearchableSelect
                    options={brandOptions}
                    value={selectedBrand?.id || ''}
                    onValueChange={(value) => {
                      const brand = brands.find(b => b.id === value);
                      setSelectedBrand(brand || null);
                    }}
                    placeholder="Search and select a brand..."
                  />
                  {selectedBrand && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {selectedBrand.logo_url ? (
                          <img 
                            src={selectedBrand.logo_url} 
                            alt={selectedBrand.name} 
                            className="w-10 h-10 rounded-lg object-cover" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {selectedBrand.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{selectedBrand.name}</h4>
                          {selectedBrand.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {selectedBrand.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Article Configuration
              </CardTitle>
              <CardDescription>
                Set your content creation preferences and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blog-title">Blog Title *</Label>
                <Input
                  id="blog-title"
                  placeholder="Enter the blog title or topic..."
                  value={formData.blogTitle}
                  onChange={(e) => updateFormData('blogTitle', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="article-length">Article Length</Label>
                  <Select 
                    value={formData.articleLength} 
                    onValueChange={(value) => updateFormData('articleLength', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (300-500 words)</SelectItem>
                      <SelectItem value="medium">Medium (700-1000 words)</SelectItem>
                      <SelectItem value="long">Long (1500-2000 words)</SelectItem>
                      <SelectItem value="extended">Extended (2500+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="article-type">Article Type</Label>
                  <Select 
                    value={formData.articleType} 
                    onValueChange={(value) => updateFormData('articleType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="howto">How-to Guide</SelectItem>
                      <SelectItem value="listicle">Listicle</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="news">News Article</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <SearchableSelect
                    options={languageOptions}
                    value={formData.language}
                    onValueChange={(value) => updateFormData('language', value)}
                    placeholder="Select language..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleLaunchSEOAgent}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            disabled={!selectedBrand || !formData.blogTitle.trim()}
          >
            <Zap className="mr-2 h-4 w-4" />
            Launch SEO AI Writer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SEOArticleWriterModal;