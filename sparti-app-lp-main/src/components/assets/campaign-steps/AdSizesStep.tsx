import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Layers, CheckCircle2 } from 'lucide-react';
import type { AdFormat } from '../CreateCampaignModal';

interface AdSizesStepProps {
  selectedFormats: AdFormat[];
  onFormatsSelected: (formats: AdFormat[]) => void;
}

const AD_FORMATS: AdFormat[] = [
  {
    name: 'Square',
    aspect_ratio: '1:1',
    dimensions: '1080x1080',
    platforms: ['Instagram Feed', 'Facebook Feed'],
    best_for: 'General posts, product showcases',
  },
  {
    name: 'Portrait',
    aspect_ratio: '4:5',
    dimensions: '1080x1350',
    platforms: ['Instagram Feed', 'Facebook Feed'],
    best_for: 'Mobile-optimized feed posts',
  },
  {
    name: 'Story',
    aspect_ratio: '9:16',
    dimensions: '1080x1920',
    platforms: ['Instagram Stories', 'Facebook Stories', 'Reels'],
    best_for: 'Full-screen immersive content',
  },
  {
    name: 'Landscape',
    aspect_ratio: '16:9',
    dimensions: '1200x675',
    platforms: ['Facebook Feed', 'Facebook Ads'],
    best_for: 'Desktop feed, video ads',
  },
  {
    name: 'Carousel Square',
    aspect_ratio: '1:1',
    dimensions: '1080x1080',
    platforms: ['Instagram Carousel', 'Facebook Carousel'],
    best_for: 'Multiple product showcases',
  },
];

export const AdSizesStep = ({ selectedFormats, onFormatsSelected }: AdSizesStepProps) => {
  const toggleFormat = (format: AdFormat) => {
    const isSelected = selectedFormats.some((f) => f.name === format.name);
    if (isSelected) {
      onFormatsSelected(selectedFormats.filter((f) => f.name !== format.name));
    } else {
      onFormatsSelected([...selectedFormats, format]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle>Select Ad Formats</CardTitle>
          </div>
          <CardDescription>
            Choose one or more Meta ad formats for your assets ({selectedFormats.length} selected)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {AD_FORMATS.map((format) => {
              const isSelected = selectedFormats.some((f) => f.name === format.name);
              return (
                <Card
                  key={format.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => toggleFormat(format)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={isSelected} className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{format.name}</p>
                          <Badge variant="outline">{format.aspect_ratio}</Badge>
                          <span className="text-xs text-muted-foreground">{format.dimensions}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Platforms:</span> {format.platforms.join(', ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Best for:</span> {format.best_for}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedFormats.length > 0 && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">
                {selectedFormats.length} format(s) selected: {selectedFormats.map((f) => f.name).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
