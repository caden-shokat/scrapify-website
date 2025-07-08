
import { Home, Database, Sparkle, TableProperties, BarChart, Image, Heart, Cpu, TrendingUp, Box, Filter } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
]

const adIntelligenceItems = [
  { title: "Scrape Data", url: "/ad-intelligence/scrape-data", icon: Database },
  { title: "Anstrex Data", url: "/ad-intelligence/anstrex-data", icon: TableProperties },
  // { title: "Top 20 - Headlines", url: "/ad-intelligence/top-headlines", icon: FileText },
  { title: "Top Images", url: "/ad-intelligence/top-images", icon: Image },
  { title: "CTR Potential", url: "/ad-intelligence/ctr-potential", icon: Filter },
]

const aiStudioItems = [
  { title: "Headline Generator", url: "/ai-studio/headline-generator", icon: Sparkle },
  { title: "Top Headlines", url: "/ai-studio/top-ai-headlines", icon: Cpu },
  { title: "Image Classifier - Beta", url: "/ai-studio/image-classifier", icon: Image },
  //{ title: "CTR Prediction - Beta", url: "/ai-studio/ctr-prediction", icon: BarChart },
]

const reportsItems = [
  { title: "Weekly Report", url: "/reports/performance", icon: BarChart },
  { title: "Trend Analysis", url: "/reports/trends", icon: TrendingUp },
]

const analyticsItems = [
  { title: "Campaign - Beta", url: "/analytics/campaigns", icon: BarChart },
  { title: "Competitive - Beta", url: "/analytics/competitive", icon: BarChart },
]

const favoritesItems = [
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Stored AI Headlines", url: "/ai-headlines", icon: Box }
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-gray-600 font-medium border-r-2 border-primary" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"

  return (
    <Sidebar
      className={`top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${collapsed ? "w-14" : "w-64"} border-r border-sidebar-border bg-sidebar`}
      collapsible="icon"
    >
      <SidebarContent className="p-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`text-[#127846] h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ad Intelligence Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-gray-500">Ad Intelligence</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {adIntelligenceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`text-[#127846] h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Studio Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-gray-500">AI Studio</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {aiStudioItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`text-[#127846] h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-gray-500">Reports</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`text-[#127846] h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        {/*<SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-gray-500">Analytics</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`text-[#127846] h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
                        */}

        {/* Favorites Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-gray-500">Favorites</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {favoritesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`text-[#127846] h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}
