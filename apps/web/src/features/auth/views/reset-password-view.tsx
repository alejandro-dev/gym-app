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
import { resetPasswordSchema } from "@/features/auth/schemas/reset-password.schema";
import { resetPassword } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const RESET_PASSWORD_ERROR_MESSAGES: StatusMessageMap = {
   400: "Enter a valid password.",
   401: "This reset link is invalid or has expired.",
   429: "Too many reset attempts. Please wait a few minutes and try again.",
   503: "The password reset service is temporarily unavailable.",
};

type ResetPasswordViewProps = {
   token?: string;
};

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [validationError, setValidationError] = useState<string | null>(null);

   const mutation = useMutation({
      mutationFn: resetPassword,
   });

   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (!token) {
         setValidationError("This reset link does not include a token.");
         return;
      }

      const result = resetPasswordSchema.safeParse({
         newPassword,
         confirmPassword,
      });

      if (!result.success) {
         setValidationError(result.error.issues[0]?.message ?? "Enter a valid password.");
         return;
      }

      setValidationError(null);
      mutation.mutate({
         token,
         newPassword: result.data.newPassword,
      });
   }

   const errorMessage = mutation.isError
      ? getStatusErrorMessage(
           mutation.error,
           RESET_PASSWORD_ERROR_MESSAGES,
           "We couldn't reset your password. Please request a new link and try again.",
        )
      : null;

   return (
      <Card>
         <CardHeader>
            <CardTitle>Create a new password</CardTitle>
            <CardDescription>
               Choose a new password for your Gym App account.
            </CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                     <div className="relative">
                        <Input
                           id="newPassword"
                           name="newPassword"
                           type={showPassword ? "text" : "password"}
                           value={newPassword}
                           onChange={(event) => setNewPassword(event.target.value)}
                           disabled={mutation.isPending || mutation.isSuccess}
                           className="pr-9"
                           required
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="absolute top-0 right-0 text-muted-foreground"
                           aria-label={showPassword ? "Hide password" : "Show password"}
                           aria-pressed={showPassword}
                           disabled={mutation.isPending || mutation.isSuccess}
                           onClick={() => setShowPassword((isVisible) => !isVisible)}
                        >
                           {showPassword ? (
                              <EyeOffIcon aria-hidden="true" />
                           ) : (
                              <EyeIcon aria-hidden="true" />
                           )}
                        </Button>
                     </div>
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                     <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        disabled={mutation.isPending || mutation.isSuccess}
                        required
                     />
                  </Field>
                  {validationError ? (
                     <FieldDescription className="text-destructive">
                        {validationError}
                     </FieldDescription>
                  ) : null}
                  {errorMessage ? (
                     <FieldDescription className="text-destructive">
                        {errorMessage}
                     </FieldDescription>
                  ) : null}
                  {mutation.isSuccess ? (
                     <FieldDescription>
                        {mutation.data.message ?? "Password reset successfully."}
                     </FieldDescription>
                  ) : null}
                  <Button
                     type="submit"
                     disabled={mutation.isPending || mutation.isSuccess}
                     className="w-full"
                  >
                     {mutation.isPending ? "Saving..." : "Save new password"}
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
