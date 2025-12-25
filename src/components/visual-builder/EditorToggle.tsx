"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useSpartiBuilder } from "../../../sparti-cms/components/SpartiBuilderProvider";
import { showInfoToast } from "@/utils/toast-utils";
import { Wand, X } from "lucide-react";

const EditorToggle: React.FC = () => {
  const { isEditing, enterEditMode, exitEditMode } = useSpartiBuilder();

  const toggle = () => {
    if (isEditing) {
      exitEditMode();
      showInfoToast("Edit mode disabled");
    } else {
      enterEditMode();
      showInfoToast("Edit mode enabled");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[10000] sparti-ui">
      <Button
        variant={isEditing ? "destructive" : "cta-gradient"}
        size="lg"
        onClick={toggle}
        aria-label={isEditing ? "Exit Edit Mode" : "Enable Edit Mode"}
        className="shadow-lg"
      >
        {isEditing ? <X className="mr-1" /> : <Wand className="mr-1" />}
        {isEditing ? "Exit Edit Mode" : "Enable Edit"}
      </Button>
    </div>
  );
};

export default EditorToggle;