import React from 'react';
import { Edit3, X, Save, Undo } from 'lucide-react';
import { useSpartiBuilder } from './SpartiBuilderProvider';

export const SpartiToolbar: React.FC = () => {
  const { isEditing, config, enterEditMode, exitEditMode } = useSpartiBuilder();

  if (!config.toolbar) return null;

  return (
    <div className="sparti-toolbar">
      <div className="sparti-toolbar-content">
        <div className="sparti-toolbar-brand">
          <Edit3 size={20} />
          <span>Sparti Builder</span>
        </div>
        
        <div className="sparti-toolbar-actions">
          {!isEditing ? (
            <button 
              className="sparti-btn sparti-btn-primary" 
              onClick={enterEditMode}
            >
              <Edit3 size={16} />
              Edit with Sparti Builder
            </button>
          ) : (
            <>
              <button className="sparti-btn sparti-btn-ghost" title="Undo">
                <Undo size={16} />
              </button>
              <button className="sparti-btn sparti-btn-success" title="Save Changes">
                <Save size={16} />
                Save
              </button>
              <button 
                className="sparti-btn sparti-btn-ghost" 
                onClick={exitEditMode}
                title="Exit Editor"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};