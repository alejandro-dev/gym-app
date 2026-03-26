import { IconArrowUpRight, IconBellRinging } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
   return (
      <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 bg-background/75 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
         <div className="flex w-full items-center gap-2 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1 rounded-xl border border-border/70 bg-card shadow-sm" />
            <Separator
               orientation="vertical"
               className="mx-2 data-[orientation=vertical]:h-4"
            />
            <div className="min-w-0">
               <p className="font-display text-2xl leading-none text-foreground">
                  Dashboard de rendimiento
               </p>
               <p className="hidden text-sm text-muted-foreground sm:block">
                  Vista diaria de socios, clases y conversion del club
               </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
               <div className="hidden rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground md:flex">
                  Ocupacion actual
                  <span className="ml-2 text-foreground">78%</span>
               </div>
               <Button variant="outline" size="icon-sm" className="rounded-full">
                  <IconBellRinging />
                  <span className="sr-only">Notificaciones</span>
               </Button>
               <Button size="sm" className="rounded-full px-4 shadow-lg shadow-primary/20">
                  Ver reservas
                  <IconArrowUpRight />
               </Button>
            </div>
         </div>
      </header>
   )
}
