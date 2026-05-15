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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useResetPassword } from "../hooks/use-reset-password";

type ResetPasswordViewProps = {
   token?: string;
};

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
   const {
      newPassword,
      confirmPassword,
      showPassword,
      setNewPassword,
      setConfirmPassword,
      setShowPassword,
      validationError,
      errorMessage,
      mutation,
      handleSubmit,
   } = useResetPassword(token);

   return (
      <Card>
         <CardHeader>
            <CardTitle>Crear nueva contraseña</CardTitle>
            <CardDescription>
               Elige una nueva contraseña para tu cuenta de Gym App.
            </CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
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
                     <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
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
                     {mutation.isPending ? "Guardando..." : "Guardar nueva contraseña"}
                  </Button>
               </FieldGroup>
            </form>
         </CardContent>
         <CardFooter>
            <Button asChild variant="outline" className="w-full">
               <Link href="/login">Volver al iniciar sesión</Link>
            </Button>
         </CardFooter>
      </Card>
   );
}
