import React from 'react';
import { Label } from '../../../../src/components/ui/label';
import { Switch } from '../../../../src/components/ui/switch';

interface ToggleFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({
  id,
  label,
  checked,
  onChange,
  description,
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};
