import React, { useState } from 'react';
import { Globe, Clock, ChevronDown, Search, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Countries list
const countries = [
  { code: 'SG', name: 'Singapore' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' }
].sort((a, b) => a.name.localeCompare(b.name));

// Timezones list
const timezones = [
  { code: 'UTC', name: 'UTC - Coordinated Universal Time', offset: '+00:00' },
  { code: 'GMT', name: 'GMT - Greenwich Mean Time', offset: '+00:00' },
  { code: 'EST', name: 'EST - Eastern Standard Time', offset: '-05:00' },
  { code: 'CST', name: 'CST - Central Standard Time', offset: '-06:00' },
  { code: 'MST', name: 'MST - Mountain Standard Time', offset: '-07:00' },
  { code: 'PST', name: 'PST - Pacific Standard Time', offset: '-08:00' },
  { code: 'SGT', name: 'SGT - Singapore Standard Time', offset: '+08:00' },
  { code: 'HKT', name: 'HKT - Hong Kong Time', offset: '+08:00' },
  { code: 'JST', name: 'JST - Japan Standard Time', offset: '+09:00' },
  { code: 'AEST', name: 'AEST - Australian Eastern Standard Time', offset: '+10:00' },
  { code: 'CET', name: 'CET - Central European Time', offset: '+01:00' },
  { code: 'EET', name: 'EET - Eastern European Time', offset: '+02:00' },
  { code: 'IST', name: 'IST - India Standard Time', offset: '+05:30' },
  { code: 'BST', name: 'BST - British Summer Time', offset: '+01:00' }
].sort((a, b) => a.name.localeCompare(b.name));

interface LocationSectionProps {
  country: string;
  timezone: string;
  onCountryChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  country,
  timezone,
  onCountryChange,
  onTimezoneChange
}) => {
  const [countrySearch, setCountrySearch] = useState('');
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [timezoneOpen, setTimezoneOpen] = useState(false);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredTimezones = timezones.filter(tz =>
    tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.offset.includes(timezoneSearch)
  );

  const SearchableDropdown: React.FC<{
    value: string;
    onValueChange: (value: string) => void;
    options: { code: string; name: string; offset?: string }[];
    placeholder: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    icon: React.ReactNode;
    label: string;
    showOffset?: boolean;
  }> = ({ 
    value, 
    onValueChange, 
    options, 
    placeholder, 
    searchValue, 
    onSearchChange, 
    open, 
    onOpenChange, 
    icon, 
    label,
    showOffset = false
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal"
              onClick={() => onOpenChange(true)}
            >
              <span className={value ? "text-foreground" : "text-muted-foreground"}>
                {value || placeholder}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select {label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {options.map((option) => (
                    <Button
                      key={option.code}
                      variant="ghost"
                      className="w-full justify-between text-left font-normal h-auto py-2"
                      onClick={() => {
                        onValueChange(option.name);
                        onOpenChange(false);
                        onSearchChange('');
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm">{option.name}</span>
                        {showOffset && option.offset && (
                          <span className="text-xs text-muted-foreground">{option.offset}</span>
                        )}
                      </div>
                      {value === option.name && <Check className="h-4 w-4" />}
                    </Button>
                  ))}
                  {options.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No {label.toLowerCase()} found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
        <Globe className="h-5 w-5 text-brandTeal" />
        Location
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SearchableDropdown
          value={country}
          onValueChange={onCountryChange}
          options={filteredCountries}
          placeholder="Select country..."
          searchValue={countrySearch}
          onSearchChange={setCountrySearch}
          open={countryOpen}
          onOpenChange={setCountryOpen}
          icon={<Globe className="h-4 w-4 text-brandTeal" />}
          label="Country"
        />

        <SearchableDropdown
          value={timezone}
          onValueChange={onTimezoneChange}
          options={filteredTimezones}
          placeholder="Select timezone..."
          searchValue={timezoneSearch}
          onSearchChange={setTimezoneSearch}
          open={timezoneOpen}
          onOpenChange={setTimezoneOpen}
          icon={<Clock className="h-4 w-4 text-brandGold" />}
          label="Timezone"
          showOffset={true}
        />
      </div>
    </div>
  );
};

export default LocationSection;
