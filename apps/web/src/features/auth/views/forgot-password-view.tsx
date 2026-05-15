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
import Link from "next/link";
import { useForgotPassword } from "../hooks/use-forgot-password";



export function ForgotPasswordView() {
   const { email, setEmail, validationError, errorMessage, mutation, handleSubmit } = useForgotPassword();

   return (
      <Card>
         <CardHeader>
            <CardTitle>Restablecer contraseña</CardTitle>
            <CardDescription>
               Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
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
                           "Si la cuenta existe, se ha enviado un correo con instrucciones para restablecer la contraseña."}
                     </FieldDescription>
                  ) : null}
                  <Button
                     type="submit"
                     disabled={mutation.isPending || mutation.isSuccess}
                     className="w-full"
                  >
                     {mutation.isPending ? "Enviando..." : "Enviar enlace de restablecimiento"}
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
