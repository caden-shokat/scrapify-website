import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { RefreshCw, Sparkles } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import AIHeadlineRow from "@/components/AIHeadlineRow";
import { useTopHeadlines } from "@/hooks/useTopHeadlines"
import { useRegion } from "@/hooks/useRegion"

export interface TopAIHeadline {
  source_id: string
  headline: string
  week: number
  year: number
  frequency: number
  ai_headline: string | null
  id: string
}

export default function TopAIHeadlines() {
  const [weeks, setWeeks] = useState<number[]>([])
  const [years, setYears] = useState<number[]>([])
  const [week, setWeek] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  
  const [generating, setGenerating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const { items, loading: fetching, refetch, numOverrides } = useTopHeadlines(week, year)
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const { region } = useRegion()
  const german = region == 'DE'

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("topWeeklyAIHeadlines")
          .select("week, year")
          .eq("region", region)
        if (error) throw error

        const weekSet = new Set<number>()
        const yearSet = new Set<number>()
        data?.forEach(r => {
          weekSet.add(r.week)
          yearSet.add(r.year)
        })

        const sortedWeeks = Array.from(weekSet).sort((a, b) => b - a)
        const sortedYears = Array.from(yearSet).sort((a, b) => b - a)

        setWeeks(sortedWeeks)
        setYears(sortedYears)
        if (sortedYears.length && year === null) setYear(sortedYears[0])
        if (sortedWeeks.length && week === null) setWeek(sortedWeeks[0])
      } catch (e) {
        console.error(e)
        toast({
          title: "Error",
          description: "Failed to load week options",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [region])

  

  const regenerate = async (source_id: string, headline: string, frequency: number) => {
    setBusyId(source_id)
    try {
      await supabase.functions.invoke('regenerate-selected-headline', {
        body: { items: [{ source_id, headline, week: week!, year: year!, frequency: frequency, region: region }] }
      })
      
      toast({ title: 'Regenerated' })
      await refetch()      
    } catch {
      toast({ title: 'Error', description: 'Regeneration failed', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const total = items.length
  const humanEditedCount = numOverrides
  const humanEditedPct = total > 0 ? Math.round((humanEditedCount / total) * 100) : 0

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6 bg-[#fafafa] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:20px_20px]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{german ? 'Top-KI-Schlagzeilen' : 'Top AI Headlines'}</h1>
        </div>
        <div className="flex gap-2">
          <Select value={year?.toString() || ''} onValueChange={v => setYear(+v)}>
            <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={week?.toString() || ''} onValueChange={v => setWeek(+v)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Week"/></SelectTrigger>
            <SelectContent>
              {weeks.map(w => <SelectItem key={w} value={w.toString()}>{german ? 'Woche' : 'Week'} {w}</SelectItem>)}
            </SelectContent>
          </Select>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent>
          <div className="text-2xl font-bold text-primary-light">{items.length}</div>
          <div className="text-sm text-gray-600">{german ? 'Schlagzeilen': 'Headlines'}</div>
        </CardContent></Card>
        <Card><CardContent>
          <div className="text-2xl font-bold text-primary-light">
            {Math.round(items.reduce((acc, item) => acc + (item.headline?.length || 0), 0) / items.length) || 0}
          </div>
          <div className="text-sm text-gray-600">{german ? 'Durchschnittliche Charaktere' : 'Average Characters'}</div>
        </CardContent></Card>
        <Card><CardContent>
          <div className="text-2xl font-bold text-primary-light">{humanEditedPct} %</div>
          <div className="text-sm text-gray-600">{german ? 'Prozent regeneriert' : 'Percent Regenerated'}</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{german ? 'Woche' : 'Week'} {week}, {year}</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data</div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Original</TableHead>
                <TableHead>{german ? 'KI' : 'AI'}</TableHead>
                <TableHead>{german ? 'Frequenz' : 'Freq'}</TableHead>
                <TableHead>{german ? 'Aktionen' : 'Actions'}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {items.map(item => (
                  <AIHeadlineRow
                    key={item.source_id}
                    item={item}
                    busyId={busyId}
                    onRegenerate={regenerate}
                  />
                  )   
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
