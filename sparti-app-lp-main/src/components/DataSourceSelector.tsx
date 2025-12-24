import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Database, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataSourceSelectorProps {
  onSelectSource: (source: 'google_maps' | 'google_search') => void;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ onSelectSource }) => {
  const dataSourceCards = [
    {
      title: "Google Maps Data",
      description: "View and manage business leads scraped from Google Maps searches with comprehensive contact details and business insights",
      icon: MapPin,
      source: 'google_maps' as const,
      features: ["Business Contact Information", "Customer Reviews & Ratings", "Location & Address Data", "Operating Hours & Status"],
      gradient: "from-primary to-accent"
    },
    {
      title: "Google Search Data", 
      description: "Access and analyze search results scraped from Google Search queries with detailed SERP insights and keyword data",
      icon: Search,
      source: 'google_search' as const,
      features: ["Organic Search Results", "Featured Snippets & PAA", "SERP Analysis Data", "Keyword Performance"],
      gradient: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Data Source Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
        {dataSourceCards.map((dataSource) => (
          <Card key={dataSource.title} className="group card-hover-unified card-hover-glow card-hover-gradient">
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br text-white",
                  dataSource.gradient
                )}>
                  <dataSource.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">{dataSource.title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {dataSource.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Data Insights
                </h4>
                <ul className="space-y-1">
                  {dataSource.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full group-hover:shadow-lg transition-shadow"
                  onClick={() => onSelectSource(dataSource.source)}
                >
                  View Data
                  <Database className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onSelectSource(dataSource.source)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};