import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomInstructionsManager } from './CustomInstructionsManager';

interface CustomPrompt {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
}

interface CustomInstructionsSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  showLabel?: boolean;
}

export const CustomInstructionsSelector = ({ 
  value, 
  onChange,
  showLabel = true 
}: CustomInstructionsSelectorProps) => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(value || '');

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

  useEffect(() => {
    if (value) {
      setSelectedPromptId(value);
    }
  }, [value]);

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

      // Auto-select default if no selection
      if (!selectedPromptId && data && data.length > 0) {
        const defaultPrompt = data.find(p => p.is_default);
        if (defaultPrompt) {
          setSelectedPromptId(defaultPrompt.id);
          onChange?.(defaultPrompt.content);
        }
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to load custom instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (promptId: string) => {
    setSelectedPromptId(promptId);
    const selectedPrompt = prompts.find(p => p.id === promptId);
    if (selectedPrompt) {
      onChange?.(selectedPrompt.content);
    } else if (promptId === 'none') {
      onChange?.('');
    }
  };

  const handleManageClose = () => {
    setShowManageDialog(false);
    fetchPrompts(); // Refresh prompts after managing
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {showLabel && (
          <Label className="text-base font-semibold">Custom Instructions</Label>
        )}
        <div className="flex gap-2">
          <Select value={selectedPromptId} onValueChange={handleSelectionChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select custom instructions..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {prompts.map((prompt) => (
                <SelectItem key={prompt.id} value={prompt.id}>
                  {prompt.name} {prompt.is_default && '(Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowManageDialog(true)}
              title="Manage custom instructions"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Custom Instructions</DialogTitle>
              </DialogHeader>
              <CustomInstructionsManager onClose={handleManageClose} />
            </DialogContent>
          </Dialog>
        </div>
        {selectedPromptId && selectedPromptId !== 'none' && (
          <p className="text-sm text-muted-foreground">
            Selected: {prompts.find(p => p.id === selectedPromptId)?.name}
          </p>
        )}
      </div>
    </div>
  );
};
