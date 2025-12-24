import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool, CheckSquare, Square, Settings, Code, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useArticleGeneration } from '@/contexts/ArticleGenerationContext';
import { SelectedTopic } from '@/contexts/ArticleGenerationContext';
import { PromptViewer } from './PromptViewer';
import ArticleGenerationProgress from '@/components/ArticleGenerationProgress';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQueryClient } from '@tanstack/react-query';

interface TopicSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: SelectedTopic[];
  brandId: string;
  brandName: string;
  userId: string;
  campaignId?: string;
  onComplete?: () => void;
}

export function TopicSelectionModal({
  open,
  onOpenChange,
  topics,
  brandId,
  brandName,
  userId,
  campaignId,
  onComplete
}: TopicSelectionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isGenerating, startGeneration } = useArticleGeneration();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Configuration state
  const [featuredImage, setFeaturedImage] = useState<'none' | 'ai_generation' | 'gallery_selection'>('ai_generation');
  const [brandMentions, setBrandMentions] = useState('regular');
  const [competitorMentions, setCompetitorMentions] = useState('minimal');
  const [internalLinks, setInternalLinks] = useState('few');
  const [model, setModel] = useState('gpt-4o');
  
  // Article Configuration Modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  // Custom instructions state
  const [customInstructions, setCustomInstructions] = useState<Array<{
    id: string;
    name: string;
    content: string;
    is_default: boolean;
  }>>([]);
  const [selectedInstructionId, setSelectedInstructionId] = useState('none');
  const [isAddInstructionOpen, setIsAddInstructionOpen] = useState(false);
  const [newInstructionName, setNewInstructionName] = useState('');
  const [newInstructionContent, setNewInstructionContent] = useState('');
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);
  const [deleteInstructionId, setDeleteInstructionId] = useState<string | null>(null);
  const [isDeletingInstruction, setIsDeletingInstruction] = useState(false);

  useEffect(() => {
    if (open && brandId) {
      loadCustomInstructions();
    }
  }, [open, brandId]);

  const loadCustomInstructions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_instruction_prompts')
        .select('id, name, content, is_default')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomInstructions(data || []);

      if (!selectedInstructionId || selectedInstructionId === 'none') {
        const defaultInstruction = data?.find(i => i.is_default);
        if (defaultInstruction) {
          setSelectedInstructionId(defaultInstruction.id);
        }
      }
    } catch (error) {
      console.error('Error loading custom instructions:', error);
    }
  };

  const handleAddInstruction = async () => {
    if (!newInstructionName.trim() || !newInstructionContent.trim()) {
      sonnerToast.error('Please fill in both name and content');
      return;
    }

    setIsAddingInstruction(true);
    try {
      const { data, error } = await supabase
        .from('custom_instruction_prompts')
        .insert({
          brand_id: brandId,
          name: newInstructionName.trim(),
          content: newInstructionContent.trim(),
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;

      sonnerToast.success('Custom instruction added');
      setNewInstructionName('');
      setNewInstructionContent('');
      setIsAddInstructionOpen(false);
      await loadCustomInstructions();
      
      if (data) {
        setSelectedInstructionId(data.id);
      }
    } catch (error) {
      console.error('Error adding instruction:', error);
      sonnerToast.error('Failed to add custom instruction');
    } finally {
      setIsAddingInstruction(false);
    }
  };

  const handleDeleteInstruction = async () => {
    if (!deleteInstructionId) return;

    setIsDeletingInstruction(true);
    try {
      const { error } = await supabase
        .from('custom_instruction_prompts')
        .delete()
        .eq('id', deleteInstructionId);

      if (error) throw error;

      sonnerToast.success('Custom instruction deleted');
      
      // Reset selection if deleted instruction was selected
      if (selectedInstructionId === deleteInstructionId) {
        setSelectedInstructionId('none');
      }
      
      await loadCustomInstructions();
    } catch (error) {
      console.error('Error deleting instruction:', error);
      sonnerToast.error('Failed to delete custom instruction');
    } finally {
      setIsDeletingInstruction(false);
      setDeleteInstructionId(null);
    }
  };

  const selectedInstruction = customInstructions.find(i => i.id === selectedInstructionId);
  
  // Hardcoded article structure - following outline from topic brief
  const includeIntro = true;
  const includeConclusion = true;
  const includeFAQ = false;

  const handleToggle = (topicId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === topics.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(topics.map(t => t.id)));
    }
  };

  const handleGenerate = (useUnified: boolean = false) => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Topics Selected",
        description: "Please select at least one topic to generate articles.",
        variant: "destructive",
      });
      return;
    }

    const selectedTopics = topics.filter(t => selectedIds.has(t.id));
    
    startGeneration({
      topics: selectedTopics,
      language: 'English',
      wordCount: 800,
      tone: 'Professional',
      includeIntro,
      includeConclusion,
      includeFAQ,
      featuredImage,
      model: useUnified ? 'openai/gpt-4o' : model,
      customPrompt: '',
      brandId,
      brandName,
      userId,
      campaignId,
      workflowType: useUnified ? 'Content Writing Unified' : 'Content Writing',
      contentSettings: {
        brand_mentions: brandMentions,
        competitor_mentions: competitorMentions,
        internal_links: internalLinks,
        use_brand_info: brandMentions !== 'none'
      }
    });

    toast({
      title: "Generation Started",
      description: `Generating ${selectedIds.size} article${selectedIds.size > 1 ? 's' : ''}...`,
    });

    // Keep modal open to show progress
    // Modal will stay open and show ArticleGenerationProgress
    
    if (onComplete) {
      onComplete();
    }
  };

  const allSelected = selectedIds.size === topics.length && topics.length > 0;

  const selectedTopic = topics.find(t => selectedIds.has(t.id));

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing while generating
      if (!newOpen && isGenerating) {
        return;
      }
      
      // Refresh topics list when closing
      if (!newOpen) {
        queryClient.invalidateQueries({ queryKey: ['selectedTopics'] });
        queryClient.invalidateQueries({ queryKey: ['campaignTopics'] });
      }
      
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Bulk Article Generation
          </DialogTitle>
          <DialogDescription>
            {isGenerating 
              ? "Generating your articles..." 
              : "Configure your article generation settings and review the AI prompt"}
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex-1 overflow-auto">
            <ArticleGenerationProgress showDetails />
          </div>
        ) : (
          <Tabs defaultValue="workflow" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="prompt" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Prompt
              </TabsTrigger>
            </TabsList>

          <TabsContent value="workflow" className="flex-1 overflow-y-auto space-y-3 pr-2 mt-4">
          {/* Article Configuration - Collapsible */}
          <div className="pb-3 space-y-3 border-b">
            <div className="space-y-3">
              {/* Collapsible Article Configuration */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsConfigModalOpen(!isConfigModalOpen)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg border border-primary/10"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-semibold text-base">Article Configuration</span>
                  {isConfigModalOpen ? (
                    <svg className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Expandable Configuration Content */}
                {isConfigModalOpen && (
                  <Card className="border-primary/10">
                    <CardContent className="space-y-6 pt-6">
                      {/* Custom Instructions */}
                      <div className="space-y-2">
                        <Label htmlFor="custom-instructions" className="text-base font-semibold">Custom Instructions</Label>
                        <div className="flex gap-2">
                          <Select value={selectedInstructionId} onValueChange={setSelectedInstructionId}>
                            <SelectTrigger id="custom-instructions" className="flex-1 bg-primary/5 border-primary/20">
                              <SelectValue placeholder="Select instructions..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {customInstructions.map((instruction) => (
                                <SelectItem key={instruction.id} value={instruction.id}>
                                  {instruction.name}
                                  {instruction.is_default && ' (Default)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Button variant="outline" size="icon" onClick={() => setIsAddInstructionOpen(true)}>
                            <Plus className="h-4 w-4" />
                          </Button>

                          {selectedInstructionId && selectedInstructionId !== 'none' && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setDeleteInstructionId(selectedInstructionId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Display selected instruction content */}
                        {selectedInstruction && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Selected: {selectedInstruction.name}
                            </p>
                            <Textarea
                              value={selectedInstruction.content}
                              readOnly
                              className="min-h-[100px] bg-muted/30 resize-none"
                              placeholder="No custom instructions"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Brand Mentions */}
                        <div className="space-y-2">
                          <Label htmlFor="brand-mentions">Brand Mentions</Label>
                          <Select value={brandMentions} onValueChange={setBrandMentions}>
                            <SelectTrigger id="brand-mentions">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="frequent">Frequent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Competitor Mentions */}
                        <div className="space-y-2">
                          <Label htmlFor="competitor-mentions">Competitor Mentions</Label>
                          <Select value={competitorMentions} onValueChange={setCompetitorMentions}>
                            <SelectTrigger id="competitor-mentions">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="regular">Regular</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Internal Links */}
                        <div className="space-y-2">
                          <Label htmlFor="internal-links">Internal Links</Label>
                          <Select value={internalLinks} onValueChange={setInternalLinks}>
                            <SelectTrigger id="internal-links">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="few">Few (1-2)</SelectItem>
                              <SelectItem value="regular">Regular (3-4)</SelectItem>
                              <SelectItem value="many">Many (5+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-2">
                          <Label htmlFor="featured-image">Featured Image</Label>
                          <Select value={featuredImage} onValueChange={(v: any) => setFeaturedImage(v)}>
                            <SelectTrigger id="featured-image">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="ai_generation">AI Generation</SelectItem>
                              <SelectItem value="gallery_selection">Gallery Selection</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Select All Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="w-full"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Select All ({topics.length})
                </>
              )}
            </Button>
          </div>

          {/* Add Custom Instruction Dialog */}
          <Dialog open={isAddInstructionOpen} onOpenChange={setIsAddInstructionOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Custom Instruction</DialogTitle>
                <DialogDescription>
                  Create a new custom instruction to guide the AI in generating articles
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instruction-name">Name</Label>
                  <Input
                    id="instruction-name"
                    placeholder="e.g., Technical Writing Style"
                    value={newInstructionName}
                    onChange={(e) => setNewInstructionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instruction-content">Content</Label>
                  <Textarea
                    id="instruction-content"
                    placeholder="Enter your custom instructions here..."
                    value={newInstructionContent}
                    onChange={(e) => setNewInstructionContent(e.target.value)}
                    rows={8}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddInstructionOpen(false)}
                    disabled={isAddingInstruction}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddInstruction}
                    disabled={isAddingInstruction}
                  >
                    {isAddingInstruction ? 'Adding...' : 'Add Instruction'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Topics List - Scrollable Area */}
          {topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No topics available
            </div>
          ) : (
            <div className="space-y-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`
                    flex items-start gap-3 p-4 border rounded-lg 
                    hover:bg-accent/50 transition-colors cursor-pointer
                    ${selectedIds.has(topic.id) ? 'border-primary bg-primary/5' : 'border-border'}
                  `}
                  onClick={() => handleToggle(topic.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(topic.id)}
                    onCheckedChange={() => handleToggle(topic.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{topic.title}</div>
                    {topic.keywords && topic.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.slice(0, 5).map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {topic.keywords.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{topic.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                    {topic.intent && (
                      <Badge variant="outline" className="text-xs">
                        {topic.intent}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </TabsContent>

          <TabsContent value="prompt" className="flex-1 overflow-y-auto pr-2 mt-4">
            <PromptViewer 
              selectedTopicTitle={selectedTopic?.title}
              configuration={{
                brandMentions,
                competitorMentions,
                internalLinks,
                featuredImage,
                includeIntro,
                includeConclusion,
                includeFAQ
              }}
            />
          </TabsContent>
        </Tabs>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t mt-auto">
          {!isGenerating ? (
            <>
              <div className="text-sm text-muted-foreground">
                {selectedIds.size} topic{selectedIds.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleGenerate(true)}
                  disabled={selectedIds.size === 0}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Generate {selectedIds.size > 0 ? selectedIds.size : ''} Article{selectedIds.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="ml-auto"
            >
              Close
            </Button>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteInstructionId} onOpenChange={(open) => !open && setDeleteInstructionId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Custom Instruction</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this custom instruction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingInstruction}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteInstruction}
                disabled={isDeletingInstruction}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingInstruction ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
