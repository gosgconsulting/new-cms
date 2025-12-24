import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PenTool, Loader2, Settings, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useArticleGeneration } from '@/contexts/ArticleGenerationContext';
import ArticleGenerationProgress from '@/components/ArticleGenerationProgress';
import { supabase } from '@/integrations/supabase/client';
import { BulkArticleConfiguration } from './BulkArticleConfiguration';
import { ArticleSettingsManager, ArticleSettings } from '@/components/settings/ArticleSettingsManager';
import { SelectedTopic, ArticleGenerationParams } from '@/contexts/ArticleGenerationContext';
import ArticleBriefModal from './ArticleBriefModal';
import { useQueryClient } from '@tanstack/react-query';
interface BulkArticleWriterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
  userId: string;
  selectedTopics: SelectedTopic[];
  hideTopicSelection?: boolean;
  onGenerationComplete?: () => void;
}

const BulkArticleWriterModal = ({ 
  open, 
  onOpenChange, 
  brandId, 
  brandName, 
  userId, 
  selectedTopics,
  hideTopicSelection = false,
  onGenerationComplete
}: BulkArticleWriterModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentSession, isGenerating, startGeneration, clearSession } = useArticleGeneration();
  
  // Selection state - initialize immediately if hideTopicSelection is true
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  
  // Sync selected topic IDs when props change (for hideTopicSelection mode)
  useEffect(() => {
    if (hideTopicSelection && selectedTopics.length > 0) {
      setSelectedTopicIds(new Set(selectedTopics.map(t => t.id)));
    }
  }, [hideTopicSelection, selectedTopics]);
  
  // Generation parameters
  const [language, setLanguage] = useState('English');
  const [wordCount, setWordCount] = useState(800);
  const [tone, setTone] = useState('Professional');
  const [featuredImage, setFeaturedImage] = useState<'none' | 'ai_generation' | 'gallery_selection'>('ai_generation');
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>('none');
  const [brandMentions, setBrandMentions] = useState<string>('regular');
  const [competitorMentions, setCompetitorMentions] = useState<string>('minimal');
  
  // Content settings (local overrides)
  const [articleSettings, setArticleSettings] = useState<ArticleSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Brief modal
  const [selectedTopicForBrief, setSelectedTopicForBrief] = useState<SelectedTopic | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);


  // Monitor generation completion for onboarding callback and reset selection
  useEffect(() => {
    if (currentSession?.status === 'completed' && !isGenerating) {
      // Refresh articles list
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['campaignTopics'] });
      
      // Reset selected topics after successful generation
      setSelectedTopicIds(new Set());
      
      if (onGenerationComplete) {
        onGenerationComplete();
      }
      
      // Show success toast
      toast({
        title: "Generation Complete!",
        description: `${currentSession.completedArticles} article${currentSession.completedArticles > 1 ? 's' : ''} generated successfully.`,
      });
    }
  }, [currentSession?.status, isGenerating, onGenerationComplete, queryClient, toast, currentSession?.completedArticles]);

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

  const handleGenerate = async (useUnified: boolean = false) => {
    const topicsToGenerate = selectedTopics.filter(t => selectedTopicIds.has(t.id));
    
    if (topicsToGenerate.length === 0) {
      toast({
        title: "No Topics Selected",
        description: "Please select at least one topic to generate articles.",
        variant: "destructive",
      });
      return;
    }

    // Close modal immediately first
    onOpenChange(false);

    // Get selected custom instruction if available (do this after closing modal)
    let selectedInstruction = undefined;
    if (selectedInstructionId !== 'none') {
      try {
        const { data, error } = await supabase
          .from('custom_instruction_prompts')
          .select('content')
          .eq('id', selectedInstructionId)
          .single();

        if (!error && data) {
          selectedInstruction = data;
        }
      } catch (error) {
        console.error('Error fetching custom instruction:', error);
      }
    }

    // Start the generation session using the context (which now uses execute-workflow)
    startGeneration({
      topics: topicsToGenerate,
      language,
      wordCount,
      tone,
      includeIntro: true, // Always include intro - following outline from topic brief
      includeConclusion: true, // Always include conclusion - following outline from topic brief
      includeFAQ: false, // FAQ not included by default
      featuredImage,
      model: useUnified ? 'openai/gpt-4o' : 'anthropic/claude-3.5-sonnet',
      customPrompt: selectedInstruction?.content || '',
      brandId,
      brandName,
      userId,
      workflowType: useUnified ? 'Content Writing Unified' : 'Content Writing',
      contentSettings: {
        ...articleSettings,
        brand_mentions: brandMentions,
        competitor_mentions: competitorMentions,
        use_brand_info: brandMentions !== 'none'
      }
    });

    // Redirect to schedule page immediately instead of showing full screen loader
    navigate(`/app/schedule?brand=${brandId}`);
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

  // Handle closing modal when generation is complete
  const handleClose = () => {
    if (currentSession?.status === 'completed' || currentSession?.status === 'error') {
      clearSession();
    }
    
    // Refresh topics list when closing to show updated available topics
    // (excluding ones currently being generated in background)
    queryClient.invalidateQueries({ queryKey: ['selectedTopics'] });
    queryClient.invalidateQueries({ queryKey: ['campaignTopics'] });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                Generating Articles
              </>
            ) : (
              <>
                <PenTool className="h-5 w-5 text-primary" />
                {selectedTopics.length === 1 ? selectedTopics[0].title : 'Bulk Article Generation'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isGenerating 
              ? 'Your articles are being generated. This may take a few minutes...'
              : selectedTopics.length === 1 
                ? 'Configure settings and generate your article' 
                : `Select topics and configure settings to generate ${selectedTopicIds.size > 0 ? selectedTopicIds.size : selectedTopics.length} articles`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Topic Selection */}
          {!hideTopicSelection && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Select Topics ({selectedTopicIds.size} selected)
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAll}
                    disabled={isGenerating}
                  >
                    {selectedTopicIds.size === selectedTopics.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[50vh] pr-4">
                  <div className="space-y-4">
                    {selectedTopics.map((topic) => (
                      <div 
                        key={topic.id} 
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedTopicIds.has(topic.id)}
                          onCheckedChange={(checked) => handleTopicToggle(topic.id, !!checked)}
                          className="mt-1"
                          disabled={isGenerating}
                        />
                        <div 
                          className="flex-1 space-y-2 cursor-pointer"
                          onClick={() => !isGenerating && handleTopicToggle(topic.id, !selectedTopicIds.has(topic.id))}
                        >
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTopicForBrief(topic);
                            setIsBriefModalOpen(true);
                          }}
                          disabled={isGenerating}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Brief
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Generation Parameters */}
          <BulkArticleConfiguration
            brandId={brandId}
            featuredImage={featuredImage}
            brandMentions={brandMentions}
            competitorMentions={competitorMentions}
            selectedInstructionId={selectedInstructionId}
            onFeaturedImageChange={setFeaturedImage}
            onBrandMentionsChange={setBrandMentions}
            onCompetitorMentionsChange={setCompetitorMentions}
            onInstructionChange={setSelectedInstructionId}
            settingsButton={
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isGenerating}>
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Content Generation Settings</DialogTitle>
                    <DialogDescription>
                      Configure the parameters for article generation. Changes here will only apply to this session.
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => handleGenerate(true)}
              disabled={selectedTopicIds.size === 0}
              className="min-w-[150px]"
            >
              Generate {selectedTopicIds.size} Article{selectedTopicIds.size > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Article Brief Modal */}
      {selectedTopicForBrief && (
        <ArticleBriefModal
          open={isBriefModalOpen}
          onOpenChange={setIsBriefModalOpen}
          topic={selectedTopicForBrief}
          brandId={brandId}
          language={language}
          wordCount={wordCount}
        />
      )}
    </Dialog>
  );
};

export default BulkArticleWriterModal;