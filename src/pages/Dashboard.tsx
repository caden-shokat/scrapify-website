
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { Activity, Database, FileText, Image, TrendingUp, Users, Clock } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"

interface DashboardStats {
  totalScrapeData: number
  totalAnstrexData: number
  totalTopHeadlines: number
  totalFavorites: number
  todaysScrapes: number
  avgFrequency: number
}

function calculateNextScrape(now: Date) {
  const startHour = 9, endHour = 17, markMin = 30

  const todayStart = new Date(now)
  todayStart.setHours(startHour, markMin, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(endHour, markMin, 0, 0)

  if (now < todayStart) {
    return { type: "before", next: todayStart }
  }
  if (now >= todayEnd) {
    return { type: "after", next: null }
  }

  const thisMark = new Date(now)
  thisMark.setMinutes(markMin, 0, 0)
  if (now < thisMark) {
    return { type: "running", next: thisMark }
  }
  const nextMark = new Date(now)
  nextMark.setHours(now.getHours() + 1, markMin, 0, 0)
  if (nextMark > todayEnd) {
    return { type: "after", next: null }
  }
  return { type: "running", next: nextMark }
}


const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalScrapeData: 0,
    totalAnstrexData: 0,
    totalTopHeadlines: 0,
    totalFavorites: 0,
    todaysScrapes: 0,
    avgFrequency: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentHeadlines, setRecentHeadlines] = useState<any[]>([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [scrapeData, anstrexData, topHeadlines, favorites] = await Promise.all([
        supabase.from('Scrape Data').select('*', { count: 'exact' }),
        supabase.from('Anstrex Data').select('*', { count: 'exact' }),
        supabase.from('Top 20').select('*', { count: 'exact' }),
        supabase.from('favorites').select('*', { count: 'exact' })
      ])

      const today = new Date().toISOString().split('T')[0]
      const { count: todayCount } = await supabase
        .from('Scrape Data')
        .select('*', { count: 'exact' })
        .gte('Date', today)

      const { data: frequencyData } = await supabase
        .from('Top 20')
        .select('frequency')

      const avgFreq = frequencyData?.length 
        ? frequencyData.reduce((acc, curr) => acc + (curr.frequency || 0), 0) / frequencyData.length
        : 0

      const { data: recentData } = await supabase
        .from('Scrape Data')
        .select('Headline, Brand, Date, Platform')
        .order('Date', { ascending: false })
        .limit(10)

      setStats({
        totalScrapeData: scrapeData.count || 0,
        totalAnstrexData: anstrexData.count || 0,
        totalTopHeadlines: topHeadlines.count || 0,
        totalFavorites: favorites.count || 0,
        todaysScrapes: todayCount || 0,
        avgFrequency: Math.round(avgFreq)
      })

      setRecentHeadlines(recentData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

   const [countdown, setCountdown] = useState<{ label: string; time?: string }>({
    label: "--", 
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const { type, next } = calculateNextScrape(now)

      if (type === "before" && next) {
        const diff = next.getTime() - now.getTime()
        const mins = String(Math.floor(diff / 60000)).padStart(2, "0")
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")
        setCountdown({ label: "Scrapers start in", time: `${mins}:${secs}` })
      }
      else if (type === "after") {
        setCountdown({ label: "All done for the day" })
      }
      else if (type === "running" && next) {
        const diff = next.getTime() - now.getTime()
        const mins = String(Math.floor(diff / 60000)).padStart(2, "0")
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")
        setCountdown({ label: "Next scrape in", time: `${mins}:${secs}` })
      }
    }

    tick()
    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [])

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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scraped Ads</CardTitle>
            <Database className="text-[#127846] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScrapeData.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todaysScrapes} scraped today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anstrex Data</CardTitle>
            <Activity className="text-[#127846] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnstrexData.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              High-performing ads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Headlines</CardTitle>
            <FileText className="text-[#127846] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTopHeadlines}</div>
            <p className="text-xs text-muted-foreground">
              Avg frequency: {stats.avgFrequency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <TrendingUp className="text-[#127846] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">
              Saved items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <Users className="text-[#127846] h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaysScrapes}</div>
            <p className="text-xs text-muted-foreground">
              New ads today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Until Next Scrape</CardTitle>
            <Clock className="text-[#127846] h-4 w-4" />
          </CardHeader>
          <CardContent>
            {countdown.time ? (
              <>
                <div className="text-2xl font-bold">{countdown.time}</div>
                <div className="text-xs text-gray-600 mb-1">{countdown.label}</div>
              </>
            ) : (
              <div className="text-2xl font-bold">{countdown.label}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Headlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentHeadlines.map((headline, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">"{headline.Headline}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    {headline.Brand && <Badge variant="outline">{headline.Brand}</Badge>}
                    {headline.Platform && <Badge variant="secondary" className={getPlatformColor(headline.Platform)}>{headline.Platform}</Badge>}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {headline.Date ? new Date(headline.Date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
