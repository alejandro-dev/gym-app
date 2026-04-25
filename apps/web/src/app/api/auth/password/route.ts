import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";

type ChangePasswordResponse = {
   message?: string;
};

export async function PATCH(req: Request) {
   const body = await req.json();

   try {
      const payload = await backendFetch<ChangePasswordResponse>(
         "/api/auth/me/password",
         {
            method: "PATCH",
            body: JSON.stringify(body),
         },
      );

      return NextResponse.json(payload);
   } catch (error) {
      if (error instanceof ErrorCode) {
         return NextResponse.json(
            { message: error.message },
            { status: error.status },
         );
      }

      console.error("Change password API error:", error);
      return NextResponse.json(
         { message: "Unexpected error" },
         { status: 500 },
      );
   }
}
