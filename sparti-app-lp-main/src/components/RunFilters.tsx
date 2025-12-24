import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterState {
  status: string;
  runType: string;
  dateRange: string;
}

interface RunFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  totalRuns: number;
  filteredCount: number;
}

export const RunFilters: React.FC<RunFiltersProps> = ({
  filters,
  onFilterChange,
  totalRuns,
  filteredCount
}) => {
  const resetFilters = () => {
    onFilterChange({
      status: 'all',
      runType: 'all',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.runType !== 'all' || filters.dateRange !== 'all';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-6 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalRuns} runs
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => onFilterChange({ status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Run Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Run Type</label>
            <Select value={filters.runType} onValueChange={(value) => onFilterChange({ runType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="google_maps">Google Maps</SelectItem>
                <SelectItem value="google_search">Google Search</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select value={filters.dateRange} onValueChange={(value) => onFilterChange({ dateRange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.status !== 'all' && (
              <Badge variant="secondary">
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => onFilterChange({ status: 'all' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.runType !== 'all' && (
              <Badge variant="secondary">
                Type: {filters.runType === 'google_maps' ? 'Google Maps' : 'Google Search'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => onFilterChange({ runType: 'all' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.dateRange !== 'all' && (
              <Badge variant="secondary">
                Date: {filters.dateRange}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => onFilterChange({ dateRange: 'all' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};