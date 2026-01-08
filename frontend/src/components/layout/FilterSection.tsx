import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  vehicleCategoryFilter: string;
  onVehicleCategoryFilterChange: (value: string) => void;
  uniqueLocations: string[];
  uniqueVehicleCategories: string[];
  onClearFilters: () => void;
}

export const FilterSection = ({
  searchQuery,
  onSearchChange,
  locationFilter,
  onLocationFilterChange,
  vehicleCategoryFilter,
  onVehicleCategoryFilterChange,
  uniqueLocations,
  uniqueVehicleCategories,
  onClearFilters
}: FilterSectionProps) => {
  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            placeholder="Search transporters..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="rounded-xl h-12"
          />
        </div>
        
        {/* Location Filter */}
        <div className="w-full md:w-48">
          <Select value={locationFilter} onValueChange={onLocationFilterChange}>
            <SelectTrigger className="rounded-xl h-12">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Vehicle Category Filter */}
        <div className="w-full md:w-48">
          <Select value={vehicleCategoryFilter} onValueChange={onVehicleCategoryFilterChange}>
            <SelectTrigger className="rounded-xl h-12">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueVehicleCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Clear Filters Button */}
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="h-12"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};
