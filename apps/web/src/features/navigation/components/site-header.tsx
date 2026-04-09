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
   "/exercises": {
      title: "Gestion de ejercicios",
      description: "Consulta, organiza y administra los ejercicios del gimnasio",
   },
}

export function SiteHeader() {
   const pathname = usePathname()
   const copy = ROUTE_COPY[pathname] ?? {
      title: "Panel de gestion",
      description: "Administra las secciones privadas de la aplicacion",
   }

   return (
      <header className="sticky top-0 z-20 flex min-h-20 shrink-0 items-center gap-2 border-b border-border/60 bg-background/75 py-2 backdrop-blur-xl transition-[width,height] ease-linear md:min-h-24">
         <div className="flex h-full w-full items-center gap-5 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1 rounded-xl border border-border/70 bg-card shadow-sm" />
            <Separator
               orientation="vertical"
               className="mx-3 self-stretch data-[orientation=vertical]:h-auto"
            />
            <div className="min-w-0 space-y-1.5 py-0.5">
               <p className="font-display text-2xl leading-tight text-foreground">
                  {copy.title}
               </p>
               <p className="hidden text-sm leading-relaxed text-muted-foreground sm:block">
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
