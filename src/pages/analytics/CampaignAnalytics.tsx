
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Target, Users, Eye, MousePointer } from "lucide-react"

const CampaignAnalytics = () => {
  // Sample campaign data
  const campaignData = [
    { name: 'Weight Loss Campaign', clicks: 2840, impressions: 28400, ctr: 10.0, cost: 1420, platform: 'MSN' },
    { name: 'Finance Solutions', clicks: 2180, impressions: 21800, ctr: 10.0, cost: 1090, platform: 'Yahoo' },
    { name: 'Tech Products', clicks: 1950, impressions: 19500, ctr: 10.0, cost: 975, platform: 'Fox' },
    { name: 'Health Supplements', clicks: 1720, impressions: 17200, ctr: 10.0, cost: 860, platform: 'NBC' },
    { name: 'Travel Deals', clicks: 1450, impressions: 14500, ctr: 10.0, cost: 725, platform: 'AOL' },
  ]

  const platformDistribution = [
    { name: 'MSN', value: 35, color: '#3b82f6' },
    { name: 'Yahoo', value: 25, color: '#8b5cf6' },
    { name: 'Fox', value: 20, color: '#ef4444' },
    { name: 'NBC', value: 12, color: '#10b981' },
    { name: 'AOL', value: 8, color: '#f59e0b' },
  ]

  const performanceMetrics = [
    { metric: 'Total Clicks', value: '10,140', change: '+15%', icon: MousePointer, color: 'text-blue-600' },
    { metric: 'Total Impressions', value: '101,400', change: '+12%', icon: Eye, color: 'text-green-600' },
    { metric: 'Average CTR', value: '10.0%', change: '+8%', icon: Target, color: 'text-purple-600' },
    { metric: 'Active Campaigns', value: '5', change: '+1', icon: Users, color: 'text-orange-600' },
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed performance analysis of your advertising campaigns</p>
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="msn">MSN</SelectItem>
              <SelectItem value="yahoo">Yahoo</SelectItem>
              <SelectItem value="fox">Fox</SelectItem>
              <SelectItem value="nbc">NBC</SelectItem>
              <SelectItem value="aol">AOL</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="7d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.metric}</div>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
              <div className="text-xs text-green-600 mt-2">{metric.change} from last period</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Distribution by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {platformDistribution.map((entry, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}: {entry.value}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.map((campaign, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{campaign.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlatformColor(campaign.platform)}>
                      {campaign.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {campaign.ctr}%
                    </Badge>
                  </TableCell>
                  <TableCell>${campaign.cost.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={index < 2 ? "bg-green-100 text-green-800" : index < 4 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}>
                      {index < 2 ? "Excellent" : index < 4 ? "Good" : "Average"}
                    </Badge>
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

export default CampaignAnalytics
