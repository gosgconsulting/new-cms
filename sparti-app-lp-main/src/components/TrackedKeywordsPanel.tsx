// @ts-nocheck
import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Trash2, Share, TrendingUp, BarChart3 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import KeywordStatsDialog from './KeywordStatsDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

type Intent = 'informational' | 'navigational' | 'commercial' | 'transactional'

interface TrackedKeyword {
  id: string
  user_id: string
  brand_id: string
  keyword: string
  intents: Intent[]
  intent: string | null
  search_volume: number | null
  target_country: string | null
  source: string | null
  created_at: string
  cpc?: number
  competition?: number
  competition_level?: string
  keyword_difficulty?: number
  monthly_searches?: Array<{
    year: number
    month: number
    search_volume: number
  }>
}

interface KeywordStats {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  competition_level: string
  keyword_difficulty: number
  intent: string
  monthly_searches: Array<{
    year: number
    month: number
    search_volume: number
  }>
  source: string
}

interface TrackedKeywordsPanelProps {
  brandId: string
  userId: string
}

const INTENT_LABEL: Record<Intent, string> = {
  informational: 'Informational',
  navigational: 'Navigational',
  commercial: 'Commercial',
  transactional: 'Transactional',
}

const intentPill = (intent: Intent) => (
  <Badge key={intent} variant="secondary" className="text-[10px]">
    {INTENT_LABEL[intent]}
  </Badge>
)

function classifyKeywordIntents(keyword: string): Intent[] {
  const k = keyword.toLowerCase().trim()
  const intents: Intent[] = []
  const infoStarts = ['how', 'what', 'why', 'guide', 'tips']
  const navHints = ['login', 'sign in', 'dashboard', 'homepage', 'site', 'brand', 'official']
  const commHints = ['best', 'top', 'compare', 'vs', 'review', 'alternative']
  const transHints = ['buy', 'price', 'pricing', 'order', 'coupon', 'discount']

  if (infoStarts.some(x => k.startsWith(x)) || /\b(guide|tips|tutorial|learn)\b/.test(k)) intents.push('informational')
  if (navHints.some(x => k.includes(x))) intents.push('navigational')
  if (commHints.some(x => k.includes(x))) intents.push('commercial')
  if (transHints.some(x => k.includes(x))) intents.push('transactional')

  if (intents.length === 0) intents.push('informational')
  return Array.from(new Set(intents))
}

export const TrackedKeywordsPanel: React.FC<TrackedKeywordsPanelProps> = ({ brandId, userId }) => {
  const queryClient = useQueryClient()
  const [bulkInput, setBulkInput] = useState('')
  const [search, setSearch] = useState('')
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<string>('all')
  
  // Bulk edit functionality
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  
  // Dialog state
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [selectedKeywordStats, setSelectedKeywordStats] = useState<KeywordStats | null>(null)
  
  // Sorting state - default to search volume high to low
  const [sortBy, setSortBy] = useState<'keyword' | 'search_volume' | null>('search_volume')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: keywords = [], isLoading } = useQuery<TrackedKeyword[]>({
    queryKey: ['tracked-keywords', brandId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_tracked_keywords')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as TrackedKeyword[]
    },
    enabled: !!brandId && !!userId,
  })

  const addMutation = useMutation({
    mutationFn: async (items: { keyword: string; intents: Intent[] }[]) => {
      const rows = items.map(it => ({
        brand_id: brandId,
        user_id: userId,
        keyword: it.keyword,
        intents: it.intents,
        source: 'manual',
      }))
      const { error } = await supabase.from('seo_tracked_keywords').upsert(rows, {
        onConflict: 'brand_id, user_id, keyword',
        ignoreDuplicates: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setBulkInput('')
      queryClient.invalidateQueries({ queryKey: ['tracked-keywords', brandId, userId] })
      toast.success('Keywords added')
    },
    onError: (e) => {
      console.error(e)
      toast.error('Failed to add keywords')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('seo_tracked_keywords').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracked-keywords', brandId, userId] })
      toast.success('Deleted')
    },
    onError: () => toast.error('Delete failed'),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('seo_tracked_keywords').delete().in('id', ids)
      if (error) throw error
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['tracked-keywords', brandId, userId] })
      setSelectedKeywords([])
      toast.success(`Deleted ${ids.length} keywords`)
    },
    onError: () => toast.error('Bulk delete failed'),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = keywords.filter(k => {
      if (q && !k.keyword.toLowerCase().includes(q)) return false
      
      // Filter by intent
      if (selectedIntent !== 'all') {
        const keywordIntent = (k.intent || 'informational').toLowerCase()
        if (keywordIntent !== selectedIntent.toLowerCase()) return false
      }
      
      return true
    })
    
    // Apply sorting
    if (sortBy === 'search_volume') {
      result.sort((a, b) => {
        const aVal = a.search_volume || 0
        const bVal = b.search_volume || 0
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      })
    } else if (sortBy === 'keyword') {
      result.sort((a, b) => {
        const aVal = a.keyword.toLowerCase()
        const bVal = b.keyword.toLowerCase()
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      })
    }
    
    return result
  }, [keywords, search, sortBy, sortOrder, selectedIntent])

  // Calculate intent counts
  const intentCounts = useMemo(() => ({
    all: keywords.length,
    informational: keywords.filter(k => (k.intent || 'informational').toLowerCase() === 'informational').length,
    commercial: keywords.filter(k => (k.intent || 'informational').toLowerCase() === 'commercial').length,
    transactional: keywords.filter(k => (k.intent || 'informational').toLowerCase() === 'transactional').length,
    navigational: keywords.filter(k => (k.intent || 'informational').toLowerCase() === 'navigational').length,
  }), [keywords])

  const keywordsWithoutData = useMemo(() => {
    return keywords.filter(k => 
      k.search_volume === null || 
      k.search_volume === undefined ||
      k.monthly_searches === null ||
      k.monthly_searches === undefined
    )
  }, [keywords])

  const fetchDataMutation = useMutation({
    mutationFn: async () => {
      if (keywordsWithoutData.length === 0) {
        throw new Error('No keywords need data fetching')
      }

      const keywordsList = keywordsWithoutData.map(k => k.keyword)
      
      const { data, error } = await supabase.functions.invoke('keyword-research', {
        body: {
          keywords: keywordsList,
          location: 'Singapore', // Default location, could be made configurable
          language: 'en',
          brand_id: brandId
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: async (data) => {
      if (data?.data?.keywords) {
        // Update the keywords with the fetched data
        const updates = data.data.keywords.map((keywordData: any) => ({
          brand_id: brandId,
          user_id: userId,
          keyword: keywordData.keyword,
          search_volume: keywordData.search_volume || 0,
          cpc: keywordData.cpc || 0,
          competition_level: keywordData.competition || keywordData.competition_level || 'Low',
          intent: keywordData.intent || 'Informational',
          monthly_searches: keywordData.monthly_searches || [],
          target_country: 'Singapore',
          source: 'dataforseo'
        }))

        const { error } = await supabase
          .from('seo_tracked_keywords')
          .upsert(updates, {
            onConflict: 'brand_id, user_id, keyword',
            ignoreDuplicates: false
          })

        if (error) throw error

        queryClient.invalidateQueries({ queryKey: ['tracked-keywords', brandId, userId] })
        toast.success(`Updated ${data.data.keywords.length} keywords with search volume data`)
      }
      setIsFetchingData(false)
    },
    onError: (error) => {
      console.error('Error fetching keyword data:', error)
      toast.error('Failed to fetch keyword data')
      setIsFetchingData(false)
    }
  })

  const handleSort = (column: 'keyword' | 'search_volume') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder(column === 'search_volume' ? 'desc' : 'asc')
    }
  }
  
  const addBulk = () => {
    const lines = bulkInput
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
    if (!lines.length) return
    const items = lines.map(l => ({ keyword: l, intents: classifyKeywordIntents(l) }))
    addMutation.mutate(items)
  }

  // Bulk edit handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeywords(filtered.map(k => k.id))
    } else {
      setSelectedKeywords([])
    }
  }

  const handleSelectKeyword = (keywordId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeywords(prev => [...prev, keywordId])
    } else {
      setSelectedKeywords(prev => prev.filter(id => id !== keywordId))
    }
  }

  const handleBulkDelete = () => {
    if (selectedKeywords.length === 0) {
      toast.error('No keywords selected')
      return
    }
    bulkDeleteMutation.mutate(selectedKeywords)
  }

  const handleKeywordRowClick = (keyword: TrackedKeyword) => {
    // Convert TrackedKeyword to KeywordStats format
    const stats: KeywordStats = {
      keyword: keyword.keyword,
      search_volume: keyword.search_volume || 0,
      cpc: keyword.cpc || 0,
      competition: keyword.competition || 0,
      competition_level: keyword.competition_level || 'Low',
      intent: keyword.intent || 'Informational',
      monthly_searches: keyword.monthly_searches || [],
      source: keyword.source || 'unknown'
    }
    
    setSelectedKeywordStats(stats)
    setIsStatsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle>Tracked Keywords</CardTitle>
          <CardDescription>Add keywords to track and filter by intent. Autopilot SEO can append here.</CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsFetchingData(true)
              fetchDataMutation.mutate()
            }}
            disabled={fetchDataMutation.isPending || isFetchingData || keywordsWithoutData.length === 0}
          >
            <TrendingUp className="h-4 w-4 mr-1"/>
            {fetchDataMutation.isPending ? 'Fetching...' : `Get Data (${keywordsWithoutData.length})`}
          </Button>
          {selectedKeywords.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1"/>
              Delete ({selectedKeywords.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => toast.info('Sharing not implemented yet')}>
            <Share className="h-4 w-4 mr-1"/> Share
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Enter keywords to add (one per line)..."
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Enter one keyword per line. We will auto-categorize intents.</span>
            <Button size="sm" onClick={addBulk} disabled={addMutation.isPending}>Add Keywords</Button>
          </div>
        </div>

        <Input
          placeholder="Search keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Tabs value={selectedIntent} onValueChange={setSelectedIntent}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">
              All ({intentCounts.all})
            </TabsTrigger>
            <TabsTrigger value="informational">
              Informational ({intentCounts.informational})
            </TabsTrigger>
            <TabsTrigger value="commercial">
              Commercial ({intentCounts.commercial})
            </TabsTrigger>
            <TabsTrigger value="transactional">
              Transactional ({intentCounts.transactional})
            </TabsTrigger>
            <TabsTrigger value="navigational">
              Navigational ({intentCounts.navigational})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedIntent} className="mt-4">
            {filtered.length > 0 && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <Checkbox
                  id="select-all"
                  checked={filtered.length > 0 && selectedKeywords.length === filtered.length}
                  onCheckedChange={handleSelectAll}
                />
                <label 
                  htmlFor="select-all" 
                  className="text-sm font-medium cursor-pointer select-none"
                >
                  {selectedKeywords.length === filtered.length && filtered.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </label>
                {selectedKeywords.length > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({selectedKeywords.length} selected)
                  </span>
                )}
              </div>
            )}
            <ScrollArea className="h-[500px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('keyword')}
                    >
                      <div className="flex items-center gap-1">
                        Keyword
                        {sortBy === 'keyword' && (
                          <TrendingUp className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('search_volume')}
                    >
                      <div className="flex items-center gap-1">
                        Search Volume
                        {sortBy === 'search_volume' && (
                          <TrendingUp className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
                  ) : filtered.length ? (
                    filtered.map(row => (
                  <TableRow 
                    key={row.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleKeywordRowClick(row)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedKeywords.includes(row.id)}
                        onCheckedChange={(checked) => handleSelectKeyword(row.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{(() => {
                          // Clean keyword by removing any trailing numbers that might be concatenated
                          const cleanKeyword = typeof row.keyword === 'string' 
                            ? row.keyword.replace(/\s*\d+$/, '').trim() || row.keyword
                            : String(row.keyword || '');
                          
                          // Debug logging to see raw data
                          if (row.keyword !== cleanKeyword) {
                            console.log('Keyword cleaned:', { original: row.keyword, cleaned: cleanKeyword, searchVolume: row.search_volume });
                          }
                          
                          return cleanKeyword;
                        })()}</span>
                        {row.search_volume && row.search_volume > 0 && (
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(() => {
                          // Prioritize API-fetched intent (singular) over manual intents (plural)
                          if (row.intent) {
                            const intentKey = row.intent.toLowerCase() as Intent;
                            return (
                              <Badge variant="secondary" className="text-[10px]">
                                {INTENT_LABEL[intentKey] || row.intent.charAt(0).toUpperCase() + row.intent.slice(1).toLowerCase()}
                              </Badge>
                            );
                          } else if (row.intents && row.intents.length > 0) {
                            return row.intents.map(intentPill);
                          } else {
                            return <Badge variant="secondary" className="text-[10px]">Informational</Badge>;
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.search_volume !== null && row.search_volume !== undefined && row.search_volume > 0 
                        ? row.search_volume 
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{row.target_country || '-'}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-muted-foreground">No keywords</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Keyword Stats Dialog */}
      <KeywordStatsDialog
        isOpen={isStatsDialogOpen}
        onClose={() => setIsStatsDialogOpen(false)}
        keywordStats={selectedKeywordStats}
      />
    </Card>
  )
}

export default TrackedKeywordsPanel


