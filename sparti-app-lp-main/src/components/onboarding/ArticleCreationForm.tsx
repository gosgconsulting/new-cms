import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useArticleGeneration } from '@/contexts/ArticleGenerationContext';
import { SelectedTopic } from '@/contexts/ArticleGenerationContext';
import { ArticleConfigurationForm } from './ArticleConfigurationForm';
import { ArticleSettingsManager, ArticleSettings } from '@/components/settings/ArticleSettingsManager';

interface ArticleCreationFormProps {
  brandId: string;
  brandName: string;
  userId: string;
  selectedTopics: SelectedTopic[];
  preselectedTopicId?: string;
  preselectedTopicTitle?: string;
  onComplete?: () => void;
}

export const ArticleCreationForm = ({ 
  brandId, 
  brandName, 
  userId, 
  selectedTopics,
  preselectedTopicId,
  preselectedTopicTitle,
  onComplete
}: ArticleCreationFormProps) => {
  const { toast } = useToast();
  const { currentSession, isGenerating, startGeneration } = useArticleGeneration();
  
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState('English');
  const [wordCount, setWordCount] = useState(800);
  const [tone, setTone] = useState('Professional');
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [includeFAQ, setIncludeFAQ] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<'none' | 'ai_generation' | 'gallery_selection'>('ai_generation');
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>('none');
  const [articleSettings, setArticleSettings] = useState<ArticleSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (preselectedTopicId) {
      setSelectedTopicIds(new Set([preselectedTopicId]));
    }
  }, [preselectedTopicId]);

  const handleTopicToggle = (topicId: string, checked: boolean) => {
    const newSelected = new Set(selectedTopicIds);
    if (checked) {
      newSelected.add(topicId);
    } else {
      newSelected.delete(topicId);
    }
    setSelectedTopicIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTopicIds.size === selectedTopics.length) {
      setSelectedTopicIds(new Set());
    } else {
      setSelectedTopicIds(new Set(selectedTopics.map(t => t.id)));
    }
  };

  const handleGenerate = () => {
    const topicsToGenerate = selectedTopics.filter(t => selectedTopicIds.has(t.id));
    
    if (topicsToGenerate.length === 0) {
      toast({
        title: "No Topics Selected",
        description: "Please select at least one topic to generate articles.",
        variant: "destructive",
      });
      return;
    }

    startGeneration({
      topics: topicsToGenerate,
      language,
      wordCount,
      tone,
      includeIntro,
      includeConclusion,
      includeFAQ,
      customPrompt: articleSettings?.custom_instructions || '',
      brandId,
      brandName,
      userId
    }, true); // Skip completion modal in onboarding flow

    // Trigger onComplete immediately when generation starts (for onboarding flow)
    if (onComplete) {
      onComplete();
    }
  };

  const getIntentColor = (intent?: string) => {
    switch (intent?.toLowerCase()) {
      case 'informational':
        return 'bg-primary/10 text-primary';
      case 'navigational':
        return 'bg-green-100 text-green-800';
      case 'commercial':
        return 'bg-yellow-100 text-yellow-800';
      case 'transactional':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Show topic selection only if no preselected topic */}
      {!preselectedTopicId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Select Topics ({selectedTopicIds.size} selected)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedTopicIds.size === selectedTopics.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {selectedTopics.map((topic) => (
              <div key={topic.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  checked={selectedTopicIds.has(topic.id)}
                  onCheckedChange={(checked) => handleTopicToggle(topic.id, !!checked)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="font-medium">{topic.title}</div>
                  <div className="flex flex-wrap gap-1">
                    {(topic.keywords || []).slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {(topic.keywords || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(topic.keywords || []).length - 3} more
                      </Badge>
                    )}
                  </div>
                  {topic.intent && (
                    <Badge variant="secondary" className={getIntentColor(topic.intent)}>
                      {topic.intent}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Article Configuration */}
      <ArticleConfigurationForm
        selectedTopics={selectedTopics.filter(t => selectedTopicIds.has(t.id))}
        language={language}
        wordCount={wordCount}
        tone={tone}
        includeIntro={includeIntro}
        includeConclusion={includeConclusion}
        includeFAQ={includeFAQ}
        featuredImage={featuredImage}
        selectedInstructionId={selectedInstructionId}
        brandId={brandId}
        onLanguageChange={setLanguage}
        onWordCountChange={setWordCount}
        onToneChange={setTone}
        onIncludeIntroChange={setIncludeIntro}
        onIncludeConclusionChange={setIncludeConclusion}
        onIncludeFAQChange={setIncludeFAQ}
        onFeaturedImageChange={setFeaturedImage}
        onInstructionChange={setSelectedInstructionId}
        preselectedTopicTitle={preselectedTopicTitle}
        showTopicSelection={false}
        settingsButton={
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Article Settings</DialogTitle>
                <DialogDescription>
                  Configure all article generation settings including custom instructions.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <ArticleSettingsManager 
                  brandId={brandId}
                  userId={userId}
                  viewMode="modal"
                  onSettingsChange={setArticleSettings}
                />
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={selectedTopicIds.size === 0 || isGenerating}
          size="lg"
          className="min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate {selectedTopicIds.size} Article{selectedTopicIds.size > 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
