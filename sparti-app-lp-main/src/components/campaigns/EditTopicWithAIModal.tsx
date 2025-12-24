import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SuggestedTopic {
  id: string;
  title: string;
  keywords: string[];
  keyword_focus?: string[] | string; // Support both for backward compatibility
  source?: string;
  intent?: string;
  is_selected: boolean;
  research_id?: string;
}

interface EditTopicWithAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: SuggestedTopic | null;
  brandId: string;
  brandName: string;
  researchId: string;
}

interface RegenerationSettings {
  removeBrandMentions: boolean;
  removeCompetitorMentions: boolean;
  customInstructions: string;
  maintainKeywordFocus: boolean;
  preserveIntent: boolean;
}

const EditTopicWithAIModal: React.FC<EditTopicWithAIModalProps> = ({
  open,
  onOpenChange,
  topic,
  brandId,
  brandName,
  researchId
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [regeneratedTitle, setRegeneratedTitle] = useState<string>('');
  const [settings, setSettings] = useState<RegenerationSettings>({
    removeBrandMentions: false,
    removeCompetitorMentions: true,
    customInstructions: '',
    maintainKeywordFocus: true,
    preserveIntent: true
  });

  const regenerateTopicMutation = useMutation({
    mutationFn: async () => {
      if (!topic) throw new Error('No topic selected');

      const prompt = `
You are an expert content strategist. Please regenerate the following topic title based on the specific requirements:

Original Topic: "${topic.title}"
Keyword Focus: ${Array.isArray(topic.keyword_focus) ? topic.keyword_focus.join(', ') : (topic.keyword_focus || 'Not specified')}
Intent: ${topic.intent || 'Not specified'}
Brand: ${brandName}

Requirements:
${settings.removeBrandMentions ? '- Remove all mentions of the brand name and brand-specific terms' : '- Brand mentions are allowed'}
${settings.removeCompetitorMentions ? '- Remove all competitor brand names and specific company mentions' : '- Competitor mentions are allowed'}
${settings.maintainKeywordFocus ? `- Maintain focus on the keywords: ${Array.isArray(topic.keyword_focus) ? topic.keyword_focus.join(', ') : topic.keyword_focus}` : '- Keyword focus can be adjusted'}
${settings.preserveIntent ? `- Preserve the original intent: ${topic.intent}` : '- Intent can be modified'}

${settings.customInstructions ? `Additional Instructions: ${settings.customInstructions}` : ''}

Please provide ONLY the regenerated topic title, nothing else.
      `;

      const { data, error } = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'anthropic/claude-3.5-sonnet',
          max_tokens: 200,
          temperature: 0.7
        }
      });

      if (error) throw error;
      
      return data.choices[0].message.content.trim();
    },
    onSuccess: (newTitle) => {
      setRegeneratedTitle(newTitle);
      toast({
        title: "Topic Regenerated",
        description: "AI has generated a new version of your topic.",
      });
    },
    onError: (error) => {
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Failed to regenerate topic",
        variant: "destructive",
      });
    }
  });

  const updateTopicMutation = useMutation({
    mutationFn: async () => {
      if (!topic || !regeneratedTitle) throw new Error('No regenerated title available');

      const { error } = await supabase
        .from('suggested_topics')
        .update({ title: regeneratedTitle })
        .eq('id', topic.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestedTopics', researchId] });
      toast({
        title: "Topic Updated",
        description: "The topic has been updated with the new AI-generated title.",
      });
      onOpenChange(false);
      setRegeneratedTitle('');
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update topic",
        variant: "destructive",
      });
    }
  });

  const handleRegenerate = () => {
    regenerateTopicMutation.mutate();
  };

  const handleSaveChanges = () => {
    if (!regeneratedTitle) {
      toast({
        title: "No Changes",
        description: "Please regenerate the topic first before saving.",
        variant: "destructive",
      });
      return;
    }
    updateTopicMutation.mutate();
  };

  const handleReset = () => {
    setRegeneratedTitle('');
    setSettings({
      removeBrandMentions: false,
      removeCompetitorMentions: true,
      customInstructions: '',
      maintainKeywordFocus: true,
      preserveIntent: true
    });
  };

  if (!topic) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Edit Topic with AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Topic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Original Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{topic.title}</p>
              {topic.keyword_focus && (
                <p className="text-xs text-muted-foreground mt-1">
                  Keyword Focus: {Array.isArray(topic.keyword_focus) ? topic.keyword_focus.join(', ') : topic.keyword_focus}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Regeneration Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Regeneration Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remove-brand">Remove Brand Mentions</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove mentions of {brandName} and brand-specific terms
                  </p>
                </div>
                <Switch
                  id="remove-brand"
                  checked={settings.removeBrandMentions}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, removeBrandMentions: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remove-competitors">Remove Competitor Mentions</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove specific competitor brand names and companies
                  </p>
                </div>
                <Switch
                  id="remove-competitors"
                  checked={settings.removeCompetitorMentions}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, removeCompetitorMentions: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintain-keyword">Maintain Keyword Focus</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep the original keyword focus intact
                  </p>
                </div>
                <Switch
                  id="maintain-keyword"
                  checked={settings.maintainKeywordFocus}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, maintainKeywordFocus: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="preserve-intent">Preserve Intent</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep the original content intent
                  </p>
                </div>
                <Switch
                  id="preserve-intent"
                  checked={settings.preserveIntent}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, preserveIntent: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
                <Textarea
                  id="custom-instructions"
                  placeholder="Add any specific instructions for the AI..."
                  value={settings.customInstructions}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, customInstructions: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Regenerated Topic */}
          {regeneratedTitle && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-green-600">AI-Generated Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{regeneratedTitle}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Settings
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRegenerate}
                disabled={regenerateTopicMutation.isPending}
              >
                {regenerateTopicMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
              {regeneratedTitle && (
                <Button 
                  onClick={handleSaveChanges}
                  disabled={updateTopicMutation.isPending}
                >
                  {updateTopicMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTopicWithAIModal;