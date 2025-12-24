import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, DollarSign, Target, Users } from 'lucide-react'

interface KeywordStats {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  competition_level: string
  intent: string
  monthly_searches: Array<{
    year: number
    month: number
    search_volume: number
  }>
  source: string
}

interface KeywordStatsDialogProps {
  isOpen: boolean
  onClose: () => void
  keywordStats: KeywordStats | null
}

export const KeywordStatsDialog: React.FC<KeywordStatsDialogProps> = ({
  isOpen,
  onClose,
  keywordStats
}) => {
  if (!keywordStats) return null

  // Prepare data for charts from monthly_searches
  const monthlyData = keywordStats.monthly_searches?.map(item => ({
    month: `${item.year}-${String(item.month).padStart(2, '0')}`,
    volume: item.search_volume,
    year: item.year,
    monthNumber: item.month
  })).sort((a, b) => {
    // Sort by year and month
    if (a.year !== b.year) return a.year - b.year
    return a.monthNumber - b.monthNumber
  }) || []

  const competitionData = [
    { name: 'Low', value: keywordStats.competition_level === 'Low' ? 1 : 0, color: '#10b981' },
    { name: 'Medium', value: keywordStats.competition_level === 'Medium' ? 1 : 0, color: '#f59e0b' },
    { name: 'High', value: keywordStats.competition_level === 'High' ? 1 : 0, color: '#ef4444' }
  ]

  const intentColors = {
    'Informational': '#3b82f6',
    'Commercial': '#f59e0b',
    'Transactional': '#10b981',
    'Navigational': '#8b5cf6'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Keyword Analysis: {keywordStats.keyword}
          </DialogTitle>
          <DialogDescription>
            Detailed statistics and trends for this keyword from DataForSEO
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Search Volume</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(keywordStats.search_volume)}</div>
                <p className="text-xs text-muted-foreground">monthly searches</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPC</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(keywordStats.cpc)}</div>
                <p className="text-xs text-muted-foreground">cost per click</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competition</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge 
                    variant={keywordStats.competition_level === 'High' ? 'destructive' : 
                            keywordStats.competition_level === 'Medium' ? 'default' : 'secondary'}
                  >
                    {keywordStats.competition_level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(keywordStats.competition * 100).toFixed(1)}% competitive
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Intent Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Search Intent:</span>
            <Badge 
              style={{ 
                backgroundColor: intentColors[keywordStats.intent as keyof typeof intentColors] || '#6b7280',
                color: 'white'
              }}
            >
              {keywordStats.intent}
            </Badge>
          </div>

          {/* Monthly Search Volume Chart */}
          {monthlyData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Search Volume Trend</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Historical search volume data from DataForSEO ({monthlyData.length} months)
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={formatNumber}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatNumber(value), 'Search Volume']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Search Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No monthly search data available</p>
                  <p className="text-sm">Historical trends will appear here when data is available</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Data Summary */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(Math.max(...monthlyData.map(d => d.volume)))}
                    </div>
                    <p className="text-sm text-muted-foreground">Peak Volume</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(Math.min(...monthlyData.map(d => d.volume)))}
                    </div>
                    <p className="text-sm text-muted-foreground">Lowest Volume</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatNumber(Math.round(monthlyData.reduce((sum, d) => sum + d.volume, 0) / monthlyData.length))}
                    </div>
                    <p className="text-sm text-muted-foreground">Average Volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Data Table */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Search Volume Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed breakdown of search volume by month
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Search Volume</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((item, index) => {
                        const previousVolume = index > 0 ? monthlyData[index - 1].volume : null
                        const change = previousVolume ? item.volume - previousVolume : 0
                        const changePercent = previousVolume ? ((change / previousVolume) * 100) : 0
                        
                        return (
                          <TableRow key={item.month}>
                            <TableCell className="font-medium">{item.month}</TableCell>
                            <TableCell className="text-right font-mono">
                              {formatNumber(item.volume)}
                            </TableCell>
                            <TableCell className="text-right">
                              {previousVolume ? (
                                <span className={`font-mono ${
                                  change > 0 ? 'text-green-600' : 
                                  change < 0 ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                  {change > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keyword Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Search Volume:</span>
                  <span className="font-medium">{formatNumber(keywordStats.search_volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">CPC:</span>
                  <span className="font-medium">{formatCurrency(keywordStats.cpc)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Competition:</span>
                  <span className="font-medium">{(keywordStats.competition * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Intent:</span>
                  <Badge 
                    style={{ 
                      backgroundColor: intentColors[keywordStats.intent as keyof typeof intentColors] || '#6b7280',
                      color: 'white'
                    }}
                  >
                    {keywordStats.intent}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Source:</span>
                  <span className="font-medium">DataForSEO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{keywordStats.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default KeywordStatsDialog
