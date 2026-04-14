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
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"

export default function LoginView() {
   const { credentials, handleSubmit, isLoading, readData } = useAuthLogin()
   const [showPassword, setShowPassword] = useState(false)

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
                           <div className="relative">
                              <Input
                                 id="password"
                                 name="password"
                                 type={showPassword ? "text" : "password"}
                                 value={credentials.password}
                                 onChange={readData}
                                 disabled={isLoading}
                                 className="pr-9"
                                 required
                              />
                              <Button
                                 type="button"
                                 variant="ghost"
                                 size="icon"
                                 className="absolute top-0 right-0 text-muted-foreground"
                                 aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                 aria-pressed={showPassword}
                                 disabled={isLoading}
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
