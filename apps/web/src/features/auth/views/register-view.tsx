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

export function RegisterView() {
   const { credentials, handleSubmit, isLoading, readData } = useAuthRegister()

   return (
      <div className="flex flex-col gap-6">
         <Card>
            <CardHeader>
               <CardTitle>Create an account</CardTitle>
               <CardDescription>
                  Enter your information below to create your account
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
                              We&apos;ll use this to contact you. We will not share your email
                              with anyone else.
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
                           <FieldLabel htmlFor="birthDate">Birth date</FieldLabel>
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
                           Password <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                           id="password"
                           name="password"
                           type="password"
                           value={credentials.password}
                           onChange={readData}
                           disabled={isLoading}
                           required
                        />
                        <FieldDescription>
                           Must be at least 8 characters long.
                        </FieldDescription>
                     </Field>
                     <Field>
                        <FieldLabel htmlFor="confirmPassword">
                           Confirm Password <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                           id="confirmPassword"
                           name="confirmPassword"
                           type="password"
                           value={credentials.confirmPassword}
                           onChange={readData}
                           disabled={isLoading}
                           required
                        />
                        <FieldDescription>Please confirm your password.</FieldDescription>
                     </Field>
                     <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                           <FieldLabel htmlFor="firstName">First Name</FieldLabel>
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
                           <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
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
                           <FieldLabel htmlFor="weightKg">Weight (kg)</FieldLabel>
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
                           <FieldLabel htmlFor="heightCm">Height (cm)</FieldLabel>
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
                           {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                        <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
                           Sign up with Google
                        </Button>
                        <FieldDescription className="px-6 text-center">
                           Already have an account? <a href="/login">Sign in</a>
                        </FieldDescription>
                     </Field>
                  </FieldGroup>
               </form>
            </CardContent>
         </Card>
      </div>
   )
}
