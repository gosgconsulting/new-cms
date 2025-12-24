import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Campaign } from '@/types/campaigns';
import { getStatusColor, getStatusLabel, formatDate } from './utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CampaignTopicsModal from '@/components/CampaignTopicsModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

interface SeoCampaignsTableProps {
  campaigns: Campaign[];
}

export const SeoCampaignsTable = ({ campaigns }: SeoCampaignsTableProps) => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };


  const getArticleCount = (campaign: Campaign) => {
    if (campaign.search_criteria?.posts) {
      return campaign.search_criteria.posts.length;
    }
    // Fallback to number_of_articles from search_criteria (for SEO type)
    if (campaign.search_criteria?.number_of_articles) {
      return campaign.search_criteria.number_of_articles;
    }
    return campaign.number_of_articles || 0;
  };

  const getUniqueUrls = (campaign: Campaign) => {
    // Collect unique URLs (cms_url or slug) from posts if available
    if (campaign.search_criteria?.posts) {
      const urls = new Set<string>();
      campaign.search_criteria.posts.forEach((post: any) => {
        const url = post.cms_url || post.slug;
        if (url) urls.add(url);
      });
      return Array.from(urls);
    }
    return [] as string[];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>SEO Campaigns</CardTitle>
          <CardDescription>SEO campaigns organized by creation date</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow 
                  key={campaign.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => handleRowClick(campaign)}
                >
                  <TableCell>
                    <div className="font-medium">
                      {formatDate(campaign.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getArticleCount(campaign)}</span>
                      <span className="text-muted-foreground text-sm">articles</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {(campaign.keywords || []).slice(0, 5).map((kw, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {kw.length > 28 ? `${kw.slice(0, 28)}…` : kw}
                        </Badge>
                      ))}
                      {(campaign.keywords || []).length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{(campaign.keywords || []).length - 5} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.status === 'failed' && campaign.error_message ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="destructive" className={getStatusColor(campaign.status)}>
                              {getStatusLabel(campaign.status)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{campaign.error_message}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCampaign && (
        <CampaignTopicsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          brandId={selectedCampaign.brand_id || ''}
          campaignDate={selectedCampaign.created_at}
          topicsCount={getArticleCount(selectedCampaign)}
          campaignId={selectedCampaign.id}
        />
      )}
    </>
  );
};
