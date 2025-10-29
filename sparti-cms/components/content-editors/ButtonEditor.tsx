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
  const [style, setStyle] = useState<string>(buttonStyle);
  const [newTab, setNewTab] = useState<boolean>(openInNewTab);

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

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = e.target.value;
    setStyle(newStyle);
    onStyleChange?.(newStyle);
  };

  const handleNewTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTabValue = e.target.checked;
    setNewTab(newTabValue);
    onNewTabChange?.(newTabValue);
  };

  const getButtonClasses = (buttonStyle: string) => {
    switch (buttonStyle) {
      case 'primary':
        return 'px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors';
      case 'secondary':
        return 'px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 transition-colors';
      case 'outline':
        return 'px-4 py-2 bg-transparent text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 transition-colors';
      case 'ghost':
        return 'px-4 py-2 bg-transparent text-purple-600 hover:bg-purple-50 rounded-md transition-colors';
      default:
        return 'px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors';
    }
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
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Button Style</label>
        <select 
          value={style}
          onChange={handleStyleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="openInNewTab" className="block text-sm font-medium text-gray-700">Open in new tab</label>
          <label htmlFor="openInNewTab" className="relative inline-block w-10 align-middle select-none cursor-pointer">
            <input 
              type="checkbox" 
              id="openInNewTab"
              checked={newTab}
              onChange={handleNewTabChange}
              className="sr-only" 
            />
            <div className={`w-10 h-5 rounded-full shadow-inner transition-colors ${
              newTab ? 'bg-purple-600' : 'bg-gray-200'
            }`}></div>
            <div className={`absolute top-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
              newTab ? 'translate-x-5' : 'translate-x-0'
            }`}></div>
          </label>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Preview:</p>
        <div className="flex justify-center">
          <button className={getButtonClasses(style)}>
            {text}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ButtonEditor;
