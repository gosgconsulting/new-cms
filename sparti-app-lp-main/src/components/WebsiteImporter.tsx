import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WebsiteImporterProps {
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  businessDescription: string;
  setBusinessDescription: (description: string) => void;
  className?: string;
}

const WebsiteImporter: React.FC<WebsiteImporterProps> = ({
  websiteUrl,
  setWebsiteUrl,
  businessDescription,
  setBusinessDescription,
  className
}) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImportWebsite = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    // Add protocol if missing
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid website URL');
      return;
    }

    setIsImporting(true);
    try {
      // Use a CORS proxy service to fetch website content
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch website content');
      }

      const data = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      // Extract relevant content
      const title = doc.querySelector('title')?.textContent || '';
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map(h => h.textContent).filter(Boolean);
      const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => p.textContent).filter(Boolean).slice(0, 5);

      // Create a summary
      const extractedContent = [
        title && `Title: ${title}`,
        metaDescription && `Description: ${metaDescription}`,
        headings.length > 0 && `Headings: ${headings.slice(0, 3).join(', ')}`,
        paragraphs.length > 0 && `Content: ${paragraphs.slice(0, 2).join(' ')}`
      ].filter(Boolean).join('\n\n');

      if (extractedContent) {
        // Append to existing description or replace if empty
        const newDescription = businessDescription.trim() 
          ? `${businessDescription}\n\nWebsite Summary:\n${extractedContent}`
          : `Website Summary:\n${extractedContent}`;
        
        setBusinessDescription(newDescription);
        toast.success('Website content imported successfully!');
      } else {
        toast.warning('Could not extract meaningful content from the website');
      }
    } catch (error) {
      console.error('Error importing website:', error);
      toast.error('Failed to import website content. Please try entering the details manually.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Website URL Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Website URL (Optional)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="pl-10 h-11 glass border border-input bg-background/50 backdrop-blur-sm hover:neon-glow transition-all duration-300"
              disabled={isImporting}
            />
          </div>
          <Button
            onClick={handleImportWebsite}
            disabled={!websiteUrl.trim() || isImporting}
            className="h-11 px-4 glass border border-primary/20 bg-primary/10 hover:bg-primary/20 transition-all duration-300"
            variant="outline"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import & Summarize
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Import your website content to help AI suggest better lead targets
        </p>
      </div>

      {/* Business Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Business Description
        </label>
        <Textarea
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          placeholder="Describe your product, service, target market, pricing, and goals..."
          className="min-h-[120px] resize-none glass border border-input bg-background/50 backdrop-blur-sm hover:neon-glow transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Provide details about your business to get personalized lead suggestions
        </p>
      </div>
    </div>
  );
};

export default WebsiteImporter;