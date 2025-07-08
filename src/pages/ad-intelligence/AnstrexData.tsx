import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import TimeFilterDropdown from "@/components/TimeFilterDropdown"
import HeartButton from "@/components/HeartButton"
import SelectButton from "@/components/SelectButton"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useSelectedHeadlines } from "@/hooks/useSelectedHeadlines"
import { useToast } from "@/hooks/use-toast"  

interface AnstrexDataItem {
  Id: string
  Brand: string | null
  Headline: string
  Gravity: number | null
  Date: string | null
  Network: string | null
  Duration: number | null
  "Image Url": string | null
  Strength: number | null
}

const AnstrexData = () => {
  const [anstrexData, setAnstrexData] = useState<AnstrexDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [weeks, setWeeks] = useState<number[]>([])
  const [years, setYears] = useState<number[]>([])
  const [week,  setWeek]  = useState<number|null>(null)
  const [year,  setYear]  = useState<number|null>(null)

  const { toast } = useToast()

  const fetchWeekYearOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('Anstrex Data')
        .select('Week, Year')
      if (error) throw error

      const weekSet = new Set<number>()
      const yearSet = new Set<number>()
      data?.forEach(r => {
        weekSet.add(r.Week)
        yearSet.add(r.Year)
      })

      const sortedWeeks = Array.from(weekSet).sort((a, b) => b - a)
      const sortedYears = Array.from(yearSet).sort((a, b) => b - a)

      setWeeks(sortedWeeks)
      setYears(sortedYears)
      if (sortedYears.length && year === null) setYear(sortedYears[0])
      if (sortedWeeks.length && week === null) setWeek(sortedWeeks[0])
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to load week options', variant: 'destructive' })
    }
  }

  const { selectedHeadlines, loading: loadingSelected, refetch: refetchSelected } = useSelectedHeadlines()

  const isRowSelected = (id: string) =>
    selectedHeadlines.some(sh => sh.source_id === id)

  const fetchAnstrexData = async () => {
    if (week === null || year === null) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('Anstrex Data')
        .select('*')
        .eq('Week', week)
        .eq('Year', year)
        .order('Strength', { ascending: false })
        .limit(100)

      if (error) throw error
      setAnstrexData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWeekYearOptions() }, [])
  useEffect(() => { fetchAnstrexData() }, [week, year])

  const getGravityColor = (gravity: number | null) => {
    if (!gravity) return "bg-gray-100 text-gray-800"
    if (gravity >= 80) return "bg-green-100 text-green-800"
    if (gravity >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getStrengthColor = (strength: number | null) => {
    if (!strength) return "bg-gray-100 text-gray-800"
    if (strength >= 80) return "bg-blue-100 text-blue-800"
    if (strength >= 60) return "bg-purple-100 text-purple-800"
    return "bg-orange-100 text-orange-800"
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Anstrex Data</h1>
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
                {weeks.map(w => <SelectItem key={w} value={w.toString()}>Week {w}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{anstrexData.length}</div>
            <div className="text-sm text-gray-600">Total Ads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-light">
              {Math.round(anstrexData.reduce((acc, item) => acc + (item.Gravity || 0), 0) / anstrexData.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Gravity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-dark">
              {Math.round(anstrexData.reduce((acc, item) => acc + (item.Strength || 0), 0) / anstrexData.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Strength</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {new Set(anstrexData.map(item => item.Brand).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Brands</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Anstrex Ad Intelligence ({week})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Gravity</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anstrexData.map((item) => (
                <TableRow key={item.Id}>
                  <TableCell className="font-mono text-sm">{item.Id}</TableCell>
                  <TableCell>{item.Date ? new Date(item.Date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{item.Brand || 'Unknown'}</TableCell>
                  <TableCell className="max-w-md whitespace-normal break-words" title={item.Headline}>
                    {item.Headline}
                  </TableCell>
                  <TableCell>
                    <Badge className={getGravityColor(item.Gravity)}>
                      {item.Gravity || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStrengthColor(item.Strength)}>
                      {item.Strength || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.Network || 'Unknown'}</TableCell>
                  <TableCell>{item.Duration ? `${item.Duration} days` : 'N/A'}</TableCell>
                  <TableCell>
                    <SelectButton
                      headline={item.Headline}
                      sourceTable="anstrex_data"
                      sourceId={item.Id}
                      brand={item.Brand || undefined}
                      isSelected={isRowSelected(item.Id)}
                      onSelectionChange={refetchSelected}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 text-center">
            <Button onClick={fetchAnstrexData}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnstrexData
