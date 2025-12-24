import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Globe, Star, Phone, Mail } from 'lucide-react';
import { BusinessLead } from '@/types/leadGeneration';

interface BusinessOpportunityIndicatorsProps {
  lead: BusinessLead;
  className?: string;
}

const BusinessOpportunityIndicators: React.FC<BusinessOpportunityIndicatorsProps> = ({ 
  lead, 
  className = "" 
}) => {
  const opportunities = [];
  const strengths = [];

  // Identify opportunities (missing or weak elements)
  if (!lead.website && !lead.contactInfo?.website) {
    opportunities.push({ 
      type: 'no-website', 
      label: 'No Website', 
      icon: Globe, 
      severity: 'high',
      description: 'Web development opportunity' 
    });
  }

  if (!lead.rating || lead.rating < 3.5) {
    opportunities.push({ 
      type: 'poor-reviews', 
      label: 'Low Rating', 
      icon: Star, 
      severity: 'medium',
      description: 'Reputation management opportunity' 
    });
  }

  if ((!lead.reviews_count || lead.reviews_count < 10)) {
    opportunities.push({ 
      type: 'few-reviews', 
      label: 'Few Reviews', 
      icon: Star, 
      severity: 'medium',
      description: 'Review generation opportunity' 
    });
  }

  if (!lead.phone && !lead.contactInfo?.phone) {
    opportunities.push({ 
      type: 'no-phone', 
      label: 'No Phone', 
      icon: Phone, 
      severity: 'low',
      description: 'Contact optimization needed' 
    });
  }

  if (!lead.email && !lead.contactInfo?.email) {
    opportunities.push({ 
      type: 'no-email', 
      label: 'No Email', 
      icon: Mail, 
      severity: 'low',
      description: 'Email marketing opportunity' 
    });
  }

  const hasLimitedSocialMedia = !lead.social_media?.facebook && 
                                !lead.social_media?.instagram && 
                                !lead.social_media?.twitter;
  if (hasLimitedSocialMedia) {
    opportunities.push({ 
      type: 'no-social', 
      label: 'No Social Media', 
      icon: Globe, 
      severity: 'medium',
      description: 'Social media marketing opportunity' 
    });
  }

  // Identify strengths
  if (lead.rating && lead.rating >= 4.0) {
    strengths.push({ type: 'good-rating', label: 'Good Rating', icon: Star });
  }

  if (lead.reviews_count && lead.reviews_count >= 50) {
    strengths.push({ type: 'many-reviews', label: 'Popular', icon: Star });
  }

  if (lead.website || lead.contactInfo?.website) {
    strengths.push({ type: 'has-website', label: 'Has Website', icon: Globe });
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-lead-orange/20 text-lead-orange border-lead-orange/30';
      case 'low': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Opportunities */}
      {opportunities.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Opportunities:</div>
          <div className="flex gap-1 flex-wrap">
            {opportunities.slice(0, 3).map((opp, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`text-xs ${getSeverityColor(opp.severity)}`}
                title={opp.description}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {opp.label}
              </Badge>
            ))}
            {opportunities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{opportunities.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Strengths:</div>
          <div className="flex gap-1 flex-wrap">
            {strengths.slice(0, 2).map((strength, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-opportunity-green/20 text-opportunity-green border-opportunity-green/30"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {strength.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Lead Quality Score */}
      {lead.leadScore && (
        <div className="pt-1 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Lead Quality:</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                lead.leadScore >= 80 ? 'bg-opportunity-green/20 text-opportunity-green border-opportunity-green/30' :
                lead.leadScore >= 60 ? 'bg-primary/20 text-primary border-primary/30' :
                lead.leadScore >= 40 ? 'bg-lead-orange/20 text-lead-orange border-lead-orange/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {lead.leadScore}% Match
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOpportunityIndicators;