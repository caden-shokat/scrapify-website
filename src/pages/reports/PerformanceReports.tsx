import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { FileDown, Mail, Plus, X } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { FormatNumber } from "@/utils/FormatNumber"
import { useRegion } from "@/hooks/useRegion"

interface AIHeadlineTest {
  id: string
  headline: string
  status: string
  notes: string | null
  created_at: string
}

interface TopAIHead {
  headline: string
  ai_headline: string | null
  frequency: number
}

interface TopImage {
  source_id: string | null
  image_url: string | null
  frequency: number
}

interface AnstrexItem {
  brand: string | null
  headline: string
  strength: number | null
}

interface AdItem {
  brand: string | null
  headline: string | null
  image_url: string | null
  frequency: number
}

export default function PerformanceReports() {
  const [week, setWeek] = useState<number | null>(null)
  const [weeks, setWeeks] = useState<number[]>([])
  const [year, setYear] = useState<number | null>(null)
  const [years, setYears] = useState<number[]>([])

  const [topAIHeads, setTopAIHeads] = useState<TopAIHead[]>([])
  const [topImgs, setTopImgs] = useState<TopImage[]>([])
  const [topAnstrex, setTopAnstrex] = useState<AnstrexItem[]>([])
  const [topAds, setTopAds] = useState<AdItem[]>([])

  const reportRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { region } = useRegion()
  const german = region == 'DE'

  const fetchWeekYearOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('Anstrex Data')
        .select('week, year')
        .eq('region', region)
        .not('year', 'is', null)
        .not('week', 'is', null)
      if (error) throw error
      
      const yearSet = new Set<number>()
      const weekSet = new Set<number>()

      data?.forEach(({year, week}) => {
        yearSet.add(year)
        weekSet.add(week)
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

  const fetchData = async () => {
    if (week === null || year === null) {
    setLoading(false)
    return
  }
    setLoading(true)
    try {
      const { data: aiData, error: aiErr } = await supabase
        .from('topWeeklyAIHeadlines')
        .select('headline, ai_headline, frequency')
        .eq('week', week)
        .eq('year', year)
        .eq('region', region)
        .order('frequency', { ascending: false })
        .limit(20)
      if (aiErr) throw aiErr
      setTopAIHeads(aiData || [])

      const { data: imgData, error: imgErr } = await supabase
        .from('topWeeklyImages')
        .select('source_id, image_url, frequency')
        .eq('week', week)
        .eq('year', year)
        .eq('region', region)
        .order('frequency', { ascending: false })
        .limit(20)
      if (imgErr) throw imgErr
      setTopImgs(imgData || [])

      const { data: anData, error: anErr } = await supabase
        .from('Anstrex Data')
        .select('brand, headline, strength, length')
        .eq('week', week)
        .eq('year', year)
        .eq('region', region)
        .not('strength', 'is', null)
        .filter('length', 'gt', '35')
        .not('headline', 'like', '%&%')
        .not('headline', 'like', '%/%')
        .not('headline', 'like', '%\\%%')
        .order('strength', { ascending: false })
        .limit(20)
      if (anErr) throw anErr
      setTopAnstrex(anData || [])

      const { data: adData, error: adErr } = await supabase
        .from('topWeeklyAds')
        .select('headline, brand, image_url, frequency')
        .eq('week', week)
        .eq('year', year)
        .eq('region', region)
        .order('frequency', { ascending: false })
        .limit(10)

      if (adErr) throw adErr
      setTopAds(adData || [])

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWeekYearOptions() }, [region])
  useEffect(() => { fetchData() }, [region, week, year])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6 bg-[#fafafa] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:20px_20px]">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{german ? 'Wöchentlicher Scraping-Bericht' : 'Weekly Scraping Report'}</h1>
        <div className="flex gap-2">
          <Select value={year?.toString() || ''} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y=> (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={week?.toString() || ''} onValueChange={v => setWeek(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map(w => (
                <SelectItem key={w} value={w.toString()}>{german ? 'Woche' : 'Week' } {w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
        </div>
      </div>

      {/* Top Headlines & AI */}
      <div ref={reportRef} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{german ? 'Top-Schlagzeilen' : 'Top Headlines'}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Original</TableHead>
                <TableHead>{german ? 'KI' : 'AI'}</TableHead>
                <TableHead>{german ? 'Frequenz' : 'Freq'}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {topAIHeads.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>{h.headline}</TableCell>
                    <TableCell>{h.ai_headline || <span className="text-gray-400">—</span>}</TableCell>
                    <TableCell>{h.frequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Images 5-per-row */}
        <Card>
          <CardHeader><CardTitle>{german ? 'Top Bilder' : 'Top Images'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {topImgs.map((img, i) => (
                <a key={img.source_id || i}
                  href={img.image_url || '#'} target="_blank" rel="noopener noreferrer"
                  className="border rounded overflow-hidden">
                  <img src={img.image_url || '/placeholder.svg'}
                      alt={`Img ${i+1}`} className="w-full h-32 object-cover" />
                  <div className="p-2 flex justify-between text-sm">
                    <span>#{i+1}</span>
                    <span>{img.frequency}</span>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Anstrex by Strength */}
        <Card>
          <CardHeader><CardTitle>{german ? 'Top 10 Anstrex nach Stärke' : 'Top 10 Anstrex by Strength'}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>{german ? 'Rang' : 'Rank'}</TableHead>
                <TableHead>{german ? 'Marke' : 'Brand'}</TableHead>
                <TableHead>{german ? 'Überschrift' : 'Headline'}</TableHead>
                <TableHead>{german ? 'Stärke' : 'Strength'}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {topAnstrex.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>#{i+1}</TableCell>
                    <TableCell>{a.brand || '—'}</TableCell>
                    <TableCell>{a.headline}</TableCell>
                    <TableCell>{FormatNumber(a.strength)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>      

        {/* Top Ads by Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>{german ? 'Top-Anzeigen' : 'Top Ads'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {topAds.map((ad, i) => (
                <div key={i} className="border rounded overflow-hidden">
                  <img
                    src={ad.image_url || '/placeholder.svg'}
                    alt={`Ad ${i + 1}`}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-2 space-y-1 text-sm">
                    <div className="font-medium">{ad.brand || '—'}</div>
                    <div className="break-words" title={ad.headline || ''}>
                      {ad.headline || '—'}
                    </div>
                    <div className="text-gray-500">{german ? 'Frequenz' : 'Freq'}: {ad.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
