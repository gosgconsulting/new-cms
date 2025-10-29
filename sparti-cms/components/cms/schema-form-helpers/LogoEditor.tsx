import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { ImageIcon } from 'lucide-react';
import { ImageEditor as ContentImageEditor } from '../../content-editors';

interface LogoData {
  src: string;
  alt: string;
  height?: string;
}

interface LogoEditorProps {
  logo: LogoData;
  onChange: (logo: LogoData) => void;
  showHeight?: boolean;
  title?: string;
}

export const LogoEditor: React.FC<LogoEditorProps> = ({
  logo,
  onChange,
  showHeight = false,
  title = "Logo"
}) => {
  const handleImageChange = (imageUrl: string) => {
    onChange({ ...logo, src: imageUrl });
  };

  const handleAltChange = (alt: string) => {
    onChange({ ...logo, alt });
  };

  const handleHeightChange = (height: string) => {
    onChange({ ...logo, height });
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContentImageEditor
          imageUrl={logo.src}
          imageTitle={logo.alt}
          imageAlt={logo.alt}
          onImageChange={handleImageChange}
          onTitleChange={handleAltChange}
          onAltChange={handleAltChange}
        />
        
        {showHeight && (
          <div>
            <Label className="text-xs">Height Class</Label>
            <Input
              value={logo.height || ''}
              onChange={(e) => handleHeightChange(e.target.value)}
              placeholder="e.g., h-8, h-10, h-12"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tailwind CSS height class (e.g., h-8, h-10, h-12)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
