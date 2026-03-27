"use client"

import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
   items,
}: {
   items: {
      title: string
      url: string
      icon?: React.ComponentType<{ className?: string }>
      items?: {
         title: string
         url: string
      }[]
   }[]
}) {
   return (
      <SidebarGroup>
         <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
         <SidebarMenu>
            {items.map((item) => (
               <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                     <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                     </a>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                     <SidebarMenuSub>
                        {item.items.map((subItem) => (
                           <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                 <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                 </a>
                              </SidebarMenuSubButton>
                           </SidebarMenuSubItem>
                        ))}
                     </SidebarMenuSub>
                  ) : null}
               </SidebarMenuItem>
            ))}
         </SidebarMenu>
      </SidebarGroup>
   )
}
