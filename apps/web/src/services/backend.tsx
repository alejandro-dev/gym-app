import { cookies } from "next/headers";
import { ErrorCode } from "./errors/ErrorCode";

export async function backendFetch<T>(path: string, options?: RequestInit): Promise<T> {
   // `cookies()` can be asynchronous in your environment/types; await it
   const token = (await cookies()).get("token")?.value;

   const res = await fetch(`${process.env.NEST_API_URL}${path}`, {
      ...options,
      headers: {
         "Content-Type": "application/json",
         ...(options?.headers || {}),
         ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: options?.cache ?? "no-store", // Si no se especifica, no se usa caché.
   });

   const data = await res.json().catch(() => null);

   if (!res.ok) {
      throw new ErrorCode(
         data?.message || "Unexpected error",
         res.status
      );
   }

   return data;
}
