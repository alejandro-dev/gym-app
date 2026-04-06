"use client";

import { Button } from "@/components/ui/button";

type ProtectedErrorProps = {
   error: Error & { digest?: string };
   reset: () => void;
};

export default function ProtectedError({
   error,
   reset,
}: ProtectedErrorProps) {
   return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
         <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
               Something went wrong
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
               {error.message || "We could not load this section right now."}
            </p>
         </div>
         <Button onClick={reset}>Try again</Button>
      </div>
   );
}
