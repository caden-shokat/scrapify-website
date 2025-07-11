
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { supabase } from "@/integrations/supabase/client"
import LoadingSpinner from "@/components/LoadingSpinner"
import SelectButton from "@/components/SelectButton"
import { ArrowUpRight } from "lucide-react"
import { useSelectedHeadlines } from "@/hooks/useSelectedHeadlines"
import { FormatNumber } from "@/utils/FormatNumber"

interface ScrapeDataItem {
  id: string
  date: string | null
  position: number | null
  headline: string | null
  ad_url: string | null
  image_url: string | null
  brand: string | null
  platform: string | null
}

const ScrapeData = () => {
  const [scrapeData, setScrapeData] = useState<ScrapeDataItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 50

  const { selectedHeadlines, loading: loadingSelected, refetch: refetchSelected } = useSelectedHeadlines()

  const isRowSelected = (id: string) =>
    selectedHeadlines.some(sh => sh.source_id === id)

  useEffect(() => {
    fetchScrapeData()
  }, [currentPage])

  const fetchScrapeData = async () => {
    try {
      setLoading(true)
      
      const { count, error: countError } = await supabase
        .from('Scrape Data')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError
      setTotalCount(count || 0)

      const { data, error } = await supabase
        .from('Scrape Data')
        .select('*')
        .order('date', { ascending: false })
        .order('position', {ascending: false})
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (error) throw error
      setScrapeData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scrape Data</h1>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{FormatNumber(totalCount)}</div>
            <div className="text-sm text-gray-600">Total Ads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-light">
              5
            </div>
            <div className="text-sm text-gray-600">Platforms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-dark">
              {new Set(scrapeData.map(item => item.brand).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-600">Brands</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              Page {currentPage} of {totalPages}
            </div>
            <div className="text-sm text-gray-600">Current Page</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Ad Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scrapeData.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">{item.id}</TableCell>
                  <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getPlatformColor(item.platform)}>
                      {item.platform || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.position || 'N/A'}</TableCell>
                  <TableCell className="max-w-md whitespace-normal break-words" title={item.headline}>
                    {item.headline || 'No headline'}
                  </TableCell>
                  <TableCell>{item.brand || 'Unknown'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <SelectButton
                        headline={item.headline || ''}
                        sourceTable="scrape_data"
                        sourceId={item.id}
                        brand={item.brand || undefined}
                        isSelected={isRowSelected(item.id)}
                        onSelectionChange={refetchSelected}

                      />
                      {item.ad_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.ad_url} target="_blank" rel="noopener noreferrer">
                            <ArrowUpRight className="w-6 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button onClick={fetchScrapeData}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScrapeData
