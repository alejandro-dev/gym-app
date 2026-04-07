import { NextResponse } from "next/server";

export async function POST(req: Request) {
   const body = await req.json();

   try {
      const res = await fetch(`${process.env.NEST_API_URL}/api/auth/verify-email`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type");
      const isJson = contentType?.includes("application/json");
      const payload = isJson ? await res.json() : null;

      if (!res.ok) {
         return NextResponse.json(
            {
               message: payload?.message ?? "Email verification failed",
               status: res.status,
            },
            { status: res.status },
         );
      }

      return NextResponse.json(payload);
   } catch (error) {
      console.error("Verify email API error:", error);

      return NextResponse.json(
         {
            message: "Service unavailable",
            status: 503,
         },
         { status: 503 },
      );
   }
}
