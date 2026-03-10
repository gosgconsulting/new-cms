import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FilterSortBarProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  itemCount: number;
}

const FilterSortBar = ({ filtersOpen, setFiltersOpen, itemCount }: FilterSortBarProps) => {
  const [sortBy, setSortBy] = useState("featured");

  const categories = ["Curated Sets", "Ingredients", "Tools", "Essentials", "Recipe Collections"];
  const priceRanges = [
    "Under €20",
    "€20 - €40",
    "€40 - €60",
    "Over €60",
  ];
  const types = ["Chef's Pick", "New Arrival", "Best Seller", "Limited Edition"];

  return (
    <section className="w-full px-6 mb-8 border-b border-border-light pb-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-body font-light text-foreground/70">{itemCount} items</p>

        <div className="flex items-center gap-4">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="font-body font-light hover:bg-transparent hover:text-primary"
              >
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-l border-border-light shadow-none">
              <SheetHeader className="mb-6 border-b border-border-light pb-4">
                <SheetTitle className="text-lg font-heading font-medium">Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-heading font-medium mb-4 text-foreground">Category</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-3">
                        <Checkbox
                          id={category}
                          className="border-border-light data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={category}
                          className="text-sm font-body font-light text-foreground cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="border-border-light" />

                <div>
                  <h3 className="text-sm font-heading font-medium mb-4 text-foreground">Price</h3>
                  <div className="space-y-3">
                    {priceRanges.map((range) => (
                      <div key={range} className="flex items-center space-x-3">
                        <Checkbox
                          id={range}
                          className="border-border-light data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={range}
                          className="text-sm font-body font-light text-foreground cursor-pointer"
                        >
                          {range}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="border-border-light" />

                <div>
                  <h3 className="text-sm font-heading font-medium mb-4 text-foreground">Type</h3>
                  <div className="space-y-3">
                    {types.map((type) => (
                      <div key={type} className="flex items-center space-x-3">
                        <Checkbox
                          id={type}
                          className="border-border-light data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={type}
                          className="text-sm font-body font-light text-foreground cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="border-border-light" />

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    className="w-full bg-primary !text-white hover:bg-primary-hover font-body font-medium rounded-full"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full border-none hover:bg-transparent hover:text-primary font-body font-light text-left justify-start"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-auto border-none bg-transparent text-sm font-body font-light shadow-none rounded-none pr-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="shadow-none border border-border-light rounded-none bg-background">
              <SelectItem
                value="featured"
                className="hover:bg-muted/50 font-body font-light"
              >
                Featured
              </SelectItem>
              <SelectItem
                value="price-low"
                className="hover:bg-muted/50 font-body font-light"
              >
                Price: Low to High
              </SelectItem>
              <SelectItem
                value="price-high"
                className="hover:bg-muted/50 font-body font-light"
              >
                Price: High to Low
              </SelectItem>
              <SelectItem
                value="newest"
                className="hover:bg-muted/50 font-body font-light"
              >
                Newest
              </SelectItem>
              <SelectItem
                value="name"
                className="hover:bg-muted/50 font-body font-light"
              >
                Name A-Z
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
};

export default FilterSortBar;
