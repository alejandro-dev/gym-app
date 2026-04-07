"use client"

import * as React from "react"
import {
   IconActivityHeartbeat,
   IconBarbell,
   IconCalendarStats,
   IconCreditCard,
   IconDashboard,
   IconHelp,
   IconInnerShadowTop,
   IconMessage2Heart,
   IconSearch,
   IconSettings,
   IconUserStar,
   IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/features/navigation/components/nav-documents"
import { NavMain } from "@/features/navigation/components/nav-main"
import { NavSecondary } from "@/features/navigation/components/nav-secondary"
import { NavUser } from "@/features/navigation/components/nav-user"
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
   user: {
      name: "Alex Trainer",
      email: "alex@gymapp.dev",
      avatar: "",
   },
   navMain: [
      {
         title: "Usuarios",
         url: "/users",
         icon: IconUsers,
      },
      {
         title: "Ejercicios",
         url: "/exercises",
         icon: IconBarbell,
      },
      {
         title: "Resumen",
         url: "#",
         icon: IconDashboard,
      },
      {
         title: "Clases",
         url: "#",
         icon: IconCalendarStats,
      },
      {
         title: "Rendimiento",
         url: "#",
         icon: IconActivityHeartbeat,
      },
      {
         title: "Staff",
         url: "#",
         icon: IconUserStar,
      },
   ],
   navSecondary: [
      {
         title: "Configuracion",
         url: "#",
         icon: IconSettings,
      },
      {
         title: "Ayuda",
         url: "#",
         icon: IconHelp,
      },
      {
         title: "Buscar",
         url: "#",
         icon: IconSearch,
      },
   ],
   documents: [
      {
         name: "Planes premium",
         url: "#",
         icon: IconBarbell,
      },
      {
         name: "Cobros del mes",
         url: "#",
         icon: IconCreditCard,
      },
      {
         name: "Feedback socios",
         url: "#",
         icon: IconMessage2Heart,
      },
   ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                     asChild
                     className="data-[slot=sidebar-menu-button]:h-auto data-[slot=sidebar-menu-button]:rounded-2xl data-[slot=sidebar-menu-button]:border data-[slot=sidebar-menu-button]:border-sidebar-border/70 data-[slot=sidebar-menu-button]:bg-sidebar-accent/60 data-[slot=sidebar-menu-button]:p-3!"
                  >
                     <a href="#">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/18 text-primary">
                           <IconInnerShadowTop className="size-5!" />
                        </div>
                        <div className="grid flex-1 text-left">
                           <span className="font-display text-xl leading-none">
                              Iron Pulse
                           </span>
                           <span className="text-xs text-sidebar-foreground/60">
                              Performance club dashboard
                           </span>
                        </div>
                     </a>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarHeader>
         <SidebarContent>
            <NavMain items={data.navMain} />
            <NavDocuments items={data.documents} />
            <NavSecondary items={data.navSecondary} className="mt-auto" />
         </SidebarContent>
         <SidebarFooter>
            <NavUser user={data.user} />
         </SidebarFooter>
      </Sidebar>
   )
}
