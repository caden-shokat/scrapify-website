
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Search, TrendingUp, Shield, Zap } from "lucide-react"

const CompetitiveAnalysis = () => {
  // Sample competitive data
  const competitorData = [
    { 
      brand: 'Weight Loss Pro', 
      adVolume: 2850, 
      estimatedBudget: 14250, 
      topPlatforms: ['MSN', 'Yahoo'], 
      strength: 92,
      category: 'Weight Loss'
    },
    { 
      brand: 'Finance Expert', 
      adVolume: 2240, 
      estimatedBudget: 11200, 
      topPlatforms: ['Yahoo', 'Fox'], 
      strength: 87,
      category: 'Finance'
    },
    { 
      brand: 'Tech Solutions', 
      adVolume: 1980, 
      estimatedBudget: 9900, 
      topPlatforms: ['Fox', 'NBC'], 
      strength: 83,
      category: 'Technology'
    },
    { 
      brand: 'Health First', 
      adVolume: 1650, 
      estimatedBudget: 8250, 
      topPlatforms: ['NBC', 'AOL'], 
      strength: 78,
      category: 'Health'
    },
    { 
      brand: 'Travel Deals', 
      adVolume: 1320, 
      estimatedBudget: 6600, 
      topPlatforms: ['AOL', 'MSN'], 
      strength: 72,
      category: 'Travel'
    },
  ]

  const competitiveMetrics = [
    { subject: 'Ad Volume', yourScore: 85, competitor: 92 },
    { subject: 'Platform Coverage', yourScore: 78, competitor: 85 },
    { subject: 'Creative Diversity', yourScore: 88, competitor: 76 },
    { subject: 'Targeting Precision', yourScore: 82, competitor: 89 },
    { subject: 'Budget Efficiency', yourScore: 91, competitor: 83 },
    { subject: 'Market Share', yourScore: 75, competitor: 88 },
  ]

  const topCompetitorAds = [
    { headline: 'Lose 20 Pounds in 30 Days', brand: 'Weight Loss Pro', platform: 'MSN', estimated_ctr: 12.5 },
    { headline: 'Free Investment Consultation', brand: 'Finance Expert', platform: 'Yahoo', estimated_ctr: 11.8 },
    { headline: 'Revolutionary Tech Solution', brand: 'Tech Solutions', platform: 'Fox', estimated_ctr: 11.2 },
    { headline: 'Natural Health Supplements', brand: 'Health First', platform: 'NBC', estimated_ctr: 10.9 },
    { headline: 'Exclusive Travel Packages', brand: 'Travel Deals', platform: 'AOL', estimated_ctr: 10.5 },
  ]

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      MSN: "bg-blue-100 text-blue-800",
      Yahoo: "bg-purple-100 text-purple-800", 
      Fox: "bg-red-100 text-red-800",
      NBC: "bg-green-100 text-green-800",
      AOL: "bg-orange-100 text-orange-800"
    }
    return colors[platform] || "bg-gray-100 text-gray-800"
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Weight Loss': "bg-green-100 text-green-800",
      'Finance': "bg-blue-100 text-blue-800",
      'Technology': "bg-purple-100 text-purple-800",
      'Health': "bg-orange-100 text-orange-800",
      'Travel': "bg-pink-100 text-pink-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitive Analysis</h1>
          <p className="text-gray-600 mt-1">Monitor competitor strategies and market positioning</p>
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="weight-loss">Weight Loss</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Search className="w-4 h-4 mr-2" />
            Deep Analysis
          </Button>
        </div>
      </div>

      {/* Competitive Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">15</div>
                <div className="text-sm text-gray-600">Active Competitors</div>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-xs text-blue-600 mt-2">+3 new this month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary-light">$2.1M</div>
                <div className="text-sm text-gray-600">Market Spend</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-xs text-green-600 mt-2">+15% vs last month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary-dark">8.2%</div>
                <div className="text-sm text-gray-600">Your Market Share</div>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-xs text-yellow-600 mt-2">Growing steadily</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">85%</div>
                <div className="text-sm text-gray-600">Competitive Score</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Strong</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitive Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Competitive Positioning</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={competitiveMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={0} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Your Performance"
                  dataKey="yourScore"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Top Competitor"
                  dataKey="competitor"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Your Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Top Competitor</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ad Volume Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Competitor Ad Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={competitorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="brand" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="adVolume" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Competitors Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Ad Volume</TableHead>
                <TableHead>Est. Budget</TableHead>
                <TableHead>Top Platforms</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitorData.map((competitor, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{competitor.brand}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(competitor.category)}>
                      {competitor.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{competitor.adVolume.toLocaleString()}</TableCell>
                  <TableCell>${competitor.estimatedBudget.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {competitor.topPlatforms.map((platform, i) => (
                        <Badge key={i} className={getPlatformColor(platform)} variant="outline">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${competitor.strength}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{competitor.strength}%</span>
                    </div>
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
        </CardContent>
      </Card>

      {/* Top Competitor Ads */}
      <Card>
        <CardHeader>
          <CardTitle>Top Competitor Headlines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Headline</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Est. CTR</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCompetitorAds.map((ad, index) => (
                <TableRow key={index}>
                  <TableCell className="max-w-md">
                    <div className="font-medium">"{ad.headline}"</div>
                  </TableCell>
                  <TableCell>{ad.brand}</TableCell>
                  <TableCell>
                    <Badge className={getPlatformColor(ad.platform)}>
                      {ad.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {ad.estimated_ctr}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Analyze
                      </Button>
                      <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                        Adapt
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompetitiveAnalysis
