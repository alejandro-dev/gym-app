"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { verifyEmail } from "@/services/authService";

const VERIFY_EMAIL_ERROR_MESSAGES: StatusMessageMap = {
   400: "Verification token is missing.",
   401: "This verification link is invalid or has expired.",
   503: "The verification service is temporarily unavailable.",
};

type VerifyEmailStatus =
   | { type: "loading"; title: string; description: string }
   | { type: "success"; title: string; description: string }
   | { type: "error"; title: string; description: string };

/**
 * Ejecuta la verificación del email desde el token recibido por URL.
 *
 * @param token - Token de verificación incluido en el enlace del correo
 * @returns Estado visual y helpers para la pantalla de verificación
 */
export function useAuthVerifyEmail(token?: string) {
   const router = useRouter();
   const hasRequestedRef = useRef(false);

   const mutation = useMutation({
      mutationFn: verifyEmail,
   });

   useEffect(() => {
      if (!token || hasRequestedRef.current) return;

      hasRequestedRef.current = true;
      mutation.mutate({ token });
   }, [mutation, token]);

   let status: VerifyEmailStatus;

   if (!token) {
      status = {
         type: "error",
         title: "Verification link unavailable",
         description:
            "We couldn't find a verification token in this link. Open the latest email and try again.",
      };
   } else if (mutation.isPending) {
      status = {
         type: "loading",
         title: "Verifying your email",
         description: "We're validating your email address. This usually takes a moment.",
      };
   } else if (mutation.isSuccess) {
      status = {
         type: "success",
         title: "Email verified",
         description:
            mutation.data.message ?? "Your email has been verified successfully. You can now sign in.",
      };
   } else if (mutation.isError) {
      status = {
         type: "error",
         title: "We couldn't verify your email",
         description: getStatusErrorMessage(
            mutation.error,
            VERIFY_EMAIL_ERROR_MESSAGES,
            "We couldn't verify your email. Please request a new link and try again.",
         ),
      };
   } else {
      status = {
         type: "loading",
         title: "Preparing verification",
         description: "We're getting everything ready to validate your email.",
      };
   }

   return {
      status,
      goToLogin: () => router.push("/login"),
      loginHref: "/login",
      registerHref: "/register",
      Link,
   };
}
