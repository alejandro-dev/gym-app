"use client"

import * as React from "react"
import {
   IconBarbell,
   IconInnerShadowTop,
   IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/features/navigation/components/nav-main"
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
   navMainAdmin: [
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
   ],
   navMainCoach: [
      {
         title: "Atletas",
         url: "/athletes",
         icon: IconUsers,
      },
      {
         title: "Ejercicios",
         url: "/exercises",
         icon: IconBarbell,
      },
   ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
   user: {
      firstName: string | null
      lastName: string | null
      email: string
      role: "USER" | "ADMIN" | "COACH"
   }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
   // Si el usuario no tiene ni nombre ni apellido, se muestra su email como nombre
   const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

   // Obtenemos el texto que se mostrará en la barra lateral para indicar el rol del usuario
   const roleLabel =
      user.role === "ADMIN"
         ? "Administrador"
         : user.role === "COACH"
            ? "Coach"
            : "Usuario"

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
                              GymApp
                           </span>
                           <span className="text-xs text-sidebar-foreground/60">
                              Perfil del {roleLabel}
                           </span>
                        </div>
                     </a>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarHeader>
         <SidebarContent>
            <NavMain items={user.role === "ADMIN" ? data.navMainAdmin : data.navMainCoach} />
         </SidebarContent>
         <SidebarFooter>
            <NavUser
               user={{
                  name: displayName,
                  email: user.email,
                  avatar: "",
               }}
            />
         </SidebarFooter>
      </Sidebar>
   )
}
