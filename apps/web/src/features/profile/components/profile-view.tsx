"use client"

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import {
   EyeIcon,
   EyeOffIcon,
   LockKeyholeIcon,
   ShieldCheckIcon,
   UserRoundIcon,
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
   changePassword,
   updateProfile,
   type ChangePasswordInput,
   type UpdateProfileInput,
} from "@/services/authService"
import type { User } from "@gym-app/types"

type ProfileForm = {
   firstName: string
   lastName: string
   weightKg: string
   heightCm: string
   birthDate: string
}

type PasswordForm = ChangePasswordInput & {
   confirmPassword: string
}

const roleLabels: Record<User["role"], string> = {
   ADMIN: "Administrador",
   COACH: "Coach",
   USER: "Usuario",
}

const profileSchema = z.object({
   firstName: z.string().trim().optional(),
   lastName: z.string().trim().optional(),
   weightKg: z.coerce.number().positive().max(400).optional(),
   heightCm: z.coerce.number().positive().max(260).optional(),
   birthDate: z.string().optional(),
})

const passwordSchema = z
   .object({
      currentPassword: z.string().min(8, "La contraseña actual debe tener al menos 8 caracteres"),
      newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
      confirmPassword: z.string().min(8, "Confirma la nueva contraseña"),
   })
   .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Las contraseñas no coinciden",
   })

function toDateInputValue(value: string | null) {
   return value ? value.slice(0, 10) : ""
}

function emptyToNull(value: string) {
   const trimmedValue = value.trim()
   return trimmedValue ? trimmedValue : null
}

function numberOrNull(value: string) {
   return value === "" ? null : Number(value)
}

function formatDate(value: string | null) {
   if (!value) return "Sin registrar"

   return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
   }).format(new Date(value))
}

function getInitials(user: User) {
   const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")
   const source = fullName || user.email
   return source
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
}

