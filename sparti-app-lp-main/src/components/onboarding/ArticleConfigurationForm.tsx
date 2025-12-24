import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { SelectedTopic } from '@/contexts/ArticleGenerationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CustomInstruction {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
}

interface ArticleConfigurationFormProps {
  selectedTopics: SelectedTopic[];
  language: string;
  wordCount: number;
  tone: string;
  model?: string;
  includeIntro: boolean;
  includeConclusion: boolean;
  includeFAQ: boolean;
  featuredImage?: 'none' | 'ai_generation' | 'gallery_selection';
  selectedInstructionId?: string;
  brandId?: string;
  onLanguageChange: (value: string) => void;
  onWordCountChange: (value: number) => void;
  onToneChange: (value: string) => void;
  onModelChange?: (value: string) => void;
  onIncludeIntroChange: (checked: boolean) => void;
  onIncludeConclusionChange: (checked: boolean) => void;
  onIncludeFAQChange: (checked: boolean) => void;
  onFeaturedImageChange?: (value: 'none' | 'ai_generation' | 'gallery_selection') => void;
  onInstructionChange?: (id: string) => void;
  preselectedTopicTitle?: string;
  showTopicSelection?: boolean;
  settingsButton?: React.ReactNode;
}

export const ArticleConfigurationForm = ({
  selectedTopics,
  language,
  wordCount,
  tone,
  model,
  includeIntro,
  includeConclusion,
  includeFAQ,
  featuredImage = 'none',
  selectedInstructionId = 'none',
  brandId,
  onLanguageChange,
  onWordCountChange,
  onToneChange,
  onModelChange,
  onIncludeIntroChange,
  onIncludeConclusionChange,
  onIncludeFAQChange,
  onFeaturedImageChange,
  onInstructionChange,
  preselectedTopicTitle,
  showTopicSelection = true,
  settingsButton
}: ArticleConfigurationFormProps) => {
  const [customInstructions, setCustomInstructions] = useState<CustomInstruction[]>([]);
  const [isAddInstructionOpen, setIsAddInstructionOpen] = useState(false);
  const [newInstructionName, setNewInstructionName] = useState('');
  const [newInstructionContent, setNewInstructionContent] = useState('');
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);

  useEffect(() => {
    if (brandId) {
      loadCustomInstructions();
    }
  }, [brandId]);

  const loadCustomInstructions = async () => {
    if (!brandId) return;
    
    try {
      const { data, error } = await supabase
        .from('custom_instruction_prompts')
        .select('id, name, content, is_default')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomInstructions(data || []);

      // Set default instruction if none selected
      if ((!selectedInstructionId || selectedInstructionId === 'none') && onInstructionChange) {
        const defaultInstruction = data?.find(i => i.is_default);
        if (defaultInstruction) {
          onInstructionChange(defaultInstruction.id);
        }
      }
    } catch (error) {
      console.error('Error loading custom instructions:', error);
    }
  };

  const handleAddInstruction = async () => {
    if (!brandId) {
      toast.error('Brand ID is required');
      return;
    }

    if (!newInstructionName.trim() || !newInstructionContent.trim()) {
      toast.error('Please fill in both name and content');
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

      toast.success('Custom instruction added');
      setNewInstructionName('');
      setNewInstructionContent('');
      setIsAddInstructionOpen(false);
      await loadCustomInstructions();
      
      // Auto-select the newly created instruction
      if (data && onInstructionChange) {
        onInstructionChange(data.id);
      }
    } catch (error) {
      console.error('Error adding instruction:', error);
      toast.error('Failed to add custom instruction');
    } finally {
      setIsAddingInstruction(false);
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

  const cardTitle = preselectedTopicTitle || (selectedTopics.length === 1 ? selectedTopics[0]?.title : 'Article Configuration');
  const showTopicsList = showTopicSelection && !preselectedTopicTitle && selectedTopics.length > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        {showTopicsList && (
          <CardDescription className="mt-4">
            <div className="space-y-2">
              <p className="font-medium">Select Topics ({selectedTopics.length} selected)</p>
              <div className="space-y-2 mt-3">
                {selectedTopics.map((topic) => (
                  <div key={topic.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="font-medium text-sm">{topic.title}</div>
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
              </div>
            </div>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Italian">Italian</SelectItem>
                <SelectItem value="Portuguese">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wordCount">Word Count (Max 1000)</Label>
            <Select value={wordCount.toString()} onValueChange={(v) => onWordCountChange(parseInt(v))}>
              <SelectTrigger id="wordCount">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">500 words</SelectItem>
                <SelectItem value="600">600 words</SelectItem>
                <SelectItem value="700">700 words</SelectItem>
                <SelectItem value="800">800 words (Recommended)</SelectItem>
                <SelectItem value="1000">1000 words (Maximum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={onToneChange}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Authoritative">Authoritative</SelectItem>
                <SelectItem value="Conversational">Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model || 'anthropic/claude-3.5-sonnet'} onValueChange={onModelChange}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recommended)</SelectItem>
                <SelectItem value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku (Faster)</SelectItem>
                <SelectItem value="openai/gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="google/gemini-pro">Gemini Pro</SelectItem>
                <SelectItem value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</SelectItem>
                <SelectItem value="mistralai/mixtral-8x7b-instruct">Mixtral 8x7B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {onFeaturedImageChange && (
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image</Label>
              <Select value={featuredImage} onValueChange={onFeaturedImageChange}>
                <SelectTrigger id="featuredImage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="ai_generation">AI Generation</SelectItem>
                  <SelectItem value="gallery_selection">Gallery Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Instructions */}
          {onInstructionChange && brandId && (
            <div className="space-y-2">
              <Label htmlFor="custom-instructions">Custom Instructions</Label>
              <div className="flex gap-2">
                <Select value={selectedInstructionId} onValueChange={onInstructionChange}>
                  <SelectTrigger id="custom-instructions" className="flex-1">
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
                
                <Dialog open={isAddInstructionOpen} onOpenChange={setIsAddInstructionOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
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
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Article Structure</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="intro" 
                checked={includeIntro}
                onCheckedChange={(checked) => onIncludeIntroChange(checked as boolean)}
              />
              <Label htmlFor="intro" className="font-normal cursor-pointer">
                Include Introduction
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="conclusion" 
                checked={includeConclusion}
                onCheckedChange={(checked) => onIncludeConclusionChange(checked as boolean)}
              />
              <Label htmlFor="conclusion" className="font-normal cursor-pointer">
                Include Conclusion
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="faq" 
                checked={includeFAQ}
                onCheckedChange={(checked) => onIncludeFAQChange(checked as boolean)}
              />
              <Label htmlFor="faq" className="font-normal cursor-pointer">
                Include FAQ Section
              </Label>
            </div>
          </div>
        </div>

        {settingsButton && (
          <div className="flex justify-end">
            {settingsButton}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
