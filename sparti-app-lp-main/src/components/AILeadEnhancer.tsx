import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Search, Brain, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { BusinessLead } from '@/types/leadGeneration';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

interface AILeadEnhancerProps {
  leads: BusinessLead[];
  onEnhancedLeads: (enhancedLeads: BusinessLead[]) => void;
  className?: string;
  selectedBrand?: Brand;
}

interface AIEnhancementRequest {
  query: string;
  enhancementType: 'qualify' | 'score' | 'filter' | 'analyze';
  criteria?: string;
}

const AILeadEnhancer: React.FC<AILeadEnhancerProps> = ({
  leads,
  onEnhancedLeads,
  className = "",
  selectedBrand
}) => {
  const [query, setQuery] = useState('');
  const [enhancementType, setEnhancementType] = useState<'qualify' | 'score' | 'filter' | 'analyze'>('filter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastEnhancement, setLastEnhancement] = useState<string>('');

  const enhancementTypes = [
    {
      value: 'filter',
      label: 'Smart Filter',
      description: 'Filter leads using natural language',
      icon: Search,
      examples: [
        'Show me restaurants with poor online reviews',
        'Find businesses without websites in retail',
        'High-rated cafes with no social media presence'
      ]
    },
    {
      value: 'qualify',
      label: 'Lead Qualification',
      description: 'Assess lead quality and potential',
      icon: Target,
      examples: [
        'Which leads are most likely to need web development?',
        'Find businesses ready for digital marketing services',
        'Identify high-value prospects for consulting'
      ]
    },
    {
      value: 'score',
      label: 'AI Scoring',
      description: 'Generate intelligent lead scores',
      icon: TrendingUp,
      examples: [
        'Score leads for restaurant delivery app potential',
        'Rate businesses for marketing agency services',
        'Prioritize leads for immediate sales outreach'
      ]
    },
    {
      value: 'analyze',
      label: 'Market Analysis',
      description: 'Analyze market opportunities and trends',
      icon: Brain,
      examples: [
        'What market gaps exist in this area?',
        'Analyze competitor strengths and weaknesses',
        'Identify underserved business categories'
      ]
    }
  ];

  const currentType = enhancementTypes.find(t => t.value === enhancementType);

  const processAIEnhancement = async (request: AIEnhancementRequest) => {
    setIsProcessing(true);
    setLastEnhancement(request.query);

    try {
      // Call Supabase Edge Function for AI processing
      const { data, error } = await supabase.functions.invoke('ai-lead-enhancement', {
        body: {
          leads: leads,
          query: request.query,
          enhancementType: request.enhancementType
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'AI enhancement failed');
      }

      let enhancedLeads = [...leads];

      // Process AI results based on enhancement type
      switch (request.enhancementType) {
        case 'filter':
          if (Array.isArray(data.result)) {
            enhancedLeads = leads.filter(lead => data.result.includes(lead.id));
            toast.success(`AI Filter Applied: ${enhancedLeads.length} leads match "${request.query}"`);
          }
          break;

        case 'qualify':
          enhancedLeads = leads.map(lead => {
            const qualification = data.result[lead.id];
            if (qualification) {
              return {
                ...lead,
                leadScore: qualification.score,
                aiQualification: {
                  score: qualification.score,
                  reasoning: qualification.reasoning,
                  opportunities: qualification.opportunities || [],
                  priority: qualification.priority || 'medium'
                }
              };
            }
            return lead;
          });
          toast.success(`AI Qualification Complete: ${Object.keys(data.result).length} leads qualified`);
          break;

        case 'score':
          enhancedLeads = leads.map(lead => {
            const scoring = data.result[lead.id];
            if (scoring) {
              return {
                ...lead,
                leadScore: scoring.overall_score,
                aiScoring: {
                  overall_score: scoring.overall_score,
                  factors: scoring.factors || {},
                  opportunities: scoring.opportunities || [],
                  next_actions: scoring.next_actions || [],
                  lastUpdated: new Date().toISOString()
                }
              };
            }
            return lead;
          });
          toast.success(`AI Scoring Complete: ${Object.keys(data.result).length} leads scored`);
          break;

        case 'analyze':
          // For analysis, show insights in toast and don't modify leads
          const insights = data.result;
          toast.success(`Market Analysis Complete`, {
            description: `${insights.key_opportunities?.length || 0} opportunities identified • ${insights.digital_gaps?.length || 0} digital gaps found`,
            duration: 8000
          });
          
          // Could also store analysis results in state for display
          console.log('Market Analysis Results:', insights);
          enhancedLeads = leads; // No lead modification for analysis
          break;
      }

      onEnhancedLeads(enhancedLeads);
      
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      if (error.message?.includes('OpenAI API key not configured')) {
        toast.error('AI Enhancement requires OpenAI API key configuration');
      } else {
        toast.error(`AI enhancement failed: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateSmartFilter = (allLeads: BusinessLead[], query: string): BusinessLead[] => {
    const lowerQuery = query.toLowerCase();
    
    // Smart filtering based on natural language patterns
    if (lowerQuery.includes('no website') || lowerQuery.includes('without website')) {
      return allLeads.filter(lead => !lead.website && !lead.contactInfo?.website);
    }
    
    if (lowerQuery.includes('poor review') || lowerQuery.includes('low rating')) {
      return allLeads.filter(lead => !lead.rating || lead.rating < 3.5);
    }
    
    if (lowerQuery.includes('no social media') || lowerQuery.includes('social media')) {
      return allLeads.filter(lead => 
        !lead.social_media?.facebook && 
        !lead.social_media?.instagram && 
        !lead.social_media?.twitter
      );
    }
    
    if (lowerQuery.includes('restaurant') || lowerQuery.includes('food')) {
      return allLeads.filter(lead => 
        lead.category?.toLowerCase().includes('restaurant') ||
        lead.category?.toLowerCase().includes('food') ||
        lead.name.toLowerCase().includes('restaurant')
      );
    }
    
    if (lowerQuery.includes('high-rated') || lowerQuery.includes('good rating')) {
      return allLeads.filter(lead => lead.rating && lead.rating >= 4.0);
    }
    
    // Default: return all leads if no pattern matches
    return allLeads;
  };

  const simulateLeadQualification = (allLeads: BusinessLead[], query: string): BusinessLead[] => {
    return allLeads.map(lead => {
      let qualificationScore = 50; // Base score
      
      // Qualification scoring logic
      if (lead.website || lead.contactInfo?.website) qualificationScore += 20;
      if (lead.rating && lead.rating >= 4.0) qualificationScore += 15;
      if (lead.reviews_count && lead.reviews_count >= 20) qualificationScore += 10;
      if (lead.phone || lead.contactInfo?.phone) qualificationScore += 15;
      if (lead.email || lead.contactInfo?.email) qualificationScore += 10;
      
      // Qualification tags based on query intent
      const qualificationTags = [];
      if (query.toLowerCase().includes('web development')) {
        if (!lead.website) qualificationTags.push('web-development-prospect');
      }
      if (query.toLowerCase().includes('marketing')) {
        if (!lead.social_media?.facebook) qualificationTags.push('social-media-prospect');
      }
      
      return {
        ...lead,
        leadScore: Math.min(qualificationScore, 100),
        aiQualification: {
          score: qualificationScore,
          tags: qualificationTags,
          reasoning: `AI-qualified based on: ${query}`
        }
      };
    });
  };

  const simulateAIScoring = (allLeads: BusinessLead[], query: string): BusinessLead[] => {
    return allLeads.map(lead => {
      // Multi-factor AI scoring
      let aiScore = 0;
      const factors = [];
      
      // Digital presence factor (30%)
      if (lead.website || lead.contactInfo?.website) {
        aiScore += 30;
        factors.push('Strong digital presence');
      } else {
        factors.push('Opportunity: No website');
      }
      
      // Reputation factor (25%)
      if (lead.rating && lead.rating >= 4.0) {
        aiScore += 25;
        factors.push('Excellent reputation');
      } else if (lead.rating && lead.rating >= 3.0) {
        aiScore += 15;
        factors.push('Good reputation');
      } else {
        factors.push('Opportunity: Reputation management');
      }
      
      // Contact accessibility (20%)
      const contactMethods = [
        lead.phone || lead.contactInfo?.phone,
        lead.email || lead.contactInfo?.email,
        lead.website || lead.contactInfo?.website
      ].filter(Boolean).length;
      
      aiScore += contactMethods * 7;
      factors.push(`${contactMethods} contact methods available`);
      
      // Business activity (15%)
      if (lead.reviews_count && lead.reviews_count >= 50) {
        aiScore += 15;
        factors.push('High customer engagement');
      } else if (lead.reviews_count && lead.reviews_count >= 10) {
        aiScore += 10;
        factors.push('Moderate customer engagement');
      }
      
      // Social media presence (10%)
      const socialChannels = [
        lead.social_media?.facebook,
        lead.social_media?.instagram,
        lead.social_media?.twitter
      ].filter(Boolean).length;
      
      aiScore += socialChannels * 3;
      if (socialChannels > 0) {
        factors.push(`Active on ${socialChannels} social platform(s)`);
      }
      
      return {
        ...lead,
        leadScore: Math.min(aiScore, 100),
        aiScoring: {
          score: aiScore,
          factors: factors,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  };

  const simulateMarketAnalysis = (allLeads: BusinessLead[], query: string) => {
    // Generate market insights
    const insights = [
      `Analyzed ${allLeads.length} businesses in the target market`,
      `${allLeads.filter(l => !l.website).length} businesses lack websites (${Math.round((allLeads.filter(l => !l.website).length / allLeads.length) * 100)}%)`,
      `Average rating: ${(allLeads.reduce((sum, l) => sum + (l.rating || 0), 0) / allLeads.length).toFixed(1)}`,
      `Top opportunity: Web development services`,
      `Secondary opportunity: Reputation management`
    ];
    
    toast.success(`Market Analysis Complete`, {
      description: insights.join(' • ')
    });
  };

  const handleEnhancement = () => {
    if (!query.trim()) {
      toast.error('Please enter your AI enhancement request');
      return;
    }

    processAIEnhancement({
      query: query.trim(),
      enhancementType,
      criteria: query
    });
  };

  const useExample = (example: string) => {
    setQuery(example);
  };

  return (
    <Card className={`glass border-primary/20 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Lead Enhancement
          {lastEnhancement && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Last: {enhancementType}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enhancement Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Enhancement Type</label>
          <Select value={enhancementType} onValueChange={(value: any) => setEnhancementType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {enhancementTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Query Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Natural Language Request
          </label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask AI to ${currentType?.description.toLowerCase()}...`}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Example Queries */}
        {currentType && (
          <div>
            <label className="text-sm font-medium mb-2 block">Example Queries:</label>
            <div className="space-y-1">
              {currentType.examples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => useExample(example)}
                  className="h-auto p-2 text-left justify-start text-xs w-full"
                >
                  <AlertCircle className="h-3 w-3 mr-2 text-muted-foreground flex-shrink-0" />
                  {example}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Enhancement Button */}
        <Button
          onClick={handleEnhancement}
          disabled={!query.trim() || isProcessing}
          className="w-full gap-2"
          variant="neon"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing AI Enhancement...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enhance with AI
            </>
          )}
        </Button>

        {/* Last Enhancement Info */}
        {lastEnhancement && !isProcessing && (
          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded border">
            <strong>Last Enhancement:</strong> {lastEnhancement}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AILeadEnhancer;