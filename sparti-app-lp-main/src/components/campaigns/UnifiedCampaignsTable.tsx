// @ts-nocheck
import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { UnifiedCampaign } from '@/types/campaigns'
import { getStatusColor, getStatusLabel, formatDate } from './utils'
import CampaignTopicsModal from '@/components/CampaignTopicsModal'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface UnifiedCampaignsTableProps {
  campaigns: UnifiedCampaign[]
  copilotType?: string | null
  brandId?: string
  userId?: string
}

export const UnifiedCampaignsTable = ({ campaigns, copilotType, brandId, userId }: UnifiedCampaignsTableProps) => {
  const isSEO = (copilotType || '').toLowerCase() === 'seo'
  const queryClient = useQueryClient()

  const [selectedCampaign, setSelectedCampaign] = useState<UnifiedCampaign | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [generatingCampaignId, setGeneratingCampaignId] = useState<string | null>(null)
  

  const { data: trackedCount = 0 } = useQuery<number>({
    queryKey: ['tracked-keywords-count', brandId, userId],
    enabled: !!brandId && isSEO,
    queryFn: async () => {
      let query = supabase
        .from('seo_tracked_keywords')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId!)
      if (userId) {
        query = query.eq('user_id', userId)
      }
      const { count, error } = await query
      if (error) throw error
      return count || 0
    }
  })


  const generateArticlesMutation = useMutation({
    mutationFn: async ({ campaignId, titles }: { campaignId: string; titles: string[] }) => {
      setGeneratingCampaignId(campaignId)
      const { data, error } = await supabase.functions.invoke('seo-bulk-article-generator', {
        body: {
          action: 'generate_articles',
          campaignId: campaignId,
          selectedTitles: titles
        }
      })
      if (error) throw error
      return { data, campaignId }
    },
    onSuccess: (result) => {
      toast.success('Article generation started.')
      queryClient.invalidateQueries({ queryKey: ['campaigns-unified', brandId] })
    },
    onError: (error: any) => {
      console.error('Error generating articles:', error)
      toast.error(`Failed to generate articles: ${error.message}`)
    },
    onSettled: () => {
      setGeneratingCampaignId(null)
    }
  })


  const handleRowClick = (campaign: UnifiedCampaign) => {
    if (isSEO) {
      setSelectedCampaign(campaign)
      setIsModalOpen(true)
    }
  }

  const tableRows = useMemo(() => campaigns, [campaigns])

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                {isSEO ? 'SEO campaigns by creation date' : 'Campaigns by creation date'}
              </CardDescription>
            </div>
            {isSEO && typeof trackedCount === 'number' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.getElementById('tracked-keywords')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                title="View tracked keywords for this brand"
              >
                Tracked Keywords: <span className="ml-1 font-medium">{trackedCount}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                {isSEO && <TableHead>Articles</TableHead>}
                <TableHead>Keywords</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSEO ? 4 : 3} className="text-muted-foreground">
                    No campaigns yet
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((campaign) => {
                  const isGenerating = generatingCampaignId === campaign.id

                  return (
                    <TableRow
                      key={`${campaign.source}-${campaign.id}`}
                      className={isSEO ? 'cursor-pointer transition-colors hover:bg-muted/50' : ''}
                      onClick={() => handleRowClick(campaign)}
                    >
                      <TableCell>
                        <div className="font-medium">{formatDate(campaign.created_at)}</div>
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="truncate" title={campaign.name}>
                          {campaign.name}
                        </div>
                      </TableCell>
                      {isSEO && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{campaign.posts?.length || campaign.number_of_articles || 0}</span>
                            <span className="text-muted-foreground text-sm">articles</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="max-w-[340px]">
                        <div className="flex flex-wrap gap-1">
                          {(campaign.keywords || []).map((kw, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {kw.length > 32 ? `${kw.slice(0, 32)}…` : kw}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isSEO && selectedCampaign && (
        <CampaignTopicsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          brandId={selectedCampaign.brand_id || ''}
          campaignDate={selectedCampaign.created_at}
          topicsCount={(selectedCampaign.posts?.length || selectedCampaign.number_of_articles || 0) as number}
          campaignId={selectedCampaign.id}
        />
      )}
    </>
  )
}

export default UnifiedCampaignsTable