export function ProfileView({ initialUser }: { initialUser: User }) {
   const [user, setUser] = useState(initialUser)
   const [profileForm, setProfileForm] = useState<ProfileForm>({
      firstName: initialUser.firstName ?? "",
      lastName: initialUser.lastName ?? "",
      weightKg: initialUser.weightKg?.toString() ?? "",
      heightCm: initialUser.heightCm?.toString() ?? "",
      birthDate: toDateInputValue(initialUser.birthDate),
   })
   const [passwordForm, setPasswordForm] = useState<PasswordForm>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
   })
   const [showCurrentPassword, setShowCurrentPassword] = useState(false)
   const [showNewPassword, setShowNewPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)

   const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

   const accountMeta = useMemo(
      () => [
         { label: "Rol", value: roleLabels[user.role] },
         { label: "Alta", value: formatDate(user.createdAt) },
         { label: "Ultima actualizacion", value: formatDate(user.updatedAt) },
      ],
      [user],
   )

   const updateProfileMutation = useMutation({
      mutationFn: updateProfile,
      onSuccess: (updatedUser) => {
         setUser(updatedUser)
         setProfileForm({
            firstName: updatedUser.firstName ?? "",
            lastName: updatedUser.lastName ?? "",
            weightKg: updatedUser.weightKg?.toString() ?? "",
            heightCm: updatedUser.heightCm?.toString() ?? "",
            birthDate: toDateInputValue(updatedUser.birthDate),
         })
         toast.success("Perfil actualizado")
      },
      onError: (error) => {
         toast.error(error instanceof Error ? error.message : "No se pudo actualizar el perfil")
      },
   })

   const changePasswordMutation = useMutation({
      mutationFn: changePassword,
      onSuccess: () => {
         setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
         })
         toast.success("Contraseña actualizada")
      },
      onError: (error) => {
         toast.error(error instanceof Error ? error.message : "No se pudo cambiar la contraseña")
      },
   })

   const readProfileData = (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target
      setProfileForm((current) => ({ ...current, [name]: value }))
   }

   const readPasswordData = (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target
      setPasswordForm((current) => ({ ...current, [name]: value }))
   }

   const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const result = profileSchema.safeParse({
         firstName: profileForm.firstName || undefined,
         lastName: profileForm.lastName || undefined,
         weightKg: profileForm.weightKg || undefined,
         heightCm: profileForm.heightCm || undefined,
         birthDate: profileForm.birthDate || undefined,
      })

      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Revisa los datos del perfil")
         return
      }

      const payload: UpdateProfileInput = {
         firstName: emptyToNull(profileForm.firstName),
         lastName: emptyToNull(profileForm.lastName),
         weightKg: numberOrNull(profileForm.weightKg),
         heightCm: numberOrNull(profileForm.heightCm),
         birthDate: profileForm.birthDate
            ? new Date(profileForm.birthDate).toISOString()
            : null,
      }

      await updateProfileMutation.mutateAsync(payload)
   }

   const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const result = passwordSchema.safeParse(passwordForm)

      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Revisa las contraseñas")
         return
      }

      await changePasswordMutation.mutateAsync({
         currentPassword: result.data.currentPassword,
         newPassword: result.data.newPassword,
      })
   }

   const isProfileLoading = updateProfileMutation.isPending
   const isPasswordLoading = changePasswordMutation.isPending

   return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
         <div className="px-4 lg:px-6">
            <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
               <Card>
                  <CardHeader>
                     <div className="flex items-start gap-4">
                        <Avatar className="size-14 rounded-2xl">
                           <AvatarFallback className="rounded-2xl bg-primary/18 font-display text-lg text-primary">
                              {getInitials(user)}
                           </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                           <CardTitle className="truncate">{displayName}</CardTitle>
                           <CardDescription className="truncate">{user.email}</CardDescription>
                           <Badge variant="secondary" className="mt-3">
                              <ShieldCheckIcon data-icon="inline-start" />
                              {roleLabels[user.role]}
                           </Badge>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                     <Separator />
                     <div className="flex flex-col gap-3">
                        {accountMeta.map((item) => (
                           <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="text-right font-medium">{item.value}</span>
                           </div>
                        ))}
                     </div>
                     <Separator />
                     <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-border bg-muted/20 p-3">
                           <p className="text-muted-foreground">Peso</p>
                           <p className="mt-1 font-medium">
                              {user.weightKg ? `${user.weightKg} kg` : "Sin registrar"}
                           </p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/20 p-3">
                           <p className="text-muted-foreground">Altura</p>
                           <p className="mt-1 font-medium">
                              {user.heightCm ? `${user.heightCm} cm` : "Sin registrar"}
                           </p>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Tabs defaultValue="profile" className="w-full">
                  <TabsList>
                     <TabsTrigger value="profile">
                        <UserRoundIcon />
                        Datos
                     </TabsTrigger>
                     <TabsTrigger value="password">
                        <LockKeyholeIcon />
                        Contraseña
                     </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile">
                     <Card>
                        <CardHeader>
                           <CardTitle>Informacion personal</CardTitle>
                           <CardDescription>
                              Mantén actualizados los datos visibles en tu cuenta.
                           </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <form onSubmit={handleProfileSubmit}>
                              <FieldGroup>
                                 <div className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                       <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                                       <Input
                                          id="firstName"
                                          name="firstName"
                                          value={profileForm.firstName}
                                          onChange={readProfileData}
                                          disabled={isProfileLoading}
                                       />
                                    </Field>
                                    <Field>
                                       <FieldLabel htmlFor="lastName">Apellidos</FieldLabel>
                                       <Input
                                          id="lastName"
                                          name="lastName"
                                          value={profileForm.lastName}
                                          onChange={readProfileData}
                                          disabled={isProfileLoading}
                                       />
                                    </Field>
                                 </div>
                                 <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input id="email" value={user.email} disabled />
                                    <FieldDescription>
                                       El email se usa para iniciar sesion y no se edita desde esta vista.
                                    </FieldDescription>
                                 </Field>
                                 <div className="grid gap-4 md:grid-cols-3">
                                    <Field>
                                       <FieldLabel htmlFor="weightKg">Peso (kg)</FieldLabel>
                                       <Input
                                          id="weightKg"
                                          name="weightKg"
                                          type="number"
                                          min="1"
                                          max="400"
                                          step="0.1"
                                          value={profileForm.weightKg}
                                          onChange={readProfileData}
                                          disabled={isProfileLoading}
                                       />
                                    </Field>
                                    <Field>
                                       <FieldLabel htmlFor="heightCm">Altura (cm)</FieldLabel>
                                       <Input
                                          id="heightCm"
                                          name="heightCm"
                                          type="number"
                                          min="1"
                                          max="260"
                                          step="1"
                                          value={profileForm.heightCm}
                                          onChange={readProfileData}
                                          disabled={isProfileLoading}
                                       />
                                    </Field>
                                    <Field>
                                       <FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
                                       <Input
                                          id="birthDate"
                                          name="birthDate"
                                          type="date"
                                          value={profileForm.birthDate}
                                          onChange={readProfileData}
                                          disabled={isProfileLoading}
                                       />
                                    </Field>
                                 </div>
                                 <Field>
                                    <Button type="submit" className="w-fit" disabled={isProfileLoading}>
                                       {isProfileLoading ? "Guardando..." : "Guardar cambios"}
                                    </Button>
                                 </Field>
                              </FieldGroup>
                           </form>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="password">
                     <Card>
                        <CardHeader>
                           <CardTitle>Seguridad</CardTitle>
                           <CardDescription>
                              Cambia tu contraseña usando tu clave actual.
                           </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <form onSubmit={handlePasswordSubmit}>
                              <FieldGroup>
                                 <Field>
                                    <FieldLabel htmlFor="currentPassword">Contraseña actual</FieldLabel>
                                    <div className="relative">
                                       <Input
                                          id="currentPassword"
                                          name="currentPassword"
                                          type={showCurrentPassword ? "text" : "password"}
                                          value={passwordForm.currentPassword}
                                          onChange={readPasswordData}
                                          disabled={isPasswordLoading}
                                          className="pr-9"
                                          required
                                       />
                                       <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute top-0 right-0 text-muted-foreground"
                                          aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                          aria-pressed={showCurrentPassword}
                                          disabled={isPasswordLoading}
                                          onClick={() => setShowCurrentPassword((isVisible) => !isVisible)}
                                       >
                                          {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                                       </Button>
                                    </div>
                                 </Field>
                                 <div className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                       <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
                                       <div className="relative">
                                          <Input
                                             id="newPassword"
                                             name="newPassword"
                                             type={showNewPassword ? "text" : "password"}
                                             value={passwordForm.newPassword}
                                             onChange={readPasswordData}
                                             disabled={isPasswordLoading}
                                             className="pr-9"
                                             required
                                          />
                                          <Button
                                             type="button"
                                             variant="ghost"
                                             size="icon"
                                             className="absolute top-0 right-0 text-muted-foreground"
                                             aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                             aria-pressed={showNewPassword}
                                             disabled={isPasswordLoading}
                                             onClick={() => setShowNewPassword((isVisible) => !isVisible)}
                                          >
                                             {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                                          </Button>
                                       </div>
                                    </Field>
                                    <Field>
                                       <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
                                       <div className="relative">
                                          <Input
                                             id="confirmPassword"
                                             name="confirmPassword"
                                             type={showConfirmPassword ? "text" : "password"}
                                             value={passwordForm.confirmPassword}
                                             onChange={readPasswordData}
                                             disabled={isPasswordLoading}
                                             className="pr-9"
                                             required
                                          />
                                          <Button
                                             type="button"
                                             variant="ghost"
                                             size="icon"
                                             className="absolute top-0 right-0 text-muted-foreground"
                                             aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                             aria-pressed={showConfirmPassword}
                                             disabled={isPasswordLoading}
                                             onClick={() => setShowConfirmPassword((isVisible) => !isVisible)}
                                          >
                                             {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                          </Button>
                                       </div>
                                    </Field>
                                 </div>
                                 <Field>
                                    <Button type="submit" className="w-fit" disabled={isPasswordLoading}>
                                       {isPasswordLoading ? "Actualizando..." : "Actualizar contraseña"}
                                    </Button>
                                 </Field>
                              </FieldGroup>
                           </form>
                        </CardContent>
                     </Card>
                  </TabsContent>
               </Tabs>
            </div>
         </div>
      </div>
   )
}
