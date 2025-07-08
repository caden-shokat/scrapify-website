
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/integrations/supabase/client"
import { TrendingUp, Target, Sparkles } from "lucide-react"

interface CTRData {
  Headline: string | null
  Brand: string | null
  Platform: string | null
  Position: number | null
  Week: number | null
  ctrScore?: number
  prediction?: string
}

const CTRPrediction = () => {
  const [ctrData, setCtrData] = useState<CTRData[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCTRData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('High Potential CTR')
        .select('*')
        .order('Week', { ascending: false })
        .limit(20)

      if (error) throw error
      setCtrData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const generateCTRPredictions = async () => {
    setAnalyzing(true)
    
    // Simulate AI CTR prediction
    setTimeout(() => {
      setCtrData(prev => prev.map(item => ({
        ...item,
        ctrScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        prediction: Math.random() > 0.5 ? 'High Potential' : 'Moderate Potential'
      })))
      setAnalyzing(false)
    }, 3000)
  }

  useEffect(() => {
      fetchCTRData()
    }, [])

  const getCTRScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getPredictionColor = (prediction: string) => {
    return prediction === 'High Potential' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CTR Prediction</h1>
        <p className="text-gray-600 mt-1">AI-powered click-through rate predictions</p>
      </div>

      {/* Action Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                <Target className="w-3 h-3 mr-1" />
                {ctrData.length} High Potential Ads
              </Badge>
              <Badge variant="outline">
                <TrendingUp className="w-3 h-3 mr-1" />
                {ctrData.filter(item => item.ctrScore).length} Analyzed
              </Badge>
            </div>
            <Button 
              onClick={generateCTRPredictions}
              disabled={analyzing}
              className="bg-primary hover:bg-primary-light"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {analyzing ? 'Analyzing...' : 'Generate CTR Predictions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTR Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>CTR Prediction Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Headline</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Week</TableHead>
                <TableHead>CTR Score</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ctrData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="max-w-md">
                    <div className="font-medium">
                      "{item.Headline || 'No headline'}"
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.Headline?.length || 0} characters
                    </div>
                  </TableCell>
                  <TableCell>{item.Brand || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge className={getPlatformColor(item.Platform)}>
                      {item.Platform || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      #{item.Position || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Week {item.Week || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.ctrScore ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${getCTRScoreColor(item.ctrScore)}`}>
                            {item.ctrScore}/100
                          </span>
                        </div>
                        <Progress value={item.ctrScore} className="h-2 w-20" />
                      </div>
                    ) : (
                      <span className="text-gray-400">Not analyzed</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.prediction ? (
                      <Badge className={getPredictionColor(item.prediction)}>
                        {item.prediction}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={fetchCTRData}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CTRPrediction
