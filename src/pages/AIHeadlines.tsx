
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import HeartButton from "@/components/HeartButton"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import { useRegion } from "@/hooks/useRegion"

interface AIGeneratedHeadline {
  id: string
  headline: string
  ai_headline: string
  generated_at: string
}

const GeneratedHeadlines = () => {
  const [aiHeadlines, setAiHeadlines] = useState<AIGeneratedHeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const { region } = useRegion()
  const german = region === 'DE'

  const fetchAIHeadlines = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('allAI')
        .select('id, headline, ai_headline, generated_at')
        .order('generated_at', { ascending: false })

      if (error) throw error
      setAiHeadlines(data || [])

      

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIHeadlines()
  }, [])

  const averageHeadlineLength = aiHeadlines.length > 0
      ? Math.round(
          aiHeadlines
            .map(h => h.ai_headline.length)
            .reduce((sum, len) => sum + len, 0) /
          aiHeadlines.length
          )
        : 0

  const allGeneratedHeadlines = aiHeadlines

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6 bg-[#fafafa] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:20px_20px]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{german ? 'KI-generierte Schlagzeilen' : 'AI Generated Headlines'}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{allGeneratedHeadlines.length}</div>
            <div className="text-sm text-gray-600">{german ? 'Gesamt generiert' : 'Total Generated'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-primary-light">{averageHeadlineLength}</div>
              <div className="text-sm text-gray-600">{german ? 'charaktere' : 'characters'}</div>
            </div>
            <div className="text-sm text-gray-600">{german ? 'Durchschnittliche Länge der KI-Überschrift' : 'Average AI Headline Length'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-dark">
              {new Set(allGeneratedHeadlines.map(h => h.headline)).size}
            </div>
            <div className="text-sm text-gray-600">{german ? 'Einzigartige Originale' : 'Unique Originals'}</div>
          </CardContent>
        </Card>
      </div>

      {/* All Generated Headlines */}
      <Card>
        <CardHeader>
          <CardTitle>{german ? 'Alle generierten Schlagzeilen' : 'All Generated Headlines'}</CardTitle>
        </CardHeader>
        <CardContent>
          {allGeneratedHeadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No headlines generated yet.</p>
              <p className="text-sm mt-2">Go to Headline Generator to create AI-generated headlines.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{german ? 'Generierte Überschrift' : 'Generated Headline'}</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>{german ? 'Generiert' : 'Generated'}</TableHead>
                  <TableHead>{german ? 'Aktionen' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGeneratedHeadlines.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-md">{item.ai_headline}</TableCell>
                    <TableCell className="max-w-sm text-sm text-gray-600">{item.headline}</TableCell>
                    <TableCell>{new Date(item.generated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <HeartButton
                        source_table="selected"
                        id={item.id}
                        ai_headline={item.ai_headline}
                        headline={item.headline}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={fetchAIHeadlines}>
              {german ? 'Schlagzeilen aktualisieren' : 'Refresh Headlines'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeneratedHeadlines
