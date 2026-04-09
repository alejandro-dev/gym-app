"use client"

import { Button } from "@/components/ui/button"
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card"
import {
   Field,
   FieldDescription,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthLogin } from "@/features/auth/hooks/use-auth-login"

export default function LoginView() {
   const { credentials, handleSubmit, isLoading, readData } = useAuthLogin()

   return (
      <>
         <div className="flex flex-col gap-6">
            <Card>
               <CardHeader>
                  <CardTitle>Inicia sesión con tu cuenta</CardTitle>
                  <CardDescription>
                     Ingresa tus credenciales para acceder a tu cuenta y disfrutar de nuestros servicios.
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
                              placeholder="m@example.com"
                              value={credentials.email}
                              onChange={readData}
                              disabled={isLoading}
                              required
                           />
                        </Field>
                        <Field>
                           <div className="flex items-center">
                              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                              <a
                                 href="#"
                                 className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                              >
                                 ¿Olvidaste tu contraseña?
                              </a>
                           </div>
                           <Input
                              id="password"
                              name="password"
                              type="password"
                              value={credentials.password}
                              onChange={readData}
                              disabled={isLoading}
                              required
                           />
                        </Field>
                        <Field>
                           <Button type="submit" disabled={isLoading} className="w-full">
                              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                           </Button>
                           <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
                              Iniciar sesión con Google
                           </Button>
                           <FieldDescription className="text-center">
                              ¿No tienes una cuenta? <a href="/register">Resgístrate</a>
                           </FieldDescription>
                        </Field>
                     </FieldGroup>
                  </form>
               </CardContent>
            </Card>
         </div>
      </>
   )
}
