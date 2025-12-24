import { useState, useEffect } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileText, Link, Image } from 'lucide-react';

export const Step3ContentStrategy = () => {
  const { sessionData, updateSessionData } = useQuickSetup();
  const [articleCount, setArticleCount] = useState(sessionData.topic_count || 12);

  // Set manual mode on mount
  useEffect(() => {
    updateSessionData({ content_mode: 'manual' });
  }, []);

  const handleArticleCountChange = (value: string) => {
    const count = parseInt(value) || 12;
    setArticleCount(count);
    updateSessionData({ topic_count: count });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Content Strategy</h2>
        <p className="text-muted-foreground">
          Configure your content generation settings
        </p>
      </div>

      {/* Article Count */}
      <Card className="p-6">
        <Label htmlFor="article-count" className="text-base font-semibold mb-2 block">
          Number of Articles
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          How many articles would you like to generate for this campaign?
        </p>
        <Input
          id="article-count"
          type="number"
          min="1"
          max="100"
          value={articleCount}
          onChange={(e) => handleArticleCountChange(e.target.value)}
          className="max-w-xs"
        />
      </Card>

      {/* Advanced Settings */}
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Advanced Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="brand-mentions" className="font-medium">
                  Brand Mentions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Include your brand naturally in content
                </p>
              </div>
            </div>
            <Switch
              id="brand-mentions"
              checked={sessionData.brand_mentions ?? true}
              onCheckedChange={(checked) => updateSessionData({ brand_mentions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="competitor-mentions" className="font-medium">
                  Competitor Mentions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reference competitors when relevant
                </p>
              </div>
            </div>
            <Switch
              id="competitor-mentions"
              checked={sessionData.competitor_mentions ?? true}
              onCheckedChange={(checked) => updateSessionData({ competitor_mentions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="internal-links" className="font-medium">
                  Internal Links
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add links to other pages on your site
                </p>
              </div>
            </div>
            <Switch
              id="internal-links"
              checked={sessionData.internal_links ?? true}
              onCheckedChange={(checked) => updateSessionData({ internal_links: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="ai-featured-image" className="font-medium">
                  AI Featured Image
                </Label>
                <p className="text-sm text-muted-foreground">
                  Generate featured images with AI
                </p>
              </div>
            </div>
            <Switch
              id="ai-featured-image"
              checked={sessionData.ai_featured_image ?? true}
              onCheckedChange={(checked) => updateSessionData({ ai_featured_image: checked })}
            />
          </div>
        </div>
      </Card>

    </div>
  );
};
