import { ResetPasswordView } from "@/features/auth/views/reset-password-view";

type ResetPasswordPageProps = {
   searchParams: Promise<{
      token?: string | string[];
   }>;
};

export default async function ResetPasswordPage({
   searchParams,
}: ResetPasswordPageProps) {
   const params = await searchParams;
   const tokenParam = params.token;
   const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

   return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
         <div className="w-full max-w-md">
            <ResetPasswordView token={token} />
         </div>
      </div>
   );
}
