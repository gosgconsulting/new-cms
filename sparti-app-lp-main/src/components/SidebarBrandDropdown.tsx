import { Building2, Settings, ChevronDown, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCopilot } from "@/contexts/CopilotContext";
import { Brand } from "@/types/campaigns";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

// Query function for fetching brands with copilot type filter
const fetchBrands = async (userId: string, copilotType?: string | null): Promise<Brand[]> => {
  let query = supabase
    .from('brands')
    .select('id, name, description, logo_url, industry, created_at, copilot_type')
    .eq('user_id', userId);
  
  // SEO Copilot uses main brand database (no filtering)
  // Other copilots filter by copilot_type
  if (copilotType && copilotType !== 'seo') {
    // Include both matching copilot_type and NULL (legacy brands)
    query = query.or(`copilot_type.eq.${copilotType},copilot_type.is.null`);
  }
  
  query = query.order('name');

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const SidebarBrandDropdown = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { selectedBrand, setSelectedBrand, selectedCopilot, setSelectedCopilot, isLaunched, setIsLaunched } = useCopilot();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // React Query for fetching brands filtered by copilot type
  const { data: brands = [], isLoading: loading, error } = useQuery({
    queryKey: ['brands', user?.id, selectedCopilot?.copilotType],
    queryFn: () => fetchBrands(user!.id, selectedCopilot?.copilotType),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Handle query error
  useEffect(() => {
    if (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to load brands. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManageBrands = () => {
    navigate('/app/brands');
  };

  const handleBrandSelect = (brand: Brand) => {
    console.log('[testing] Switching to brand:', brand.name, brand.id);
    setSelectedBrand(brand);
    setSearchQuery("");
    
    // Update URL query parameter with brand ID
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('brand', brand.id);
    setSearchParams(newSearchParams);
    
    // Keep copilot selected and update menu items with new brand
    if (isLaunched && selectedCopilot) {
      const updatedMenuItems = selectedCopilot.baseMenuItems.map(item => ({
        ...item,
        path: `${item.path}?brand=${brand.id}`
      }));
      
      setSelectedCopilot({
        ...selectedCopilot,
        menuItems: updatedMenuItems
      });
      
      toast({
        title: "Brand Switched",
        description: `Switched to ${brand.name}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Brand Selected",
        description: `${brand.name} is now selected.`,
        variant: "default",
      });
    }
  };

  const displayText = selectedBrand ? selectedBrand.name : "Brands";

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-2 px-3 text-left hover:bg-accent hover:text-accent-foreground border border-border/50 rounded-md"
        >
          <div className="flex items-center min-w-0 gap-2">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm">
              {displayText}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        side="right" 
        align="start"
        className="w-64 bg-background border-border shadow-lg z-50 max-h-80"
      >
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        
        <ScrollArea className="h-48">
          {loading ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              Loading brands...
            </div>
          ) : (
            <>
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <DropdownMenuItem
                    key={brand.id}
                    onSelect={() => handleBrandSelect(brand)}
                    className="cursor-pointer"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    {brand.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                  {searchQuery ? 'No brands found' : 'No brands created yet'}
                </div>
              )}
            </>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={handleManageBrands} className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Manage
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarBrandDropdown;