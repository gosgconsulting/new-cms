// Enhanced Content Edit Panel with specialized editors for different element types
import React, { useState, useEffect } from 'react';
import { Type, Palette, Eye, Image, Video, Link, MousePointer, Settings } from 'lucide-react';
import { useSpartiBuilder } from './SpartiBuilderProvider';
import { ElementType } from '../types';

// Specialized editor components
import { ImageEditor } from './editors/ImageEditor';
import { VideoEditor } from './editors/VideoEditor'; 
import { ButtonEditor } from './editors/ButtonEditor';
import { LinkEditor } from './editors/LinkEditor';
import { InputEditor } from './editors/InputEditor';
import { TextEditor } from './editors/TextEditor';
import { ContainerEditor } from './editors/ContainerEditor';

export const ContentEditPanel: React.FC = () => {
  const { isEditing, selectedElement } = useSpartiBuilder();

  if (!isEditing || !selectedElement) return null;

  const { data } = selectedElement;
  const elementType = data.elementType;

  const getEditorIcon = (type: ElementType) => {
    const icons = {
      image: Image,
      video: Video,
      link: Link,
      button: MousePointer,
      input: Settings,
      text: Type,
      container: Settings,
      media: Image,
      unknown: Settings,
    };
    return icons[type] || Settings;
  };

  const renderSpecializedEditor = () => {
    const commonProps = { selectedElement };

    switch (elementType) {
      case 'image':
        return <ImageEditor {...commonProps} />;
      case 'video':
        return <VideoEditor {...commonProps} />;
      case 'button':
        return <ButtonEditor {...commonProps} />;
      case 'link':
        return <LinkEditor {...commonProps} />;
      case 'input':
        return <InputEditor {...commonProps} />;
      case 'text':
        return <TextEditor {...commonProps} />;
      case 'container':
        return <ContainerEditor {...commonProps} />;
      default:
        return <TextEditor {...commonProps} />;
    }
  };

  const IconComponent = getEditorIcon(elementType);

  return (
    <div className="sparti-edit-panel">
      <div className="sparti-edit-panel-header">
        <div className="sparti-edit-header-content">
          <IconComponent size={20} />
          <div>
            <h3>{elementType.charAt(0).toUpperCase() + elementType.slice(1)} Editor</h3>
            <p className="sparti-element-path">{data.tagName.toUpperCase()}</p>
          </div>
        </div>
      </div>
      
      <div className="sparti-edit-panel-content">
        {renderSpecializedEditor()}
      </div>
    </div>
  );
};