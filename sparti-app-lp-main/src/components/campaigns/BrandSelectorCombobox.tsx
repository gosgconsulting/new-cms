import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Brand {
  id: string;
  name: string;
  website?: string;
}

interface BrandSelectorComboboxProps {
  value?: string;
  onValueChange: (brandId: string, brandName: string) => void;
  userId: string;
  disabled?: boolean;
}

export function BrandSelectorCombobox({
  value,
  onValueChange,
  userId,
  disabled = false,
}: BrandSelectorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedBrand = brands.find((brand) => brand.id === value);

  useEffect(() => {
    if (userId) {
      fetchBrands();
    }
  }, [userId]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, website')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;

      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    // Check if brand already exists
    const existingBrand = brands.find(
      (b) => b.name.toLowerCase() === searchValue.toLowerCase()
    );

    if (existingBrand) {
      onValueChange(existingBrand.id, existingBrand.name);
      setOpen(false);
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert({
          name: searchValue.trim(),
          user_id: userId,
          copilot_type: 'seo',
        })
        .select()
        .single();

      if (error) throw error;

      setBrands([...brands, data]);
      onValueChange(data.id, data.name);
      toast.success(`Brand "${data.name}" created successfully`);
      setOpen(false);
      setSearchValue('');
    } catch (error: any) {
      console.error('Error creating brand:', error);
      toast.error(error.message || 'Failed to create brand');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption = searchValue.trim() && filteredBrands.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
          disabled={disabled}
        >
          {selectedBrand ? (
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {selectedBrand.name}
            </span>
          ) : (
            <span className="text-muted-foreground">Click to search or type to create brand...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover z-50" align="start">
        <Command className="bg-popover">
          <CommandInput
            placeholder="Search or type to create..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredBrands.length === 0 && !loading && searchValue.trim() ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">No brands found.</p>
                <Button
                  onClick={handleCreateBrand}
                  disabled={isCreating}
                  size="sm"
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Brand
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {loading ? 'Loading brands...' : 'No brands found.'}
                </CommandEmpty>
                <CommandGroup>
                  {filteredBrands.map((brand) => (
                    <CommandItem
                      key={brand.id}
                      value={brand.name}
                      onSelect={() => {
                        onValueChange(brand.id, brand.name);
                        setOpen(false);
                        setSearchValue('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === brand.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <Building2 className="mr-2 h-4 w-4" />
                      {brand.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
