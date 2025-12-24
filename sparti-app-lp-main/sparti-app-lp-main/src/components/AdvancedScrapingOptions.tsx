import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface AdvancedScrapingOptionsProps {
  maxResults: number;
  collectBusinessDetails: boolean;
  fetchBusinessImages: boolean;
  onMaxResultsChange: (value: number) => void;
  onCollectBusinessDetailsChange: (value: boolean) => void;
  onFetchBusinessImagesChange: (value: boolean) => void;
  disabled?: boolean;
}

const AdvancedScrapingOptions = ({
  maxResults,
  collectBusinessDetails,
  fetchBusinessImages,
  onMaxResultsChange,
  onCollectBusinessDetailsChange,
  onFetchBusinessImagesChange,
  disabled
}: AdvancedScrapingOptionsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="max-results">Target results to extract</Label>
        <Input
          id="max-results"
          type="number"
          min="10"
          max="5000"
          value={maxResults}
          onChange={(e) => onMaxResultsChange(parseInt(e.target.value) || 200)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Range: 10-5000 results. For large quantities (&gt;200), multiple searches will be performed to reach the target.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Advanced Options</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="collect-details">Collect Business Details</Label>
            <p className="text-xs text-muted-foreground">
              Include phone numbers, websites, and business information
            </p>
          </div>
          <Switch
            id="collect-details"
            checked={collectBusinessDetails}
            onCheckedChange={onCollectBusinessDetailsChange}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="fetch-images">Fetch Business Images</Label>
            <p className="text-xs text-muted-foreground">
              Download business photos (may slow down extraction)
            </p>
          </div>
          <Switch
            id="fetch-images"
            checked={fetchBusinessImages}
            onCheckedChange={onFetchBusinessImagesChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedScrapingOptions;