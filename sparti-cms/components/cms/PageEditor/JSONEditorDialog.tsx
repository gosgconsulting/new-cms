import React from 'react';
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

interface JSONEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorRef: (element: HTMLDivElement | null) => void;
  jsonError: string | null;
  onSave: () => void;
}

export const JSONEditorDialog: React.FC<JSONEditorDialogProps> = ({
  open,
  onOpenChange,
  editorRef,
  jsonError,
  onSave,
}) => {
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
          <DialogTitle>Page Schema JSON Editor</DialogTitle>
          <DialogDescription>
            Edit the complete page structure. Be careful with this editor.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div
            ref={editorRef}
            className="w-full h-full p-4 outline-none font-mono text-sm border border-gray-300 rounded overflow-auto bg-white"
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

