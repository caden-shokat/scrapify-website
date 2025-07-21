import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { TrendingUp, TrendingDown, Minus, Hash, Type } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useRegion } from "@/hooks/useRegion"

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
  const [years, setYears] = useState<number[]>([])
  const [weeks, setWeeks] = useState<number[]>([])
  const [year,  setYear]  = useState<number | null>(null)
  const [week,  setWeek]  = useState<number | null>(null)


  const [keywordTrends, setKeywordTrends] = useState<KeywordTrend[]>([])
  const [headlineStructures, setHeadlineStructures] = useState<HeadlineStructure[]>([])
  const [lengthTrends, setLengthTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  const { region } = useRegion()
  const german = region == 'DE'

  const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    const dayNum = date.getUTCDay() || 7
    date.setUTCDate(date.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  const getDateOfISOWeek = (w: number, y: number): Date => {
    const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7))
    const dow = simple.getUTCDay() || 7
    if (dow <= 4) simple.setUTCDate(simple.getUTCDate() - dow + 1)
    else         simple.setUTCDate(simple.getUTCDate() + 8 - dow)
    return simple
  }


  const fetchWeekYearOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('Scrape Data')
        .select('date')
        .eq('region', region)
        .not('date', 'is', null)

      if (error) throw error

      const yearSet = new Set<number>()
      const weekSet = new Set<number>()

      ;(data || []).forEach(r => {
        const d = new Date(r.date)
        yearSet.add(d.getFullYear())
        weekSet.add(getWeekNumber(d))
      })

      const sortedYears = Array.from(yearSet).sort((a, b) => b - a)
      const sortedWeeks = Array.from(weekSet).sort((a, b) => b - a)

      setYears(sortedYears)
      setWeeks(sortedWeeks)
      if (!year && sortedYears.length) setYear(sortedYears[0])
      if (!week && sortedWeeks.length) setWeek(sortedWeeks[0])
    } catch (err) {
      console.error(err)
    }
  }
  
  const fetchTrendData = async () => {
    if (year === null || week === null) return
    setLoading(true)
    setError(null)

    const currentStart = getDateOfISOWeek(week, year)
    const currentEnd   = new Date(currentStart)
    currentEnd.setUTCDate(currentStart.getUTCDate() + 7)

    const prevWeek = week > 1 ? week - 1 : 52
    const prevYear = week > 1 ? year : year - 1

    const prevStart = getDateOfISOWeek(prevWeek, prevYear)
    const prevEnd   = new Date(prevStart)
    prevEnd.setUTCDate(prevStart.getUTCDate() + 7)


    try {
      const rpcName = german ? "topDEKeywords" : "topKeywords"

      const { data: curr, error: curErr } = await supabase
        .rpc(rpcName, { 
          start_ts: currentStart.toISOString(),
          end_ts:   currentEnd.toISOString(),
          limit_n:  20
         })
      if (curErr) throw curErr

      const { data: prev, error: prevErr } = await supabase
        .rpc(rpcName, { 
          start_ts: prevStart.toISOString(),
          end_ts:   prevEnd.toISOString(),
          limit_n:  20
         })
      if (prevErr) throw prevErr

      const prevMap = new Map<string, number>(
        (prev as any[]).map(r => [r.keyword, r.frequency])
      )
      const trends: KeywordTrend[] = (curr as any[]).map(r => {
        const prevCount = prevMap.get(r.keyword) || 0
        const change = prevCount > 0
          ? Math.round(((r.frequency - prevCount) / prevCount) * 100)
          : 100
        return { keyword: r.keyword, frequency: r.frequency, change }
      })

      setKeywordTrends(trends)

      const { data: allHeadlines, error: headlinesErr } = await supabase
        .from('Scrape Data')
        .select('headline')
        .eq('region', region)
        .gte("date", currentStart.toISOString())
        .lt("date", currentEnd.toISOString())
        .not('headline', 'is', null)
      if (headlinesErr) throw headlinesErr

      const headlines: string[] = (allHeadlines || []).map(r => r.headline)

      setHeadlineStructures(analyzeHeadlineStructures(headlines))
      setLengthTrends(analyzeLengthTrends(headlines))

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWeekYearOptions() }, [region])
  useEffect(() => { fetchTrendData() }, [region, year, week])

  const analyzeHeadlineStructures = (headlines: string[]) => {
    const structures: Record<string, { count: number; lengths: number[]; examples: string[] }> = {}
    headlines.forEach(headline => {
      if (!headline) return
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
    if(!german) {
      if (headline.includes('?')) return 'Question Format'
      if (headline.includes('!')) return 'Exclamation Format'
      if (/^\d+/.test(headline)) return 'Number-led'
      if (headline.includes(':')) return 'Colon Structure'
      if (headline.toLowerCase().includes('how')) return 'How-to Guide'
      if (headline.toLowerCase().includes('best') || headline.toLowerCase().includes('top')) return 'Best/Top Lists'
      if (headline.toLowerCase().includes('free')) return 'Free Offer'
      return 'Standard Format'
    }
   
    if (headline.includes('?'))  return 'Frageformat'
    if (headline.includes('!')) return 'Ausrufeformat'
    if (/^\d+/.test(headline)) return 'Zahlenformat'
    if (headline.includes(':')) return 'Struktur mit Doppelpunkt'
    if (headline.toLowerCase().includes('wie man')) return 'Anleitungsformat'
    if (headline.toLowerCase().includes('beste') || headline.toLowerCase().includes('top'))  return 'Top‑Liste'
    if (headline.toLowerCase().includes('gratis') || headline.toLowerCase().includes('kostenlos')) return 'Gratisangebot'
    return 'Standardformat'

    }

  const analyzeLengthTrends = (data: string[]) => {
    const buckets: Record<string, number> = {
      '20-30': 0, '31-40': 0, '41-50': 0,
      '51-60': 0, '61-70': 0, '71-80': 0, '80+': 0
    }
    data.forEach(item => {
      const length = item.length
      if (length <= 30) buckets['20-30']++
      else if (length <= 40) buckets['31-40']++
      else if (length <= 50) buckets['41-50']++
      else if (length <= 60) buckets['51-60']++
      else if (length <= 70) buckets['61-70']++
      else if (length <= 80) buckets['71-80']++
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
    <div className="p-6 space-y-6 bg-[#fafafa] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:20px_20px]">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{german ? 'Trendanalyse' : 'Trend Analysis'}</h1>
        </div>
        <div className="flex gap-2">
          <Select value={year?.toString() || ''} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={week?.toString() || ''} onValueChange={v => setWeek(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={german ? "Woche" : "Week"} />
            </SelectTrigger>
            <SelectContent>
              {weeks.map(w => (
                <SelectItem key={w} value={w.toString()}>{german ? 'Woche' : 'Week'} {w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" /> {german ? 'Trend-Keywords' : 'Trending Keywords'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{german ? 'Stichwort' : 'Keyword'}</TableHead>
                <TableHead>{german ? 'Frequenz' : 'Frequency'}</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>{german ? 'Ändern' : 'Change'} %</TableHead>
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
          <CardTitle>{german ? 'Überschriftenlängenverteilung' : 'Headline Length Distribution'}</CardTitle>
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
            <Type className="w-5 h-5" /> {german ? 'Beliebte Überschriftenstrukturen' : 'Popular Headline Structures'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{german ? 'Muster' : 'Pattern'}</TableHead>
                <TableHead>{german ? 'Zählen' : 'Count'}</TableHead>
                <TableHead>{german ? 'Durchschnittliche Länge' : 'Avg Length'}</TableHead>
                <TableHead>{german ? 'Beispiele' : 'Examples'}</TableHead>
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
        <Button onClick={fetchTrendData}>{german ? 'Analyse aktualisieren' : 'Refresh Analysis'}</Button>
      </div>
    </div>
  )
}

export default TrendAnalysis
