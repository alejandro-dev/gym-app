import { NextResponse } from "next/server";

export async function POST(req: Request) {
   const body = await req.json();

   try {
      const res = await fetch(`${process.env.NEST_API_URL}/api/auth/reset-password`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
      });

      const payload = await res.json().catch(() => null);

      return NextResponse.json(payload, { status: res.status });
   } catch (error) {
      console.error("Reset password API error:", error);

      return NextResponse.json(
         {
            message: "Service unavailable",
            status: 503,
         },
         { status: 503 },
      );
   }
}
