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
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                     Enter your email below to login to your account
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
                              <FieldLabel htmlFor="password">Password</FieldLabel>
                              <a
                                 href="#"
                                 className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                              >
                                 Forgot your password?
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
                              {isLoading ? "Logging in..." : "Login"}
                           </Button>
                           <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
                              Login with Google
                           </Button>
                           <FieldDescription className="text-center">
                              Don&apos;t have an account? <a href="/register">Sign up</a>
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
