import React, { useState } from 'react';
import { Link } from 'lucide-react';

interface ButtonEditorProps {
  buttonText?: string;
  buttonUrl?: string;
  buttonStyle?: string;
  openInNewTab?: boolean;
  onTextChange?: (text: string) => void;
  onUrlChange?: (url: string) => void;
  onStyleChange?: (style: string) => void;
  onNewTabChange?: (openInNewTab: boolean) => void;
  className?: string;
}

export const ButtonEditor: React.FC<ButtonEditorProps> = ({
  buttonText = 'Click Me',
  buttonUrl = '/contact',
  buttonStyle = 'primary',
  openInNewTab = false,
  onTextChange,
  onUrlChange,
  onStyleChange,
  onNewTabChange,
  className = ''
}) => {
  const [text, setText] = useState<string>(buttonText);
  const [url, setUrl] = useState<string>(buttonUrl);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange?.(newText);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onUrlChange?.(newUrl);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Button Text</label>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Button text"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Button URL</label>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
};

export default ButtonEditor;
