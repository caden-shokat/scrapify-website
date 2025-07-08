import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { Target, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SelectButton from "@/components/SelectButton"
import { useToast } from "@/hooks/use-toast"  
import { useSelectedHeadlines } from "@/hooks/useSelectedHeadlines"
import LoadingSpinner from "@/components/LoadingSpinner"

interface CTRPotentialAd {
  id: string
  headline: string | null
  brand: string | null
  platform: string | null
  position: number | null
  week: number
  year: number
}


const CTRPotential = () => {
  const [items, setItems]       = useState<CTRPotentialAd[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const [weeks, setWeeks] = useState<number[]>([])
  const [years, setYears] = useState<number[]>([])
  const [week,  setWeek]  = useState<number|null>(null)
  const [year,  setYear]  = useState<number|null>(null)

   const { selectedHeadlines, loading: loadingSelected, refetch: refetchSelected } = useSelectedHeadlines()
  
  const isRowSelected = (id: string) =>
    selectedHeadlines.some(sh => sh.source_id === id)
  

  const { toast } = useToast()

  const fetchWeekYearOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('topWeeklyCTR')
        .select('week, year')
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
      if (!year && sortedYears.length) setYear(sortedYears[0])
      if (!week && sortedWeeks.length) setWeek(sortedWeeks[0])
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to load week options', variant: 'destructive' })
    }
  }

  const fetchItems = async () => {
    if (week === null || year === null) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('topWeeklyCTR')
        .select('id, headline, brand, platform, position, week, year')
        .eq('week', week)
        .eq('year', year)
        .order('position', { ascending: true })
      if (error) throw error

      setItems(data || [])
    } catch (e) {
      console.error(e)
      toast({ title: 'Error', description: 'Failed to load ads', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const getPlatformColor = (platform: string | null) => {
    if (!platform) return "bg-gray-100 text-gray-800"
    const colors: { [key: string]: string } = {
      MSN: "bg-blue-100 text-blue-800",
      Yahoo: "bg-purple-100 text-purple-800", 
      Fox: "bg-red-100 text-red-800",
      NBC: "bg-green-100 text-green-800",
      AOL: "bg-orange-100 text-orange-800"
    }
    return colors[platform] || "bg-gray-100 text-gray-800"
  }

  useEffect(() => { fetchWeekYearOptions() }, [])
  useEffect(() => { fetchItems() }, [week, year])

  if (loading) return <LoadingSpinner />
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>



  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CTR Potential</h1>
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
          <Button onClick={fetchItems} variant="outline">Refresh</Button>
        </div>
      </div>

      {/* Filter Criteria */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">
              <Target className="w-3 h-3 mr-1" />
              Position 1-5
            </Badge>
            <Badge variant="outline">30-80 Characters</Badge>
            <Badge variant="outline">No $, /, % symbols</Badge>
            <Badge variant="outline">
              <TrendingUp className="w-3 h-3 mr-1" />
              High CTR Potential
            </Badge>
            <Badge variant="outline">Weekly Data</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{items.length}</div>
            <div className="text-sm text-gray-600">Potential Ads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-light">
              {Math.round(items.reduce((acc, item) => acc + (item.headline?.length || 0), 0) / items.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Characters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-dark">
              {new Set(items.map(item => item.platform).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-600">Platforms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {new Set(items.map(item => item.brand).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Brands</div>
          </CardContent>
        </Card>
      </div>

      {/* CTR Potential Table */}
      <Card>
        <CardHeader>
          <CardTitle>High CTR Potential Ads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Characters</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.id}</TableCell>
                  <TableCell>
                    <Badge className={getPlatformColor(item.platform)}>
                      {item.platform || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      #{item.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="font-medium mb-1">
                      "{item.headline || 'No headline'}"
                    </div>
                    <div className="text-xs text-green-600">
                      High CTR Potential
                    </div>
                  </TableCell>
                  <TableCell>{item.brand || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.headline?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SelectButton
                        headline={item.headline || ''}
                        sourceTable="scrape_data"
                        sourceId={item.id}
                        brand={item.brand || undefined}
                        isSelected={isRowSelected(item.id)}
                        onSelectionChange={refetchSelected}
                      />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={fetchItems}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CTRPotential
