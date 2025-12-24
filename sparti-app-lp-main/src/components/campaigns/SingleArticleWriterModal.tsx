import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PenTool, Settings, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useArticleGeneration, SelectedTopic } from '@/contexts/ArticleGenerationContext';
import { supabase } from '@/integrations/supabase/client';
import { ArticleConfigurationForm } from '@/components/onboarding/ArticleConfigurationForm';

interface SingleArticleWriterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: SelectedTopic;
  brandId: string;
  brandName: string;
  userId: string;
  onGenerationComplete?: () => void;
}

const SingleArticleWriterModal = ({ 
  open, 
  onOpenChange, 
  topic,
  brandId, 
  brandName, 
  userId,
  onGenerationComplete
}: SingleArticleWriterModalProps) => {
  const { toast } = useToast();
  const { currentSession, isGenerating, startGeneration } = useArticleGeneration();
  
  const [language, setLanguage] = useState('English');
  const [wordCount, setWordCount] = useState(800);
  const [tone, setTone] = useState('Professional');
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [includeFAQ, setIncludeFAQ] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<'none' | 'ai_generation' | 'gallery_selection'>('ai_generation');
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>('none');
  const [customInstructions, setCustomInstructions] = useState<Array<{id: string, name: string, content: string}>>([]);
  
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  // Reset generation state when modal closes
  useEffect(() => {
    if (!open) {
      setHasStartedGeneration(false);
    }
  }, [open]);

  // Monitor generation completion for onboarding callback and reset selection
  useEffect(() => {
    if (currentSession?.status === 'completed' && !isGenerating && hasStartedGeneration) {
      // Reset selected topics after successful generation
      setHasStartedGeneration(false);
      
      if (onGenerationComplete) {
        onGenerationComplete();
      }
      
      // Note: Modal closing is now handled by the parent component
      // The parent should close the modal when it detects generation completion
    }
  }, [currentSession?.status, isGenerating, hasStartedGeneration, onGenerationComplete]);

  useEffect(() => {
    if (open) {
      loadCustomInstructions();
    }
  }, [open]);

  const loadCustomInstructions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_instruction_prompts')
        .select('id, name, content, is_default')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCustomInstructions(data || []);
      
      // Set default instruction as selected
      const defaultInstruction = data?.find(i => i.is_default);
      if (defaultInstruction) {
        setSelectedInstructionId(defaultInstruction.id);
      }
    } catch (error) {
      console.error('Error loading custom instructions:', error);
    }
  };

  const handleGenerate = () => {
    const selectedInstruction = selectedInstructionId === 'none' ? null : customInstructions.find(i => i.id === selectedInstructionId);
    
    // Mark that this modal started the generation
    setHasStartedGeneration(true);

    // Start the generation session using the context (which uses execute-workflow)
    startGeneration({
      topics: [topic],
      language,
      wordCount,
      tone,
      includeIntro,
      includeConclusion,
      includeFAQ,
      featuredImage,
      model: 'anthropic/claude-3.5-sonnet', // Hardcoded AI model
      customPrompt: selectedInstruction?.content || '',
      brandId,
      brandName,
      userId
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PenTool className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">{topic.title}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Show generation in progress message if generation has started */}
        {currentSession && isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Generating Article</h3>
              <p className="text-muted-foreground">Please wait while we generate your article...</p>
            </div>
          </div>
        ) : (

        <div className="space-y-6 mt-4">
          <ArticleConfigurationForm
            selectedTopics={[topic]}
            language={language}
            onLanguageChange={setLanguage}
            wordCount={wordCount}
            onWordCountChange={setWordCount}
            tone={tone}
            onToneChange={setTone}
            includeIntro={includeIntro}
            onIncludeIntroChange={setIncludeIntro}
            includeConclusion={includeConclusion}
            onIncludeConclusionChange={setIncludeConclusion}
            includeFAQ={includeFAQ}
            onIncludeFAQChange={setIncludeFAQ}
            featuredImage={featuredImage}
            onFeaturedImageChange={setFeaturedImage}
            showTopicSelection={false}
          />

          {/* Custom Instructions Selector */}
          {customInstructions.length > 0 && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="custom-instruction">Custom Instructions</Label>
              <Select value={selectedInstructionId} onValueChange={setSelectedInstructionId}>
                <SelectTrigger id="custom-instruction">
                  <SelectValue placeholder="Select custom instructions (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {customInstructions.map((instruction) => (
                    <SelectItem key={instruction.id} value={instruction.id}>
                      {instruction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        )}

        {!(currentSession && isGenerating) && (
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate 1 Article'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SingleArticleWriterModal;
