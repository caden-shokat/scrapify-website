import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import TimeFilterDropdown from "@/components/TimeFilterDropdown"
import HeartButton from "@/components/HeartButton"
import SelectButton from "@/components/SelectButton"
import { useSelectedHeadlines } from "@/hooks/useSelectedHeadlines"

interface TopHeadline {
  headline: string | null
  frequency: number | null
  id: string | null
}

const generateCryptoId = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("")
}

const TopHeadlines = () => {
  const [topHeadlines, setTopHeadlines] = useState<TopHeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    fetchTopHeadlines()
  }, [timeFilter])

  const { selectedHeadlines, loading: loadingSelected, refetch: refetchSelected } = useSelectedHeadlines()
  
    const isRowSelected = (id: string) =>
      selectedHeadlines.some(sh => sh.source_id === id)

  const fetchTopHeadlines = async () => {
    try {
      setLoading(true)
      
      // Calculate date range based on filter
      const now = new Date()
      let startDate: Date
      
      switch (timeFilter) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }

      // Get data from Scrape Data table and aggregate by headline
      const { data: scrapeData, error: scrapeError } = await supabase
        .from('Scrape Data')
        .select('headline')
        .gte('date', startDate.toISOString())
        .not('headline', 'is', null)

      if (scrapeError) throw scrapeError

      // Filter headlines by length (30-80 characters)
      const filteredData = scrapeData?.filter(item => 
        item.headline && item.headline.length >= 30 && item.headline.length <= 80
      ) || []

      // Aggregate headlines by frequency
      const headlineFreq: { [key: string]: number } = {}
      filteredData.forEach(item => {
        if (item.headline) {
          headlineFreq[item.headline] = (headlineFreq[item.headline] || 0) + 1
        }
      })

      // Convert to array and sort by frequency
      const aggregated = Object.entries(headlineFreq)
        .map(([headline, frequency]) => ({ headline: headline, frequency, id: generateCryptoId(), }))
        .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
        .slice(0, 20)

      setTopHeadlines(aggregated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Top 20 - Headlines</h1>
          <p className="text-gray-600 mt-1">Most frequent headlines (30-80 characters)</p>
        </div>
        
        <TimeFilterDropdown value={timeFilter} onValueChange={setTimeFilter} />
      </div>

      {/* Filter Criteria */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">Character Range: 30-80</Badge>
            <Badge variant="outline">Sorted by Frequency</Badge>
            <Badge variant="outline">{timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} Data</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Headlines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Headlines ({timeFilter})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Characters</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topHeadlines.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <span className="text-lg font-bold text-primary">#{index + 1}</span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="font-medium">
                      "{item.headline || 'No headline'}"
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      High-performing • Multi-platform
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary">
                      {item.frequency || 0} occurrences
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.headline?.length || 0} chars
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SelectButton
                      headline={item.headline || ''}
                      sourceTable="topWeeklyHeadlines"
                      isSelected={isRowSelected(item.id)}
                      onSelectionChange={refetchSelected}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={fetchTopHeadlines}>
              Refresh Headlines
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TopHeadlines
