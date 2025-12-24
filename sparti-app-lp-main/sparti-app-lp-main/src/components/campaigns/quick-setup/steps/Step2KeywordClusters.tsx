import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Loader2, CheckCircle2, X, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import UseTrackedKeywordsModal from '@/components/campaigns/UseTrackedKeywordsModal';

interface KeywordCluster {
  cluster_name: string;
  keywords: string[];
  intent: string;
}

export const Step2KeywordClusters = () => {
  const { sessionData, updateSessionData } = useQuickSetup();
  const [isGenerating, setIsGenerating] = useState(false);
  const [clusters, setClusters] = useState<KeywordCluster[]>(sessionData.clusters || []);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    sessionData.selected_cluster?.cluster_name || null
  );
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [trackedKeywordsModalOpen, setTrackedKeywordsModalOpen] = useState(false);

  // Clusters should already be generated in Step 1
  // This component just displays them for selection
  useEffect(() => {
    // If clusters are already in session data, use them
    if (sessionData.clusters && sessionData.clusters.length > 0) {
      setClusters(sessionData.clusters);
      setIsGenerating(false);
    } else if (sessionData.keywords && sessionData.keywords.length > 0) {
      // Fallback: generate clusters if they weren't generated in Step 1
      setIsGenerating(true);
      const generateClusters = async () => {
        try {
          const { data: clusterData, error: clusterError } = await supabase.functions.invoke(
            'quick-setup-keyword-clustering',
            {
              body: {
                keywords: sessionData.keywords,
                objective: sessionData.seo_objective
              }
            }
          );

          if (clusterError) {
            console.error('Clustering error:', clusterError);
            toast.error('Failed to load keyword clusters. Please try again.');
            return;
          }

          const generatedClusters = clusterData.clusters || [];
          setClusters(generatedClusters);
          updateSessionData({ clusters: generatedClusters });
        } catch (error) {
          console.error('Error generating clusters:', error);
          toast.error('Failed to load keyword clusters');
        } finally {
          setIsGenerating(false);
        }
      };

      generateClusters();
    } else {
      setIsGenerating(false);
    }
  }, []);

  const handleClusterSelect = (clusterName: string) => {
    const cluster = clusters.find(c => c.cluster_name === clusterName);
    if (cluster) {
      setSelectedClusterId(clusterName);
      updateSessionData({ 
        selected_cluster: cluster,
        keywords: cluster.keywords // Update keywords to only selected cluster keywords
      });
    }
  };

  const handleDeleteKeyword = (clusterName: string, keywordToDelete: string) => {
    const updatedClusters = clusters.map(cluster => {
      if (cluster.cluster_name === clusterName) {
        const updatedKeywords = cluster.keywords.filter(k => k !== keywordToDelete);
        if (updatedKeywords.length === 0) {
          toast.error('Cannot delete the last keyword in a cluster');
          return cluster;
        }
        return { ...cluster, keywords: updatedKeywords };
      }
      return cluster;
    });

    setClusters(updatedClusters);
    updateSessionData({ clusters: updatedClusters });

    // Update selected cluster if it was modified
    if (selectedClusterId === clusterName) {
      const updatedCluster = updatedClusters.find(c => c.cluster_name === clusterName);
      if (updatedCluster) {
        updateSessionData({ 
          selected_cluster: updatedCluster,
          keywords: updatedCluster.keywords
        });
      }
    }
  };

  const handleAddKeywordManually = () => {
    if (!selectedClusterId) {
      toast.error('Please select a cluster first');
      return;
    }

    if (!newKeyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    // Validate keyword length
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword.length > 100) {
      toast.error('Keyword must be less than 100 characters');
      return;
    }

    const selectedCluster = clusters.find(c => c.cluster_name === selectedClusterId);
    if (!selectedCluster) return;

    // Check if keyword already exists in cluster
    if (selectedCluster.keywords.some(k => k.toLowerCase() === trimmedKeyword.toLowerCase())) {
      toast.error('This keyword already exists in the cluster');
      return;
    }

    const updatedClusters = clusters.map(cluster => {
      if (cluster.cluster_name === selectedClusterId) {
        return {
          ...cluster,
          keywords: [...cluster.keywords, trimmedKeyword]
        };
      }
      return cluster;
    });

    setClusters(updatedClusters);
    updateSessionData({ clusters: updatedClusters });

    // Update selected cluster
    const updatedCluster = updatedClusters.find(c => c.cluster_name === selectedClusterId);
    if (updatedCluster) {
      updateSessionData({
        selected_cluster: updatedCluster,
        keywords: updatedCluster.keywords
      });
    }

    setNewKeyword('');
    setIsAddingKeyword(false);
    toast.success('Keyword added successfully');
  };

  const handleOpenCustomCluster = () => {
    setTrackedKeywordsModalOpen(true);
  };

  const handleCustomClusterKeywordsChange = (keywords: string[]) => {
    if (keywords.length === 0) {
      return;
    }

    // Create a custom cluster with the selected keywords
    const customCluster: KeywordCluster = {
      cluster_name: 'Custom Keywords Cluster',
      keywords: keywords,
      intent: 'mixed'
    };

    // Check if custom cluster already exists and update it, or add new one
    const existingCustomIndex = clusters.findIndex(c => c.cluster_name === 'Custom Keywords Cluster');
    let updatedClusters: KeywordCluster[];
    
    if (existingCustomIndex >= 0) {
      updatedClusters = clusters.map((c, idx) => 
        idx === existingCustomIndex ? customCluster : c
      );
    } else {
      updatedClusters = [...clusters, customCluster];
    }

    setClusters(updatedClusters);
    updateSessionData({ 
      clusters: updatedClusters,
      selected_cluster: customCluster,
      keywords: customCluster.keywords
    });
    setSelectedClusterId(customCluster.cluster_name);
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Keywords</h3>
          <p className="text-muted-foreground">
            Grouping {sessionData.keywords?.length || 0} keywords into clusters...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Select a keywords cluster</h2>
        <p className="text-muted-foreground">
          We identified {clusters.length} keyword clusters. Click to select one.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Badge
          variant="outline"
          className="cursor-pointer px-4 py-2 text-sm transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={handleOpenCustomCluster}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Custom Keywords Cluster
          </span>
        </Badge>
        
        {clusters.map((cluster, index) => {
          const isSelected = selectedClusterId === cluster.cluster_name;
          
          return (
            <Badge
              key={index}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:bg-accent'
              }`}
              onClick={() => handleClusterSelect(cluster.cluster_name)}
            >
              <span className="flex items-center gap-2">
                {cluster.cluster_name}
                {isSelected && <CheckCircle2 className="h-4 w-4" />}
              </span>
            </Badge>
          );
        })}
      </div>

      {selectedClusterId && (
        <Card className="mt-6">
          <CardContent className="p-6">
            {clusters.map((cluster, index) => {
              if (cluster.cluster_name !== selectedClusterId) return null;
              
              return (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{cluster.cluster_name}</h3>
                    <Badge variant="outline" className="capitalize">
                      {cluster.intent}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        {cluster.keywords.length} keywords in this cluster
                      </p>
                      {!isAddingKeyword ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsAddingKeyword(true)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Keyword
                        </Button>
                      ) : null}
                    </div>

                    {isAddingKeyword && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter keyword..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddKeywordManually();
                              }
                            }}
                            maxLength={100}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleAddKeywordManually}
                            disabled={!newKeyword.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIsAddingKeyword(false);
                              setNewKeyword('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {cluster.keywords.map((keyword, kidx) => (
                        <Badge 
                          key={kidx} 
                          variant="secondary" 
                          className="text-xs group relative pr-7"
                        >
                          {keyword}
                          <button
                            onClick={() => handleDeleteKeyword(cluster.cluster_name, keyword)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 rounded-full p-0.5"
                            aria-label="Remove keyword"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Custom Keywords Cluster Modal */}
      <UseTrackedKeywordsModal
        open={trackedKeywordsModalOpen}
        onOpenChange={setTrackedKeywordsModalOpen}
        brandId={sessionData.brand_id || ''}
        onKeywordSelected={(keyword) => {
          // Not used - we use onKeywordsChange instead
        }}
        currentKeywords={[]}
        allAvailableKeywords={[]}
        onKeywordsChange={handleCustomClusterKeywordsChange}
      />
    </div>
  );
};
