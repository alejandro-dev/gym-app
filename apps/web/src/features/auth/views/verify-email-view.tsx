"use client";

import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { useAuthVerifyEmail } from "@/features/auth/hooks/use-auth-verify-email";

type VerifyEmailViewProps = {
   token?: string;
};

export function VerifyEmailView({ token }: VerifyEmailViewProps) {
   const { Link, goToLogin, loginHref, registerHref, status } =
      useAuthVerifyEmail(token);

   return (
      <Card>
         <CardHeader>
            <CardTitle>{status.title}</CardTitle>
            <CardDescription>{status.description}</CardDescription>
         </CardHeader>
         <CardContent>
            {status.type === "loading" ? (
               <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                  <span>Checking verification token...</span>
               </div>
            ) : null}
         </CardContent>
         <CardFooter className="flex flex-col gap-3">
            {status.type === "success" ? (
               <Button className="w-full" onClick={goToLogin}>
                  Go to login
               </Button>
            ) : null}

            {status.type === "error" ? (
               <>
                  <Button asChild className="w-full">
                     <Link href={registerHref}>Create another account</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                     <Link href={loginHref}>Back to login</Link>
                  </Button>
               </>
            ) : null}
         </CardFooter>
      </Card>
   );
}
