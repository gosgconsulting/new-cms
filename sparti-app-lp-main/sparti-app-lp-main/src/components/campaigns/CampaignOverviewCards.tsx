import { Key, FileText, BarChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedCampaign } from '@/types/campaigns';

interface CampaignOverviewCardsProps {
  brandId: string;
  userId: string;
  copilotType: string | null;
  campaigns: UnifiedCampaign[];
  onViewReports: () => void;
  onViewKeywords: () => void;
  onViewTopics: () => void;
}

export const CampaignOverviewCards = ({ 
  brandId, 
  userId, 
  copilotType,
  campaigns,
  onViewReports,
  onViewKeywords,
  onViewTopics
}: CampaignOverviewCardsProps) => {
  // Calculate campaign stats
  const activeCampaigns = campaigns.filter(c => ['to_write', 'in_progress'].includes(c.status || '')).length;
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
  const totalCampaigns = campaigns.length;

  const cards = [
    {
      title: 'Keywords',
      description: 'Manage and track your target keywords for SEO optimization',
      icon: Key,
      stats: [
        { label: 'Tracked', value: '---', color: 'text-primary' }
      ],
      onClick: onViewKeywords,
      gradient: 'from-primary to-accent'
    },
    {
      title: 'Topics',
      description: 'View campaign topics and content strategy overview',
      icon: FileText,
      stats: [
        { label: 'Active Topics', value: activeCampaigns.toString(), color: 'text-orange-600' },
        { label: 'Completed', value: completedCampaigns.toString(), color: 'text-green-600' }
      ],
      onClick: onViewTopics,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Reports',
      description: 'View performance analytics and campaign insights',
      icon: BarChart,
      stats: [
        { label: 'Active', value: activeCampaigns.toString(), color: 'text-primary' },
        { label: 'Total', value: totalCampaigns.toString(), color: 'text-muted-foreground' }
      ],
      onClick: onViewReports,
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Campaign Overview
          </h2>
          <p className="text-muted-foreground">
            Choose an area to manage for your {copilotType?.toUpperCase()} campaigns
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card 
              key={card.title} 
              className="group card-hover-unified card-hover-glow cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={card.onClick}
            >
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-xl bg-gradient-to-br text-white ${card.gradient}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                {/* Stats */}
                <div className="flex gap-4 mb-4">
                  {card.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Indicator */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="group-hover:border-primary/50">
                    Click to manage
                  </Badge>
                  <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};