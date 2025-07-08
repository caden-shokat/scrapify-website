import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { TrendingUp, TrendingDown, Minus, Hash, Type } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import TimeFilterDropdown from "@/components/TimeFilterDropdown"
import LoadingSpinner from "@/components/LoadingSpinner"

interface KeywordTrend {
  keyword: string
  frequency: number
  change: number
}

interface HeadlineStructure {
  pattern: string
  count: number
  avgLength: number
  examples: string[]
}

const TrendAnalysis = () => {
  const [keywordTrends, setKeywordTrends] = useState<KeywordTrend[]>([])
  const [headlineStructures, setHeadlineStructures] = useState<HeadlineStructure[]>([])
  const [lengthTrends, setLengthTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    fetchTrendData()
  }, [timeFilter])

  const fetchTrendData = async () => {
    setLoading(true)
    setError(null)

    try {
      const now = new Date()
      let currentStart: Date, previousStart: Date, previousEnd: Date

      switch (timeFilter) {
        case 'daily':
          currentStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
          previousEnd   = currentStart
          break
        case 'weekly':
          currentStart  = new Date(now.getTime() - 7 * 86400e3)
          previousStart = new Date(now.getTime() - 14 * 86400e3)
          previousEnd   = currentStart
          break
        case 'monthly':
          currentStart  = new Date(now.getFullYear(), now.getMonth(), 1)
          previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          previousEnd   = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }

      const { data: currentKeywords, error: curErr } = await supabase
        .rpc('topKeywords', {
          start_ts: currentStart.toISOString(),
          end_ts:   now.toISOString(),
          limit_n:  20
        })
      if (curErr) throw curErr

      const { data: previousKeywords, error: prevErr } = await supabase
        .rpc('topKeywords', {
          start_ts: previousStart.toISOString(),
          end_ts:   previousEnd.toISOString(),
          limit_n:  20
        })
      if (prevErr) throw prevErr

      const prevMap = new Map<string, number>(
        (previousKeywords as any[]).map(r => [r.keyword, r.frequency])
      )
      const trends = (currentKeywords as any[]).map(r => {
        const prevCount = prevMap.get(r.keyword) || 0
        const change = prevCount > 0
          ? ((r.frequency - prevCount) / prevCount) * 100
          : 100
        return {
          keyword:   r.keyword,
          frequency: r.frequency,
          change:    Math.round(change)
        }
      })

      setKeywordTrends(trends)

      const { data: fullCurrent, error: fullErr } = await supabase
        .from('Scrape Data')
        .select('Headline')
        .gte('Date', currentStart.toISOString())
        .not('Headline', 'is', null)
      if (fullErr) throw fullErr

      const structures = analyzeHeadlineStructures(fullCurrent || [])
      setHeadlineStructures(structures)

      const lengthData = analyzeLengthTrends(fullCurrent || [])
      setLengthTrends(lengthData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const analyzeHeadlineStructures = (data: any[]) => {
    const structures: Record<string, { count: number; lengths: number[]; examples: string[] }> = {}
    data.forEach(item => {
      if (!item.Headline) return
      const headline = item.Headline as string
      const pattern = analyzePattern(headline)
      if (!structures[pattern]) {
        structures[pattern] = { count: 0, lengths: [], examples: [] }
      }
      structures[pattern].count++
      structures[pattern].lengths.push(headline.length)
      if (structures[pattern].examples.length < 3) {
        structures[pattern].examples.push(headline)
      }
    })
    return Object.entries(structures)
      .map(([pattern, info]) => ({
        pattern,
        count: info.count,
        avgLength: Math.round(info.lengths.reduce((a, b) => a + b, 0) / info.lengths.length),
        examples: info.examples
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  const analyzePattern = (headline: string) => {
    if (headline.includes('?')) return 'Question Format'
    if (headline.includes('!')) return 'Exclamation Format'
    if (/^\d+/.test(headline)) return 'Number-led'
    if (headline.includes(':')) return 'Colon Structure'
    if (headline.includes('How to')) return 'How-to Guide'
    if (headline.includes('Best')) return 'Best/Top Lists'
    if (headline.includes('Free')) return 'Free Offer'
    return 'Standard Format'
  }

  const analyzeLengthTrends = (data: any[]) => {
    const buckets: Record<string, number> = {
      '20-30': 0, '31-40': 0, '41-50': 0,
      '51-60': 0, '61-70': 0, '71-80': 0, '80+': 0
    }
    data.forEach(item => {
      const len = (item.Headline as string).length
      if (len <= 30) buckets['20-30']++
      else if (len <= 40) buckets['31-40']++
      else if (len <= 50) buckets['41-50']++
      else if (len <= 60) buckets['51-60']++
      else if (len <= 70) buckets['61-70']++
      else if (len <= 80) buckets['71-80']++
      else buckets['80+']++
    })
    return Object.entries(buckets).map(([range, count]) => ({ range, count }))
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getTrendColor = (change: number) =>
    change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600"

  if (loading) return <LoadingSpinner />
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trend Analysis</h1>
        </div>
        <TimeFilterDropdown value={timeFilter} onValueChange={setTimeFilter} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" /> Trending Keywords ({timeFilter})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Change %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywordTrends.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{item.keyword}</Badge>
                  </TableCell>
                  <TableCell>{item.frequency}</TableCell>
                  <TableCell>
                    <div className="flex items-center">{getTrendIcon(item.change)}</div>
                  </TableCell>
                  <TableCell className={getTrendColor(item.change)}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Headline Length Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lengthTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#127846" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" /> Popular Headline Structures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Avg Length</TableHead>
                <TableHead>Examples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {headlineStructures.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary">{item.pattern}</Badge>
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{item.avgLength} chars</TableCell>
                  <TableCell className="max-w-md">
                    <div className="space-y-1">
                      {item.examples.map((ex, j) => (
                        <div key={j} className="text-sm text-gray-600 truncate">
                          "{ex}"
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={fetchTrendData}>Refresh Analysis</Button>
      </div>
    </div>
  )
}

export default TrendAnalysis
