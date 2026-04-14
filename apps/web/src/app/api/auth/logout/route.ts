import { NextResponse } from "next/server";

import { clearSessionCookies } from "@/lib/auth-cookies";
import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";

type LogoutResponse = {
   message?: string;
};

export async function POST() {
   let response: NextResponse<LogoutResponse>;

   try {
      const payload = await backendFetch<LogoutResponse>("/api/auth/logout", {
         method: "POST",
      });

      response = NextResponse.json(payload);
   } catch (error) {
      if (!(error instanceof ErrorCode && error.status === 401)) {
         console.error("Logout API error:", error);
      }

      response = NextResponse.json({ message: "Logged out locally" });
   }

   clearSessionCookies(response);

   return response;
}
