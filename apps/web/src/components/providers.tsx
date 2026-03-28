"use client"

import { QueryProvider } from "@/components/query-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryProvider>
			<TooltipProvider delayDuration={0}>
				{children}
				<Toaster />
			</TooltipProvider>
		</QueryProvider>
	)
}
