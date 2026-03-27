import { VerifyEmailView } from "@/features/auth/views/verify-email-view";

type VerifyEmailPageProps = {
   searchParams: Promise<{
      token?: string | string[];
   }>;
};

export default async function VerifyEmailPage({
   searchParams,
}: VerifyEmailPageProps) {
   const params = await searchParams;
   const tokenParam = params.token;
   const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

   return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
         <div className="w-full max-w-md">
            <VerifyEmailView token={token} />
         </div>
      </div>
   );
}
