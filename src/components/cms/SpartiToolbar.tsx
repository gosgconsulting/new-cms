import React from 'react';
import { Edit3, X, Save, Undo } from 'lucide-react';
import { useSpartiBuilder } from './SpartiBuilderProvider';
import gosgLogo from "@/assets/go-sg-logo-official.png";

export const SpartiToolbar: React.FC = () => {
  const { isEditing, config, enterEditMode, exitEditMode } = useSpartiBuilder();

  if (!config.toolbar) return null;

  return (
    <div className="sparti-toolbar bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="sparti-toolbar-content">
        <div className="sparti-toolbar-brand">
          <img 
            src={gosgLogo} 
            alt="GO SG Digital Marketing Agency" 
            className="h-6 w-auto mr-2"
          />
          <span className="text-foreground font-medium">Page Editor</span>
        </div>
        
        <div className="sparti-toolbar-actions">
          {!isEditing ? (
            <button 
              className="sparti-btn bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center space-x-2 group relative overflow-hidden" 
              onClick={enterEditMode}
            >
              <Edit3 size={16} className="mr-1" />
              <span className="relative z-10">Edit Page</span>
              <span className="absolute inset-0 w-full h-full bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 blur-sm"></span>
            </button>
          ) : (
            <>
              <button 
                className="sparti-btn bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg transition-all duration-200 flex items-center" 
                title="Undo"
              >
                <Undo size={16} />
              </button>
              <button 
                className="sparti-btn bg-brandTeal hover:bg-brandTeal/90 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md" 
                title="Save Changes"
              >
                <Save size={16} className="mr-1" />
                Save
              </button>
              <button 
                className="sparti-btn bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg transition-all duration-200 flex items-center" 
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