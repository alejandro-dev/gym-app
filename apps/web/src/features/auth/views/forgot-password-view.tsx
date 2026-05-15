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
import {
   Field,
   FieldDescription,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password.schema";
import { forgotPassword } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

const FORGOT_PASSWORD_ERROR_MESSAGES: StatusMessageMap = {
   400: "Enter a valid email address.",
   429: "Too many reset attempts. Please wait a few minutes and try again.",
   503: "The password reset service is temporarily unavailable.",
};

export function ForgotPasswordView() {
   const [email, setEmail] = useState("");
   const [validationError, setValidationError] = useState<string | null>(null);

   const mutation = useMutation({
      mutationFn: forgotPassword,
   });

   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const result = forgotPasswordSchema.safeParse({ email });

      if (!result.success) {
         setValidationError(result.error.issues[0]?.message ?? "Enter a valid email.");
         return;
      }

      setValidationError(null);
      mutation.mutate({ email: result.data.email });
   }

   const errorMessage = mutation.isError
      ? getStatusErrorMessage(
           mutation.error,
           FORGOT_PASSWORD_ERROR_MESSAGES,
           "We couldn't request a password reset. Please try again.",
        )
      : null;

   return (
      <Card>
         <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
               Enter your email and we will send you a secure link to create a new password.
            </CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="email">Email</FieldLabel>
                     <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={mutation.isPending || mutation.isSuccess}
                        placeholder="m@example.com"
                        required
                     />
                     {validationError ? (
                        <FieldDescription className="text-destructive">
                           {validationError}
                        </FieldDescription>
                     ) : null}
                  </Field>
                  {errorMessage ? (
                     <FieldDescription className="text-destructive">
                        {errorMessage}
                     </FieldDescription>
                  ) : null}
                  {mutation.isSuccess ? (
                     <FieldDescription>
                        {mutation.data.message ??
                           "If the account exists, reset instructions have been sent."}
                     </FieldDescription>
                  ) : null}
                  <Button
                     type="submit"
                     disabled={mutation.isPending || mutation.isSuccess}
                     className="w-full"
                  >
                     {mutation.isPending ? "Sending..." : "Send reset link"}
                  </Button>
               </FieldGroup>
            </form>
         </CardContent>
         <CardFooter>
            <Button asChild variant="outline" className="w-full">
               <Link href="/login">Back to login</Link>
            </Button>
         </CardFooter>
      </Card>
   );
}
