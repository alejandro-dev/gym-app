import { AppSidebar } from "@/features/navigation/components/app-sidebar"
import { SiteHeader } from "@/features/navigation/components/site-header"
import {
   SidebarInset,
   SidebarProvider,
} from "@/components/ui/sidebar"

export default function ProtectedLayout({
   children,
}: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <SidebarProvider
         style={
            {
               "--sidebar-width": "calc(var(--spacing) * 72)",
               "--header-height": "calc(var(--spacing) * 16)",
            } as React.CSSProperties
         }
      >
         <AppSidebar variant="inset" />
         <SidebarInset className="dashboard-shell">
            <SiteHeader />
            <div className="flex flex-1 flex-col">
               <div className="@container/main flex flex-1 flex-col gap-2">
                  {children}
               </div>
            </div>
         </SidebarInset>
      </SidebarProvider>
   )
}
