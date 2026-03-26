"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
   SidebarGroup,
   SidebarGroupContent,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
   items,
}: {
   items: {
      title: string
      url: string
      icon?: Icon
   }[]
}) {
   return (
      <SidebarGroup>
         <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
               <SidebarMenuItem className="flex items-center gap-2">
                  <SidebarMenuButton
                     tooltip="Nueva reserva"
                     className="min-w-8 bg-primary text-primary-foreground shadow-lg shadow-primary/20 duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                  >
                     <IconCirclePlusFilled />
                     <span>Nueva reserva</span>
                  </SidebarMenuButton>
                  <Button
                     size="icon"
                     className="size-8 group-data-[collapsible=icon]:opacity-0"
                     variant="outline"
                  >
                     <IconMail />
                     <span className="sr-only">Mensajes</span>
                  </Button>
               </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
               {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               ))}
            </SidebarMenu>
         </SidebarGroupContent>
      </SidebarGroup>
   )
}
