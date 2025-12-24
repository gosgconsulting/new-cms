import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Card } from '@/components/ui/card';

export const Step3ContentConfiguration = () => {
  const { sessionData } = useQuickSetup();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Configuration Complete</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Your content strategy has been configured. Click Next to continue with keyword selection.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Article Count</p>
            <p className="text-lg font-semibold">{sessionData.topic_count || 12} articles</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Workflow Mode</p>
            <p className="text-lg font-semibold capitalize">{sessionData.content_mode || 'Manual'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Language</p>
            <p className="text-lg font-semibold">{sessionData.language || 'English'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Country</p>
            <p className="text-lg font-semibold">{sessionData.country || 'United States'}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm font-semibold mb-2">Advanced Settings</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={sessionData.brand_mentions ? 'text-green-600' : 'text-muted-foreground'}>
                {sessionData.brand_mentions ? '✓' : '✗'}
              </span>
              <span>Brand Mentions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={sessionData.competitor_mentions ? 'text-green-600' : 'text-muted-foreground'}>
                {sessionData.competitor_mentions ? '✓' : '✗'}
              </span>
              <span>Competitor Mentions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={sessionData.internal_links ? 'text-green-600' : 'text-muted-foreground'}>
                {sessionData.internal_links ? '✓' : '✗'}
              </span>
              <span>Internal Links</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={sessionData.external_links ? 'text-green-600' : 'text-muted-foreground'}>
                {sessionData.external_links ? '✓' : '✗'}
              </span>
              <span>External Links</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={sessionData.ai_featured_image ? 'text-green-600' : 'text-muted-foreground'}>
                {sessionData.ai_featured_image ? '✓' : '✗'}
              </span>
              <span>AI Featured Image</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
