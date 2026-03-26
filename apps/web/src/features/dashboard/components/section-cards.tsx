import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
   Card,
   CardAction,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
   return (
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:overflow-hidden *:data-[slot=card]:border-border/70 *:data-[slot=card]:bg-linear-to-br *:data-[slot=card]:from-card *:data-[slot=card]:via-card *:data-[slot=card]:to-primary/5 *:data-[slot=card]:shadow-lg *:data-[slot=card]:shadow-black/5 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:shadow-black/20">
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Ingresos mensuales</CardDescription>
               <CardTitle className="font-display text-4xl tabular-nums @[250px]/card:text-5xl">
                  18.240 €
               </CardTitle>
               <CardAction>
                  <Badge variant="outline" className="rounded-full bg-background/80">
                     <IconTrendingUp />
                     +14.8%
                  </Badge>
               </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  Mejor semana del trimestre <IconTrendingUp className="size-4" />
               </div>
               <div className="text-muted-foreground">Cuotas y renovaciones activas</div>
            </CardFooter>
         </Card>
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Nuevas altas</CardDescription>
               <CardTitle className="font-display text-4xl tabular-nums @[250px]/card:text-5xl">
                  126
               </CardTitle>
               <CardAction>
                  <Badge variant="outline" className="rounded-full bg-background/80">
                     <IconTrendingUp />
                     +8.2%
                  </Badge>
               </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  Campana de prueba en buen ritmo <IconTrendingUp className="size-4" />
               </div>
               <div className="text-muted-foreground">Conversión desde leads y referrals</div>
            </CardFooter>
         </Card>
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Socios activos</CardDescription>
               <CardTitle className="font-display text-4xl tabular-nums @[250px]/card:text-5xl">
                  842
               </CardTitle>
               <CardAction>
                  <Badge variant="outline" className="rounded-full bg-background/80">
                     <IconTrendingUp />
                     +5.4%
                  </Badge>
               </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  Retención por encima del objetivo <IconTrendingUp className="size-4" />
               </div>
               <div className="text-muted-foreground">Pases y recurrencia de entrenamiento</div>
            </CardFooter>
         </Card>
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Asistencia media</CardDescription>
               <CardTitle className="font-display text-4xl tabular-nums @[250px]/card:text-5xl">
                  91%
               </CardTitle>
               <CardAction>
                  <Badge variant="outline" className="rounded-full bg-background/80">
                     <IconTrendingDown />
                     -1.2%
                  </Badge>
               </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  Sábado por revisar <IconTrendingDown className="size-4" />
               </div>
               <div className="text-muted-foreground">Clases de fuerza y funcional a tope</div>
            </CardFooter>
         </Card>
      </div>
   )
}
