import { ChartAreaInteractive } from "@/features/dashboard/components/chart-area-interactive"
import { DataTable } from "@/features/dashboard/components/data-table"
import { SectionCards } from "@/features/dashboard/components/section-cards"

import data from "@/features/dashboard/data/dashboard-data.json"

export default function Page() {
   return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
         <SectionCards />
         <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
         </div>
         <DataTable data={data} />
      </div>
   )
}
