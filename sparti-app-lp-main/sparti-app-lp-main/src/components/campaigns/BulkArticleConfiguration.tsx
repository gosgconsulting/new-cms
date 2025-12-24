import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface BulkArticleConfigurationProps {
  brandId: string;
  featuredImage: 'none' | 'ai_generation' | 'gallery_selection';
  brandMentions: string;
  competitorMentions: string;
  selectedInstructionId: string;
  onFeaturedImageChange: (value: 'none' | 'ai_generation' | 'gallery_selection') => void;
  onBrandMentionsChange: (value: string) => void;
  onCompetitorMentionsChange: (value: string) => void;
  onInstructionChange: (id: string) => void;
  settingsButton?: React.ReactNode;
}

interface CustomInstruction {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
}

export const BulkArticleConfiguration = ({
  brandId,
  featuredImage,
  brandMentions,
  competitorMentions,
  selectedInstructionId,
  onFeaturedImageChange,
  onBrandMentionsChange,
  onCompetitorMentionsChange,
  onInstructionChange,
  settingsButton
}: BulkArticleConfigurationProps) => {
  const { user } = useAuth();
  const [customInstructions, setCustomInstructions] = useState<CustomInstruction[]>([]);
  const [isAddInstructionOpen, setIsAddInstructionOpen] = useState(false);
  const [newInstructionName, setNewInstructionName] = useState('');
  const [newInstructionContent, setNewInstructionContent] = useState('');
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);

  useEffect(() => {
    loadCustomInstructions();
  }, [brandId]);

  const loadCustomInstructions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_instruction_prompts')
        .select('id, name, content, is_default')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomInstructions(data || []);

      // Set default instruction if none selected
      if (!selectedInstructionId || selectedInstructionId === 'none') {
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
    if (!newInstructionName.trim() || !newInstructionContent.trim()) {
      toast.error('Please fill in both name and content');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsAddingInstruction(true);
    try {
      const { data, error } = await supabase
        .from('custom_instruction_prompts')
        .insert({
          user_id: user.id,
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
      if (data) {
        onInstructionChange(data.id);
      }
    } catch (error) {
      console.error('Error adding instruction:', error);
      toast.error('Failed to add custom instruction');
    } finally {
      setIsAddingInstruction(false);
    }
  };

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Article Configuration
        </CardTitle>
      </CardHeader>
      <ScrollArea className="max-h-[400px]">
        <CardContent className="space-y-6 pt-6">
              {/* Custom Instructions - Prominent placement */}
              <div className="space-y-2">
                <Label htmlFor="custom-instructions" className="text-base font-semibold">Custom Instructions</Label>
                <div className="flex gap-2">
                  <Select value={selectedInstructionId} onValueChange={onInstructionChange}>
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
                {selectedInstructionId && selectedInstructionId !== 'none' && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {customInstructions.find(i => i.id === selectedInstructionId)?.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Mentions */}
                <div className="space-y-2">
                  <Label htmlFor="brand-mentions">Brand Mentions</Label>
                  <Select value={brandMentions} onValueChange={onBrandMentionsChange}>
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
                  <Select value={competitorMentions} onValueChange={onCompetitorMentionsChange}>
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

                {/* Internal Links - moved from custom instructions section */}
                <div className="space-y-2">
                  <Label htmlFor="internal-links">Internal Links</Label>
                  <Select value="few" disabled>
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
                  <p className="text-xs text-muted-foreground">Configure in Advanced Settings</p>
                </div>

                {/* AI Featured Image */}
                <div className="space-y-2">
                  <Label htmlFor="featured-image">Featured Image</Label>
                  <Select value={featuredImage} onValueChange={onFeaturedImageChange}>
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

              {settingsButton && (
                <div className="flex justify-end">
                  {settingsButton}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
  );
};
