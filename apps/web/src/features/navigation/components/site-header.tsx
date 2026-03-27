"use client"

import { IconBellRinging } from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const ROUTE_COPY: Record<string, { title: string; description: string }> = {
   "/dashboard": {
      title: "Dashboard de rendimiento",
      description: "Vista diaria de socios, clases y conversion del club",
   },
   "/users": {
      title: "Gestion de usuarios",
      description: "Consulta, organiza y administra a los socios del gimnasio",
   },
}

export function SiteHeader() {
   const pathname = usePathname()
   const copy = ROUTE_COPY[pathname] ?? {
      title: "Panel de gestion",
      description: "Administra las secciones privadas de la aplicacion",
   }

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
                  {copy.title}
               </p>
               <p className="hidden text-sm text-muted-foreground sm:block">
                  {copy.description}
               </p>
            </div>
            <div className="ml-auto flex items-center">
               <Button variant="outline" size="icon-sm" className="rounded-full">
                  <IconBellRinging />
                  <span className="sr-only">Notificaciones</span>
               </Button>
            </div>
         </div>
      </header>
   )
}
