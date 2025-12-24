import React, { useState } from 'react';
import { Button } from '../../../../src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../../../src/components/ui/dialog';
import { JSON_EDITOR_CONFIG } from '../../../utils/componentHelpers';
import { Copy, Check } from 'lucide-react';

interface JSONEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorRef: (element: HTMLDivElement | null) => void;
  jsonString: string;
  jsonError: string | null;
  onSave: () => void;
}

export const JSONEditorDialog: React.FC<JSONEditorDialogProps> = ({
  open,
  onOpenChange,
  editorRef,
  jsonString,
  jsonError,
  onSave,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[testing] Failed to copy JSON:', error);
    }
  };

  const handleSave = async () => {
    if (!jsonError) {
      await onSave();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Page Schema JSON Editor</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyJSON}
              disabled={!jsonString}
              className="ml-4"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </>
              )}
            </Button>
          </DialogTitle>
          <DialogDescription>
            Edit the complete page structure. Be careful with this editor.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div
            ref={editorRef}
            className="w-full h-full p-4 outline-none font-mono text-sm border border-gray-300 rounded bg-white"
            style={{
              minHeight: JSON_EDITOR_CONFIG.MIN_HEIGHT,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              tabSize: JSON_EDITOR_CONFIG.TAB_SIZE,
            }}
            spellCheck="false"
            dir="ltr"
          />
          {jsonError && <p className="text-destructive text-sm mt-2">{jsonError}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!!jsonError}
          >
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

