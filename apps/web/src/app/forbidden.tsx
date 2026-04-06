import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
   return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
         <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Access denied</h1>
            <p className="max-w-md text-sm text-muted-foreground">
               You do not have permission to access this page.
            </p>
         </div>
         <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
         </Button>
      </div>
   );
}
