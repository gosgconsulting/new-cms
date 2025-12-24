import { useState, useEffect } from 'react';
import { Plus, Trash2, Star, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CustomPrompt {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomInstructionsManagerProps {
  onClose?: () => void;
}

export const CustomInstructionsManager = ({ onClose }: CustomInstructionsManagerProps) => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPromptDialog, setShowNewPromptDialog] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_instruction_prompts')
        .select('*')
        .eq('user_id', user!.id)
        .is('brand_id', null) // User-level instructions only
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to load custom instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewPrompt = async () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) {
      toast.error('Please provide both name and content');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('custom_instruction_prompts')
        .insert({
          user_id: user.id,
          brand_id: null, // User-level instructions
          name: newPromptName,
          content: newPromptContent,
          is_default: prompts.length === 0 // First prompt becomes default
        });

      if (error) throw error;

      toast.success('Custom instruction saved');
      setShowNewPromptDialog(false);
      setNewPromptName('');
      setNewPromptContent('');
      fetchPrompts();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Failed to save custom instruction');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (promptId: string) => {
    try {
      // First, unset all defaults for this user
      await supabase
        .from('custom_instruction_prompts')
        .update({ is_default: false })
        .eq('user_id', user!.id)
        .is('brand_id', null);

      // Then set the new default
      const { error } = await supabase
        .from('custom_instruction_prompts')
        .update({ is_default: true })
        .eq('id', promptId);

      if (error) throw error;

      toast.success('Default instruction updated');
      fetchPrompts();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to set default instruction');
    }
  };

  const handleEditPrompt = (prompt: CustomPrompt) => {
    setEditingPrompt(prompt);
    setShowEditDialog(true);
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt || !editingPrompt.name.trim() || !editingPrompt.content.trim()) {
      toast.error('Please provide both name and content');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('custom_instruction_prompts')
        .update({
          name: editingPrompt.name,
          content: editingPrompt.content
        })
        .eq('id', editingPrompt.id);

      if (error) throw error;

      toast.success('Custom instruction updated');
      setShowEditDialog(false);
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error('Failed to update custom instruction');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this custom instruction?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_instruction_prompts')
        .delete()
        .eq('id', promptId);

      if (error) throw error;

      toast.success('Custom instruction deleted');
      fetchPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete custom instruction');
    }
  };

  const defaultPrompt = prompts.find(p => p.is_default);
  const otherPrompts = prompts.filter(p => !p.is_default);
  const displayedPrompts = isExpanded ? prompts : (defaultPrompt ? [defaultPrompt] : []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Instructions</h3>
          <p className="text-sm text-muted-foreground">
            Additional rules for all articles across all brands.
          </p>
        </div>
        <Dialog open={showNewPromptDialog} onOpenChange={setShowNewPromptDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Instruction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Custom Instruction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-name">Name</Label>
                <Input
                  id="prompt-name"
                  placeholder="e.g., Professional Tone"
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt-content">Instructions</Label>
                <Textarea
                  id="prompt-content"
                  placeholder="e.g., Use a professional and friendly tone..."
                  value={newPromptContent}
                  onChange={(e) => setNewPromptContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewPromptDialog(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveNewPrompt} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Instruction'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {prompts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No custom instructions yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first custom instruction to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {displayedPrompts.map((prompt) => (
              <Card 
                key={prompt.id} 
                className={prompt.is_default ? 'border-2 border-primary shadow-sm' : 'border'}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{prompt.name}</h4>
                        {prompt.is_default && (
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {prompt.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!prompt.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(prompt.id)}
                          title="Set as default"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPrompt(prompt)}
                        title="Edit instruction"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Expand/Collapse button - only show if there are more than 1 instruction */}
          {prompts.length > 1 && (
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show {otherPrompts.length} More {otherPrompts.length === 1 ? 'Instruction' : 'Instructions'}
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {defaultPrompt && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-primary fill-current mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">Currently Active</h4>
                <p className="text-sm text-muted-foreground">
                  "{defaultPrompt.name}" will be applied to all new articles across all brands.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Custom Instruction</DialogTitle>
          </DialogHeader>
          {editingPrompt && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prompt-name">Name</Label>
                <Input
                  id="edit-prompt-name"
                  placeholder="e.g., Professional Tone"
                  value={editingPrompt.name}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prompt-content">Instructions</Label>
                <Textarea
                  id="edit-prompt-content"
                  placeholder="e.g., Use a professional and friendly tone..."
                  value={editingPrompt.content}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingPrompt(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdatePrompt} disabled={saving}>
                  {saving ? 'Updating...' : 'Update Instruction'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
