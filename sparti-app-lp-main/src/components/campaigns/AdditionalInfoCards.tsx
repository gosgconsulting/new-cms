import { Link2, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdditionalInfoCardsProps {
  brandId: string;
  userId: string;
  onViewLinks: () => void;
  onViewCompetitors: () => void;
}

export const AdditionalInfoCards = ({ 
  brandId, 
  userId, 
  onViewLinks,
  onViewCompetitors
}: AdditionalInfoCardsProps) => {
  const cards = [
    {
      title: 'Links',
      description: 'Scan websites and manage links with keyword focus tracking',
      icon: Link2,
      stats: [
        { label: 'Tracked Links', value: '---', color: 'text-primary' }
      ],
      onClick: onViewLinks,
      gradient: 'from-primary to-accent'
    },
    {
      title: 'Competitors',
      description: 'Track and analyze competitors with URL and keyword data',
      icon: Users,
      stats: [
        { label: 'Competitors', value: '---', color: 'text-purple-600' }
      ],
      onClick: onViewCompetitors,
      gradient: 'from-purple-500 to-violet-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Additional Information
        </h3>
        <p className="text-muted-foreground">
          Manage links and competitor analysis for comprehensive SEO strategy
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};