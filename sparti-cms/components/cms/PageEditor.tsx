import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';
import HomepageSectionEditor from './HomepageSectionEditor';

interface PageEditorProps {
  pageId: string;
  onBack: () => void;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  type: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId, onBack }) => {
  // Mock data - in real implementation, fetch from database
  const [pageData, setPageData] = useState<PageData>(() => {
    const pages: Record<string, PageData> = {
      '1': {
        id: '1',
        title: 'Homepage',
        slug: '/',
        type: 'core',
        metaTitle: 'GO SG Consulting - SEO Services Singapore',
        metaDescription: 'Professional SEO services in Singapore. Increase your organic traffic and rankings with our expert SEO strategies.',
        content: '',
      },
      '2': {
        id: '2',
        title: 'Blog',
        slug: '/blog',
        type: 'core',
        metaTitle: 'Blog - GO SG Consulting',
        metaDescription: 'Latest insights and updates on SEO, digital marketing, and web development.',
        content: '',
      },
      '3': {
        id: '3',
        title: 'Privacy Policy',
        slug: '/privacy-policy',
        type: 'legal',
        metaTitle: 'Privacy Policy - GO SG Consulting',
        metaDescription: 'Read our privacy policy to understand how we collect, use, and protect your data.',
        content: '<h2>Privacy Policy</h2><p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.</p><h3>Information We Collect</h3><p>We collect information that you provide directly to us...</p>',
      },
      '4': {
        id: '4',
        title: 'Terms of Service',
        slug: '/terms-of-service',
        type: 'legal',
        metaTitle: 'Terms of Service - GO SG Consulting',
        metaDescription: 'Read our terms of service to understand the rules and regulations for using our services.',
        content: '<h2>Terms of Service</h2><p>By accessing and using our services, you agree to be bound by these terms...</p><h3>Use of Services</h3><p>You may use our services only as permitted by law...</p>',
      },
    };
    return pages[pageId] || pages['1'];
  });

  const updateField = (field: keyof PageData, value: string) => {
    setPageData({ ...pageData, [field]: value });
  };

  const handleSave = () => {
    // In real implementation, save to database
    toast.success('Page saved successfully');
    console.log('Saving page:', pageData);
  };

  const renderContentEditor = () => {
    if (pageData.type === 'legal') {
      // Rich text editor for legal pages
      return (
        <Card>
          <CardHeader>
            <CardTitle>Page Content</CardTitle>
            <CardDescription>Edit the content of this legal page using the rich text editor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={pageData.content}
                onChange={(content) => updateField('content', content)}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (pageData.title === 'Homepage') {
      // Homepage sections editor
      return (
        <Card>
          <CardHeader>
            <CardTitle>Homepage Sections</CardTitle>
            <CardDescription>Customize homepage sections</CardDescription>
          </CardHeader>
          <CardContent>
            <HomepageSectionEditor onSave={handleSave} />
          </CardContent>
        </Card>
      );
    }

    if (pageData.title === 'Blog') {
      // Blog page - no content editing
      return (
        <Card>
          <CardHeader>
            <CardTitle>Blog Page</CardTitle>
            <CardDescription>Blog posts are managed separately</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 border-2 border-dashed rounded-lg text-center">
              <p className="text-muted-foreground">
                The blog page displays your blog posts automatically. To manage blog posts, go to the Blog section.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Edit Page: {pageData.title}</h2>
            <p className="text-muted-foreground">{pageData.slug}</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* SEO Meta Information */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Meta Information</CardTitle>
          <CardDescription>Configure page title and meta description for search engines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-title">Page Title</Label>
            <Input
              id="page-title"
              value={pageData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Page Title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={pageData.metaTitle}
              onChange={(e) => updateField('metaTitle', e.target.value)}
              placeholder="Meta Title (60 characters max)"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {pageData.metaTitle.length}/60 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={pageData.metaDescription}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              placeholder="Meta Description (160 characters max)"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {pageData.metaDescription.length}/160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor - conditional based on page type */}
      {renderContentEditor()}
    </div>
  );
};

export default PageEditor;
