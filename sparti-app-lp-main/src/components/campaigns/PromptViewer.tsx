import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Check, ChevronDown, ChevronUp, Database, Settings as SettingsIcon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { universalPromptTemplate, promptVariables, getVariablesByCategory } from '@/utils/promptTemplate';

interface PromptViewerProps {
  selectedTopicTitle?: string;
  configuration: {
    brandMentions: string;
    competitorMentions: string;
    internalLinks: string;
    featuredImage: string;
    includeIntro: boolean;
    includeConclusion: boolean;
    includeFAQ: boolean;
  };
}

export function PromptViewer({ selectedTopicTitle, configuration }: PromptViewerProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(universalPromptTemplate);
    setCopied(true);
    toast({
      title: "Prompt Copied",
      description: "The prompt template has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPromptWithHighlighting = () => {
    const lines = universalPromptTemplate.split('\n');
    return lines.map((line, idx) => {
      // Highlight variables
      const parts = line.split(/({{[^}]+}})/g);
      return (
        <div key={idx} className="leading-relaxed">
          {parts.map((part, partIdx) => {
            if (part.match(/{{([^}]+)}}/)) {
              const varName = part.replace(/{{|}}/g, '');
              const variable = promptVariables[varName];
              
              if (variable) {
                return (
                  <TooltipProvider key={partIdx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="secondary" 
                          className="mx-1 cursor-help hover:bg-primary/20 transition-colors font-mono text-xs"
                        >
                          {varName}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <div className="font-semibold">{variable.description}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {variable.source}
                          </div>
                          {variable.example && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Example:</span> {variable.example}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }
              return <span key={partIdx} className="text-primary font-mono">{part}</span>;
            }
            
            // Highlight headings
            if (line.startsWith('# ')) {
              return <span key={partIdx} className="text-xl font-bold text-foreground">{part}</span>;
            }
            if (line.startsWith('## ')) {
              return <span key={partIdx} className="text-lg font-semibold text-foreground">{part}</span>;
            }
            if (line.startsWith('### ')) {
              return <span key={partIdx} className="text-base font-semibold text-foreground">{part}</span>;
            }
            if (line.startsWith('**') && line.endsWith('**')) {
              return <span key={partIdx} className="font-semibold text-foreground">{part}</span>;
            }
            
            return <span key={partIdx} className="text-muted-foreground">{part}</span>;
          })}
        </div>
      );
    });
  };

  const variablesByCategory = getVariablesByCategory();

  return (
    <div className="space-y-4">
      {/* Header with Copy Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">AI Content Generation Prompt</h3>
          <p className="text-sm text-muted-foreground">
            This universal prompt template will be used to generate articles across all industries
          </p>
        </div>
        <Button onClick={handleCopy} variant="outline" size="sm">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Prompt
            </>
          )}
        </Button>
      </div>

      {/* Current Configuration Preview */}
      {selectedTopicTitle && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="font-medium">Selected Topic:</span> {selectedTopicTitle}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Brand Mentions: {configuration.brandMentions}</Badge>
              <Badge variant="outline">Competitor Mentions: {configuration.competitorMentions}</Badge>
              <Badge variant="outline">Internal Links: {configuration.internalLinks}</Badge>
              <Badge variant="outline">Featured Image: {configuration.featuredImage}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {configuration.includeIntro && <Badge variant="secondary">Intro ✓</Badge>}
              {configuration.includeConclusion && <Badge variant="secondary">Conclusion ✓</Badge>}
              {configuration.includeFAQ && <Badge variant="secondary">FAQ ✓</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Sources Visualization */}
      <Collapsible open={showDataSources} onOpenChange={setShowDataSources}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Sources & Variable Mapping
            </span>
            {showDataSources ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(variablesByCategory).map(([category, variables]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {variables.map(varName => {
                        const variable = promptVariables[varName];
                        return (
                          <div 
                            key={varName} 
                            className="p-2 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-xs text-primary truncate">
                                  {varName}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {variable.description}
                                </div>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="shrink-0 cursor-help text-xs">
                                      <Database className="h-3 w-3 mr-1" />
                                      Source
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">{variable.source}</div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Prompt Template Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Prompt Template</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <div className="font-mono text-xs whitespace-pre-wrap p-4 bg-muted/30 rounded-md">
              {renderPromptWithHighlighting()}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">VARIABLE</Badge>
              <span className="text-muted-foreground">Data variable (hover for details)</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Database source</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
