
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import LogoutButton from '@/components/LogoutButton'
import HelpButton from '@/components/HelpButton'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-white">
        {/* Full-width header with branding */}
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between border-b border-gray-200 bg-white px-6 w-full">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-gray-600 hover:text-primary" />
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <img
                src="../Scrapify_logo.png"
                alt="Logo"
                className="h-11 w-11 rounded-full border border-gray-200"
              />
              <div>
                <h1 className="font-bold text-xl text-gray-900">Scrapify</h1>
                <p className="text-xs text-gray-600">Ad Intelligence Suite</p>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-200 ml-4" />
            <span className="text-sm text-gray-500"></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex justify-center items-center gap-2">
                <HelpButton />
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 w-full">
          <AppSidebar />
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
