import { Building2, Plus, Settings, ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

interface Brand {
  id: string;
  name: string;
}

interface BrandDropdownProps {
  selectedBrandId?: string;
  onBrandSelect?: (brandId: string) => void;
}

const BrandDropdown = ({ selectedBrandId, onBrandSelect }: BrandDropdownProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
  }, [user]);

  // Sync selected brand with external selectedBrandId prop
  useEffect(() => {
    if (selectedBrandId && brands.length > 0) {
      const brand = brands.find(b => b.id === selectedBrandId);
      if (brand) {
        setSelectedBrand(brand);
      }
    }
  }, [selectedBrandId, brands]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBrand = () => {
    navigate('/app/brands?action=create');
  };

  const handleManageBrands = () => {
    navigate('/app/brands');
  };

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setSearchQuery("");
    
    // Call external handler if provided
    if (onBrandSelect && brand.id) {
      onBrandSelect(brand.id);
    }
  };

  const displayText = selectedBrand ? selectedBrand.name : "All Brands";

  return (
    <div className="px-3 py-3 my-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-3 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground bg-secondary/50 rounded-md border-b border-border"
          >
            <div className="flex items-center min-w-0">
              <span className="truncate text-base font-semibold">
                {displayText}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          side="bottom" 
          align="start"
          className="w-[calc(100%-24px)] bg-background border-border shadow-lg z-50 h-64 ml-3"
        >
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 mb-2"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                Loading brands...
              </div>
            ) : (
              <>
                <DropdownMenuItem 
                  onSelect={() => handleBrandSelect({ id: '', name: 'All Brands' })}
                  className="cursor-pointer mx-2"
                >
                  All Brands
                </DropdownMenuItem>
                
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <DropdownMenuItem
                      key={brand.id}
                      onSelect={() => handleBrandSelect(brand)}
                      className="cursor-pointer mx-2"
                    >
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
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onSelect={handleAddBrand} className="cursor-pointer mx-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </DropdownMenuItem>
            
            <DropdownMenuItem onSelect={handleManageBrands} className="cursor-pointer mx-2">
              <Settings className="h-4 w-4 mr-2" />
              Manage Brands
            </DropdownMenuItem>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BrandDropdown;