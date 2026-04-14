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
import { useAuthRegister } from "@/features/auth/hooks/use-auth-register"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"

export function RegisterView() {
   const { credentials, handleSubmit, isLoading, readData } = useAuthRegister()
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)

   return (
      <div className="flex flex-col gap-6">
         <Card>
            <CardHeader>
               <CardTitle>Crear una cuenta</CardTitle>
               <CardDescription>
                  Completa el formulario a continuación para crear una nueva cuenta y comenzar tu viaje fitness con nosotros.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit}>
                  <FieldGroup>
                     <div className="grid gap-4 md:grid-cols-2">
                        <Field className="md:col-span-2">
                           <FieldLabel htmlFor="email">
                              Email <span className="text-destructive">*</span>
                           </FieldLabel>
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
                           <FieldDescription>
                             Usaremos esta información para ponernos en contacto contigo. No compartiremos tu correo electrónico con nadie más.
                           </FieldDescription>
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="username">
                              Username
                           </FieldLabel>
                           <Input
                              id="username"
                              name="username"
                              type="text"
                              placeholder="alextrainer"
                              value={credentials.username ?? ""}
                              onChange={readData}
                              disabled={isLoading}
                           />
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
                           <Input
                              id="birthDate"
                              name="birthDate"
                              type="date"
                              value={credentials.birthDate ?? ""}
                              onChange={readData}
                              disabled={isLoading}
                           />
                        </Field>
                     </div>
                     <Field>
                        <FieldLabel htmlFor="password">
                           Contraseña <span className="text-destructive">*</span>
                        </FieldLabel>
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
                        <FieldDescription>
                           Debe tener al menos 8 caracteres.
                        </FieldDescription>
                     </Field>
                     <Field>
                        <FieldLabel htmlFor="confirmPassword">
                           Confirmar Contraseña <span className="text-destructive">*</span>
                        </FieldLabel>
                        <div className="relative">
                           <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={credentials.confirmPassword}
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
                              aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                              aria-pressed={showConfirmPassword}
                              disabled={isLoading}
                              onClick={() => setShowConfirmPassword((isVisible) => !isVisible)}
                           >
                              {showConfirmPassword ? (
                                 <EyeOffIcon aria-hidden="true" />
                              ) : (
                                 <EyeIcon aria-hidden="true" />
                              )}
                           </Button>
                        </div>
                        <FieldDescription>Por favor confirma tu contraseña.</FieldDescription>
                     </Field>
                     <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                           <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                           <Input
                              id="firstName"
                              name="firstName"
                              type="text"
                              placeholder="John"
                              value={credentials.firstName ?? ""}
                              onChange={readData}
                              disabled={isLoading}
                           />
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="lastName">Apellidos</FieldLabel>
                           <Input
                              id="lastName"
                              name="lastName"
                              type="text"
                              placeholder="Doe"
                              value={credentials.lastName ?? ""}
                              onChange={readData}
                              disabled={isLoading}
                           />
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="weightKg">Peso (kg)</FieldLabel>
                           <Input
                              id="weightKg"
                              name="weightKg"
                              type="number"
                              inputMode="decimal"
                              placeholder="87"
                              value={credentials.weightKg ?? ""}
                              onChange={readData}
                              disabled={isLoading}
                           />
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="heightCm">Altura (cm)</FieldLabel>
                           <Input
                              id="heightCm"
                              name="heightCm"
                              type="number"
                              inputMode="decimal"
                              placeholder="175"
                              value={credentials.heightCm ?? ""}
                              onChange={readData}
                              disabled={isLoading}
                           />
                        </Field>
                     </div>
                     <Field>
                        <Button type="submit" disabled={isLoading} className="w-full">
                           {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                        </Button>
                        <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
                           Registrarse con Google
                        </Button>
                        <FieldDescription className="px-6 text-center">
                           ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
                        </FieldDescription>
                     </Field>
                  </FieldGroup>
               </form>
            </CardContent>
         </Card>
      </div>
   )
}
